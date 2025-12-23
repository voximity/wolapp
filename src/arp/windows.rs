use std::{
    collections::HashSet,
    net::{IpAddr, Ipv4Addr, Ipv6Addr},
};

use windows::Win32::{
    NetworkManagement::IpHelper::{FreeMibTable, GetIpNetTable2, MIB_IPNET_ROW2, MIB_IPNET_TABLE2},
    Networking::WinSock::{AF_INET, AF_INET6, AF_UNSPEC},
};

use crate::{
    arp::{Table, TableRow},
    mac::MacAddr,
};

pub fn table() -> Result<Table, ()> {
    unsafe {
        let mut table = std::ptr::null_mut::<MIB_IPNET_TABLE2>();
        if GetIpNetTable2(AF_UNSPEC, &raw mut table).is_err() {
            return Err(());
        }

        if table.is_null() {
            return Err(());
        }

        let mut result = HashSet::new();
        let base = &(*table).Table as *const MIB_IPNET_ROW2;
        for i in 0..(*table).NumEntries {
            let row = *base.offset(i as isize);
            result.insert(match TableRow::try_from(row) {
                Ok(r) => r,
                Err(_) => continue,
            });
        }

        FreeMibTable(table as _);

        Ok(Table(result))
    }
}

impl TryFrom<MIB_IPNET_ROW2> for TableRow {
    type Error = ();
    fn try_from(value: MIB_IPNET_ROW2) -> Result<Self, ()> {
        let ip = unsafe {
            match value.Address.si_family {
                AF_INET => IpAddr::V4(Ipv4Addr::new(
                    value.Address.Ipv4.sin_addr.S_un.S_un_b.s_b1,
                    value.Address.Ipv4.sin_addr.S_un.S_un_b.s_b2,
                    value.Address.Ipv4.sin_addr.S_un.S_un_b.s_b3,
                    value.Address.Ipv4.sin_addr.S_un.S_un_b.s_b4,
                )),
                AF_INET6 => IpAddr::V6(Ipv6Addr::from_octets(value.Address.Ipv6.sin6_addr.u.Byte)),
                _ => return Err(()),
            }
        };

        let mac = match value.PhysicalAddressLength {
            6 => MacAddr(value.PhysicalAddress[..6].try_into().unwrap()),
            _ => return Err(()),
        };

        Ok(Self { ip, mac })
    }
}
