use std::{borrow::Cow, fmt::Display};

use serde::{Deserialize, Serialize, de::Visitor};
use sqlx::{
    Decode, Encode, Sqlite,
    encode::IsNull,
    sqlite::{SqliteArgumentValue, SqliteTypeInfo, SqliteValueRef},
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct MacAddr(pub [u8; 6]);

impl Display for MacAddr {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
            self.0[0], self.0[1], self.0[2], self.0[3], self.0[4], self.0[5]
        )
    }
}

impl sqlx::Type<Sqlite> for MacAddr {
    fn type_info() -> SqliteTypeInfo {
        <&[u8] as sqlx::Type<Sqlite>>::type_info()
    }
}

impl<'r> Decode<'r, Sqlite> for MacAddr {
    fn decode(value: SqliteValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let slice = <&[u8] as Decode<Sqlite>>::decode(value)?;
        if slice.len() != 6 {
            return Err("mac addresses are 6 bytes".into());
        }

        Ok(Self(slice[..6].try_into().unwrap()))
    }
}

impl<'q> Encode<'q, Sqlite> for MacAddr {
    fn encode_by_ref(
        &self,
        buf: &mut <Sqlite as sqlx::Database>::ArgumentBuffer<'q>,
    ) -> Result<sqlx::encode::IsNull, sqlx::error::BoxDynError> {
        buf.push(SqliteArgumentValue::Blob(Cow::Owned(self.0.to_vec())));
        Ok(IsNull::No)
    }
}

impl Serialize for MacAddr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        format!(
            "{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
            self.0[0], self.0[1], self.0[2], self.0[3], self.0[4], self.0[5]
        )
        .serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for MacAddr {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_str(MacAddrVisitor)
    }
}

struct MacAddrVisitor;

impl<'de> Visitor<'de> for MacAddrVisitor {
    type Value = MacAddr;

    fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "mac address 01:23:45:67:89:ab")
    }

    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        use serde::de::Error;

        let mut iter = v.split(':').map(|b| u8::from_str_radix(b, 16));
        let mut arr = [0u8; 6];
        for slot in &mut arr {
            *slot = iter
                .next()
                .ok_or_else(|| Error::custom("mac address needs 6 bytes"))?
                .map_err(|_| Error::custom("invalid mac address bytes"))?;
        }

        if iter.next().is_some() {
            return Err(Error::custom("mac address needs 6 bytes"));
        }

        Ok(MacAddr(arr))
    }
}
