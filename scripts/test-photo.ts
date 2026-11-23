import zlib from "node:zlib";

/** A small solid-colour PNG, standing in for a user photo. */
export function testPhoto(): string {
  const size = 96;
  const row = Buffer.alloc(1 + size * 3);
  const rows: Buffer[] = [];
  for (let y = 0; y < size; y++) {
    const r = Buffer.from(row);
    for (let x = 0; x < size; x++) {
      const inner = (x - 48) ** 2 + (y - 40) ** 2 < 24 ** 2 || (y > 66 && Math.abs(x - 48) < 34);
      const [cr, cg, cb] = inner ? [205, 214, 232] : [96, 118, 166];
      r.set([cr, cg, cb], 1 + x * 3);
    }
    rows.push(r);
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

