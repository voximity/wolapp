use std::net::IpAddr;

use crate::mac::MacAddr;
use serde::Serialize;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::table;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::table;

#[cfg(target_os = "macos")]
compile_error!("no support for ARP table lookup on macos yet :(");

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
pub struct TableRow {
    pub ip: IpAddr,
    pub mac: MacAddr,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Table(pub Vec<TableRow>);

impl Table {
    /// Try to fetch a MAC address for a given IP.
    pub fn macs_from_ip(&self, ip: IpAddr) -> Vec<MacAddr> {
        self.0
            .iter()
            .filter(|row| row.ip == ip)
            .map(|row| row.mac)
            .collect()
    }
}
