// ============================================================
// STRUKTUR ORGANISASI CAVALLERY — data layer
// Bagan kepengurusan disimpan di MySQL (tabel `struktur_pengurus`,
// dibuat otomatis). Bila MySQL belum dikonfigurasi (mis. lokal),
// data disimpan sementara di memori agar UI tetap bisa dicoba.
// (query() returns null on any DB error, so writes check results.)
// ============================================================
import { query, isMySqlConfigured } from "@/lib/mysql";

/** 1 = Pimpinan, 2 = Pengurus Inti, 3 = Koordinator Divisi, 4 = Anggota Divisi */
export type Tingkat = 1 | 2 | 3 | 4;

export const TINGKAT_LABEL: Record<Tingkat, string> = {
  1: "Pimpinan",
  2: "Pengurus Inti",
  3: "Koordinator Divisi",
  4: "Anggota Divisi",
};

export interface Pengurus {
  id: number;
  nama: string;
  jabatan: string;
  divisi: string;
  tingkat: Tingkat;
  urutan: number;
  fotoUrl: string | null;
  sosial: string | null;
  aktif: boolean;
}

export type PengurusInput = Omit<Pengurus, "id">;

const LIMITS = { nama: 120, jabatan: 120, divisi: 120, fotoUrl: 500, sosial: 120 };

let tableReady = false;
let memory: Pengurus[] = [];
let memoryId = 0;

async function ensureTable() {
  if (tableReady || !isMySqlConfigured()) return;
  const ok = await query(`
    CREATE TABLE IF NOT EXISTS struktur_pengurus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(120) NOT NULL,
      jabatan VARCHAR(120) NOT NULL,
      divisi VARCHAR(120) NOT NULL DEFAULT 'Inti',
      tingkat TINYINT NOT NULL DEFAULT 4,
      urutan INT NOT NULL DEFAULT 0,
      foto_url VARCHAR(500) NULL,
      sosial VARCHAR(120) NULL,
      aktif TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  tableReady = ok !== null;
}

type Row = Record<string, unknown>;
type WriteResult = { insertId?: number; affectedRows?: number };

function fromRow(r: Row): Pengurus {
  return {
    id: Number(r.id),
    nama: String(r.nama),
    jabatan: String(r.jabatan),
    divisi: String(r.divisi || "Inti"),
    tingkat: clampTingkat(r.tingkat),
    urutan: Number(r.urutan || 0),
    fotoUrl: (r.foto_url as string) || null,
    sosial: (r.sosial as string) || null,
    aktif: Boolean(Number(r.aktif)),
  };
}

function clampTingkat(v: unknown): Tingkat {
  const n = Math.round(Number(v));
  return (n >= 1 && n <= 4 ? n : 4) as Tingkat;
}

function sortList(list: Pengurus[]) {
  return [...list].sort(
    (a, b) => a.tingkat - b.tingkat || a.divisi.localeCompare(b.divisi) || a.urutan - b.urutan || a.id - b.id
  );
}

/** Validate & normalise admin input. Returns an error message or the clean value. */
export function parsePengurusInput(input: unknown): { error: string } | { value: PengurusInput } {
  const body = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const nama = str(body.nama);
  const jabatan = str(body.jabatan);
  const divisi = str(body.divisi) || "Inti";
  const fotoUrl = str(body.fotoUrl);
  const sosial = str(body.sosial).replace(/^@+/, "");

  if (!nama) return { error: "Nama wajib diisi" };
  if (!jabatan) return { error: "Jabatan wajib diisi" };
  if (nama.length > LIMITS.nama || jabatan.length > LIMITS.jabatan || divisi.length > LIMITS.divisi) {
    return { error: "Nama, jabatan, atau divisi terlalu panjang" };
  }
  if (fotoUrl && (fotoUrl.length > LIMITS.fotoUrl || !/^(https?:\/\/|\/)/i.test(fotoUrl))) {
    return { error: "URL foto harus diawali http(s):// atau /" };
  }
  if (sosial.length > LIMITS.sosial) return { error: "Username sosial media terlalu panjang" };

  return {
    value: {
      nama,
      jabatan,
      divisi,
      tingkat: clampTingkat(body.tingkat),
      urutan: Number.isFinite(Number(body.urutan)) ? Math.round(Number(body.urutan)) : 0,
      fotoUrl: fotoUrl || null,
      sosial: sosial || null,
      aktif: body.aktif === undefined ? true : Boolean(body.aktif),
    },
  };
}

export async function listPengurus({ includeInactive = false } = {}): Promise<Pengurus[]> {
  if (!isMySqlConfigured()) {
    return sortList(includeInactive ? memory : memory.filter((p) => p.aktif));
  }
  await ensureTable();
  const rows =
    (await query<Row[]>(
      `SELECT * FROM struktur_pengurus ${includeInactive ? "" : "WHERE aktif = 1"}
       ORDER BY tingkat ASC, divisi ASC, urutan ASC, id ASC`
    )) || [];
  return rows.map(fromRow);
}

export async function createPengurus(input: PengurusInput): Promise<Pengurus> {
  if (!isMySqlConfigured()) {
    const item = { ...input, id: ++memoryId };
    memory.push(item);
    return item;
  }
  await ensureTable();
  const res = await query<WriteResult>(
    `INSERT INTO struktur_pengurus (nama, jabatan, divisi, tingkat, urutan, foto_url, sosial, aktif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.nama, input.jabatan, input.divisi, input.tingkat, input.urutan, input.fotoUrl, input.sosial, input.aktif ? 1 : 0]
  );
  if (!res?.insertId) throw new Error("Gagal menyimpan ke database");
  return { ...input, id: Number(res.insertId) };
}

export async function updatePengurus(id: number, input: PengurusInput): Promise<boolean> {
  if (!isMySqlConfigured()) {
    const i = memory.findIndex((p) => p.id === id);
    if (i < 0) return false;
    memory[i] = { ...input, id };
    return true;
  }
  await ensureTable();
  const res = await query<WriteResult>(
    `UPDATE struktur_pengurus
       SET nama = ?, jabatan = ?, divisi = ?, tingkat = ?, urutan = ?, foto_url = ?, sosial = ?, aktif = ?
     WHERE id = ?`,
    [input.nama, input.jabatan, input.divisi, input.tingkat, input.urutan, input.fotoUrl, input.sosial, input.aktif ? 1 : 0, id]
  );
  return Number(res?.affectedRows || 0) > 0;
}

export async function deletePengurus(id: number): Promise<boolean> {
  if (!isMySqlConfigured()) {
    const before = memory.length;
    memory = memory.filter((p) => p.id !== id);
    return memory.length < before;
  }
  await ensureTable();
  const res = await query<WriteResult>("DELETE FROM struktur_pengurus WHERE id = ?", [id]);
  return Number(res?.affectedRows || 0) > 0;
}
