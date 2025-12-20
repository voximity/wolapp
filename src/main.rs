mod mac;

use std::{net::SocketAddr, sync::Arc};

use anyhow::Result as Anyhow;
use axum::{
    Json, Router,
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{delete, get, post},
};
use serde::{Deserialize, Serialize};
use sqlx::{
    Pool, Sqlite, SqlitePool, migrate::Migrator, prelude::FromRow, sqlite::SqliteConnectOptions,
};
use tokio::net::{TcpListener, UdpSocket};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

use crate::mac::MacAddr;

static MIGRATOR: Migrator = sqlx::migrate!();

struct AppState {
    db: Pool<Sqlite>,
}

#[tokio::main]
async fn main() -> Anyhow<()> {
    let port = {
        const DEFAULT_PORT: u16 = 8080;

        match std::env::var("APP_PORT").ok() {
            Some(value) => value
                .parse()
                .expect("could not parse APP_PORT environment variable"),
            None => DEFAULT_PORT,
        }
    };

    // init db
    let db_options = SqliteConnectOptions::new()
        .filename("wol.db")
        .create_if_missing(true);
    let db = SqlitePool::connect_with(db_options).await?;
    MIGRATOR.run(&db).await?;

    // api router
    let app = Router::new().nest(
        "/api",
        Router::new()
            .route("/machines", get(get_machines))
            .route("/machines", post(add_machine))
            .route("/machines", delete(delete_machine))
            .route("/machines/wake", post(wake_machine)),
    );

    // in release mode, we can target the `frontend` distribution
    #[cfg(not(debug_assertions))]
    let app = app
        .nest_service(
            "/assets",
            tower_http::services::ServeDir::new("frontend/dist/assets"),
        )
        .fallback_service(tower_http::services::ServeDir::new("frontend/dist"))
        .fallback_service(tower_http::services::ServeFile::new(
            "frontend/dist/index.html",
        ));

    // extra app stuff
    let app = app
        .layer(ServiceBuilder::new().layer(CorsLayer::permissive()))
        .with_state(Arc::new(AppState { db }));

    // wheee
    let listener = TcpListener::bind(SocketAddr::from(([0, 0, 0, 0], port))).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

#[derive(FromRow, Serialize, Deserialize)]
struct Machine {
    name: String,
    mac: MacAddr,
}

async fn get_machines(State(state): State<Arc<AppState>>) -> Response {
    let Ok(rows) = sqlx::query_as::<_, Machine>("SELECT name, mac FROM machines")
        .fetch_all(&state.db)
        .await
    else {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    };

    Json(rows).into_response()
}

async fn add_machine(State(state): State<Arc<AppState>>, Json(machine): Json<Machine>) -> Response {
    if let Err(e) = sqlx::query("INSERT INTO machines (name, mac) VALUES ($1, $2)")
        .bind(&machine.name)
        .bind(machine.mac.0.as_slice())
        .execute(&state.db)
        .await
    {
        eprintln!(
            "warn: failed to insert machine (name {}, mac {}): {e}",
            machine.name, machine.mac
        );

        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    StatusCode::OK.into_response()
}

#[derive(Deserialize)]
struct DeleteMachineQuery {
    name: String,
}

async fn delete_machine(
    State(state): State<Arc<AppState>>,
    Query(DeleteMachineQuery { name }): Query<DeleteMachineQuery>,
) -> Response {
    if let Err(e) = sqlx::query("DELETE FROM machines WHERE name = $1")
        .bind(&name)
        .execute(&state.db)
        .await
    {
        eprintln!("warn: failed to delete machine (name {}): {e}", name);

        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    StatusCode::OK.into_response()
}

#[derive(Deserialize)]
struct WakeMachineQuery {
    mac: MacAddr,
}

async fn wake_machine(Query(WakeMachineQuery { mac }): Query<WakeMachineQuery>) -> Response {
    let sock = UdpSocket::bind("0.0.0.0:0").await.unwrap();
    sock.set_broadcast(true).unwrap();

    // assemble WoL magic packet:
    // FF FF FF FF FF FF
    // 01 23 45 67 89 ab - mac address repeated 16 times
    let mut payload = [0u8; 6 + 16 * 6];
    payload[0..6].fill(0xFF);
    for chunk in payload[6..].as_chunks_mut::<6>().0 {
        chunk.copy_from_slice(&mac.0);
    }

    // broadcast on port 7
    sock.send_to(&payload, "255.255.255.255:7").await.unwrap();

    StatusCode::OK.into_response()
}
