import { NextRequest, NextResponse } from "next/server";
import { getUserSessionFromReq } from "@/lib/auth";
import { query } from "@/lib/mysql";

import { ensureKtaColumns } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const session = getUserSessionFromReq(req);
    if (!session || session.type !== "anggota") {
      return NextResponse.json(
        { status: false, message: "Akses ditolak. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    await ensureKtaColumns();

    const body = await req.json();
    const { fotoProfil, tempatLahir, tanggalLahir, golonganDarah, gender, domisili } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (fotoProfil !== undefined) {
      updates.push("foto_profil = ?");
      values.push(fotoProfil);
    }
    if (tempatLahir !== undefined) {
      updates.push("tempat_lahir = ?");
      values.push(tempatLahir.trim());
    }
    if (tanggalLahir !== undefined) {
      updates.push("tanggal_lahir = ?");
      values.push(tanggalLahir.trim());
    }
    if (golonganDarah !== undefined) {
      updates.push("golongan_darah = ?");
      values.push(golonganDarah.trim());
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender.trim());
    }
    if (domisili !== undefined) {
      updates.push("domisili = ?");
      values.push(domisili.trim());
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { status: false, message: "Tidak ada data profil yang diperbarui." },
        { status: 400 }
      );
    }

    values.push(session.id);
    await query(`UPDATE anggota SET ${updates.join(", ")} WHERE id = ?`, values);

    return NextResponse.json({
      status: true,
      message: "Profil anggota berhasil diperbarui!",
      fotoProfil,
      tempatLahir,
      tanggalLahir,
      golonganDarah,
      gender,
      domisili,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
