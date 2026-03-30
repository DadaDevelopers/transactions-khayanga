function readVarInt(buffer, offset) {
  const prefix = buffer[offset];

  if (prefix < 0xfd) {
    return { value: prefix, size: 1 };
  }

  if (prefix === 0xfd) {
    return {
      value: buffer.readUInt16LE(offset + 1),
      size: 3,
    };
  }

  if (prefix === 0xfe) {
    return {
      value: buffer.readUInt32LE(offset + 1),
      size: 5,
    };
  }

  return {
    value: Number(buffer.readBigUInt64LE(offset + 1)),
    size: 9,
  };
}

function decodeTransaction(hex) {
  const buffer = Buffer.from(hex, "hex");
  let offset = 0;

  
  const version = buffer.readUInt32LE(offset);
  offset += 4;

  
  let isSegWit = false;
  let marker = null;
  let flag = null;

  if (buffer[offset] === 0x00 && buffer[offset + 1] === 0x01) {
    isSegWit = true;
    marker = buffer[offset];
    flag = buffer[offset + 1];
    offset += 2;
  }

  
  let vi = readVarInt(buffer, offset);
  const inputCount = vi.value;
  offset += vi.size;

  const inputs = [];

  for (let i = 0; i < inputCount; i++) {
    const txid = buffer
      .slice(offset, offset + 32)
      .reverse()
      .toString("hex");
    offset += 32;

    const vout = buffer.readUInt32LE(offset);
    offset += 4;

    vi = readVarInt(buffer, offset);
    const scriptLen = vi.value;
    offset += vi.size;

    const scriptSig = buffer
      .slice(offset, offset + scriptLen)
      .toString("hex");
    offset += scriptLen;

    const sequence = buffer.readUInt32LE(offset);
    offset += 4;

    inputs.push({
      txid,
      vout,
      scriptSig,
      sequence,
    });
  }

  
  vi = readVarInt(buffer, offset);
  const outputCount = vi.value;
  offset += vi.size;

  const outputs = [];

  for (let i = 0; i < outputCount; i++) {
    const value = Number(buffer.readBigUInt64LE(offset));
    offset += 8;

    vi = readVarInt(buffer, offset);
    const scriptLen = vi.value;
    offset += vi.size;

    const scriptPubKey = buffer
      .slice(offset, offset + scriptLen)
      .toString("hex");
    offset += scriptLen;

    outputs.push({
      value,
      scriptPubKey,
    });
  }

  
  const witness = [];

  if (isSegWit) {
    for (let i = 0; i < inputCount; i++) {
      vi = readVarInt(buffer, offset);
      const itemCount = vi.value;
      offset += vi.size;

      const items = [];

      for (let j = 0; j < itemCount; j++) {
        vi = readVarInt(buffer, offset);
        const size = vi.value;
        offset += vi.size;

        const item = buffer.slice(offset, offset + size).toString("hex");
        offset += size;

        items.push(item);
      }

      witness.push(items);
    }
  }

  
const locktime = buffer.readUInt32LE(buffer.length - 4);

  return {
    version,
    isSegWit,
    marker,
    flag,
    inputs,
    outputs,
    witness,
    locktime,
  };
}


const txHex =
  "0200000000010131811cd355c357e0e01437d9bcf690df824e9ff785012b6115dfae3d8e8b36c10100000000fdffffff0220a107000000000016001485d78eb795bd9c8a21afefc8b6fdaedf718368094c08100000000000160014840ab165c9c2555d4a31b9208ad806f89d2535e20247304402207bce86d430b58bb6b79e8c1bbecdf67a530eff3bc61581a1399e0b28a741c0ee0220303d5ce926c60bf15577f2e407f28a2ef8fe8453abd4048b716e97dbb1e3a85c01210260828bc77486a55e3bc6032ccbeda915d9494eda17b4a54dbe3b24506d40e4ff43030e00";

console.log(JSON.stringify(decodeTransaction(txHex), null, 2));