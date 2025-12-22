use std::{net::IpAddr, sync::LazyLock};

use futures::TryStreamExt;
use rtnetlink::{new_connection, packet_route::neighbour::NeighbourMessage};
use tokio::runtime::Handle;

use crate::{
    arp::{Table, TableRow},
    mac::MacAddr,
};

pub fn table() -> Result<Table, ()> {
    tokio::task::block_in_place(|| {
        Handle::current().block_on(async {
            static HANDLE: LazyLock<rtnetlink::Handle> = LazyLock::new(|| {
                let (conn, handle, _) = new_connection().unwrap();
                tokio::spawn(conn);
                handle
            });

            let mut neighbors = HANDLE.neighbours /* yuck */ ().get().execute();
            let mut result = vec![];

            while let Some(msg) = neighbors
                .try_next()
                .await
                .inspect_err(|e| eprintln!("failed to stream neighbor: {e}"))
                .map_err(|_| ())?
            {
                result.push(match TableRow::try_from(msg) {
                    Ok(row) => row,
                    Err(_) => continue,
                });
            }

            Ok(Table(result))
        })
    })
}

impl TryFrom<NeighbourMessage> for TableRow {
    type Error = ();

    fn try_from(value: NeighbourMessage) -> Result<Self, Self::Error> {
        use rtnetlink::packet_route::neighbour::{NeighbourAddress, NeighbourAttribute};

        let mut ip = None;
        let mut mac = None;

        for attr in value.attributes.into_iter() {
            match attr {
                NeighbourAttribute::Destination(NeighbourAddress::Inet(ipv4)) => {
                    ip = Some(IpAddr::V4(ipv4));
                }

                NeighbourAttribute::Destination(NeighbourAddress::Inet6(ipv6)) => {
                    ip = Some(IpAddr::V6(ipv6));
                }

                NeighbourAttribute::LinkLocalAddress(mac_raw) => {
                    mac = Some(MacAddr::try_from(mac_raw.as_slice()).map_err(|_| ())?);
                }

                _ => (),
            }

            if ip.is_some() && mac.is_some() {
                break;
            }
        }

        match (ip, mac) {
            (Some(ip), Some(mac)) => Ok(Self { ip, mac }),
            _ => Err(()),
        }
    }
}
