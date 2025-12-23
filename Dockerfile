# build frontend
FROM node:24 AS frontend
WORKDIR /frontend
COPY frontend/ .
RUN npm install && npm run build

# build backend
FROM rust:alpine AS backend
WORKDIR /backend
COPY . .
RUN cargo build --release

# runtime
FROM alpine
WORKDIR /app
COPY --from=frontend /frontend/dist ./frontend/dist
COPY --from=backend /backend/target/release/wolapp .
ENTRYPOINT ["./wolapp"]
