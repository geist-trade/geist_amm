use uint::construct_uint;
use std::borrow::BorrowMut;
use std::mem::size_of;
use crate::errors::GeistError;
use std::io::{Error, ErrorKind, Write};
use borsh::{BorshDeserialize, BorshSerialize};

construct_uint! {
    pub struct U256(4);
}

impl U256 {
    /// Convert [U256] to u64
    pub fn to_u64(self) -> Option<u64> {
        self.try_to_u64().map_or_else(|_| None, Some)
    }

    /// Convert [U256] to u64
    pub fn try_to_u64(self) -> Result<u64, GeistError> {
        self.try_into().map_err(|_| GeistError::CastFailed)
    }

    /// Convert [U256] to u128
    pub fn to_u128(self) -> Option<u128> {
        self.try_to_u128().map_or_else(|_| None, Some)
    }

    /// Convert [U256] to u128
    pub fn try_to_u128(self) -> Result<u128, GeistError> {
        self.try_into().map_err(|_| GeistError::CastFailed)
    }

    /// Convert from little endian bytes
    pub fn from_le_bytes(bytes: [u8; 32]) -> Self {
        U256::from_little_endian(&bytes)
    }

    /// Convert to little endian bytes
    pub fn to_le_bytes(self) -> [u8; 32] {
        let mut buf: Vec<u8> = Vec::with_capacity(size_of::<Self>());
        self.to_little_endian(buf.borrow_mut());

        let mut bytes: [u8; 32] = [0u8; 32];
        bytes.copy_from_slice(buf.as_slice());

        bytes
    }
}

impl BorshSerialize for U256 {
    fn serialize<W: Write>(&self, writer: &mut W) -> std::io::Result<()> {
        let bytes = self.to_le_bytes();
        writer.write_all(&bytes)
    }
}

impl BorshDeserialize for U256 {
    fn deserialize(buf: &mut &[u8]) -> std::io::Result<Self> {
        if buf.len() < size_of::<U256>() {
            return Err(Error::new(
                ErrorKind::InvalidInput,
                "Unexpected length of input",
            ));
        }
        let res = U256::from_le_bytes(buf[..size_of::<U256>()].try_into().unwrap());
        *buf = &buf[size_of::<U256>()..];
        Ok(res)
    }

    fn deserialize_reader<R: std::io::Read>(reader: &mut R) -> std::io::Result<Self> {
        let mut bytes = [0u8; size_of::<U256>()];
        reader.read_exact(&mut bytes)?;
        Ok(U256::from_le_bytes(bytes))
    }
}