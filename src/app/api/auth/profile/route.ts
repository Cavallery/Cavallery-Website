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

    if (fotoProfil !== undefined && typeof fotoProfil === "string" && fotoProfil.trim() !== "") {
      updates.push("foto_profil = ?");
      values.push(fotoProfil.trim());
    }
    if (tempatLahir !== undefined && typeof tempatLahir === "string" && !tempatLahir.includes("•")) {
      const val = tempatLahir.trim();
      if (val !== "") {
        updates.push("tempat_lahir = ?");
        values.push(val);
      }
    }
    if (tanggalLahir !== undefined && typeof tanggalLahir === "string" && !tanggalLahir.includes("•")) {
      const val = tanggalLahir.trim();
      if (val !== "") {
        updates.push("tanggal_lahir = ?");
        values.push(val);
      }
    }
    if (golonganDarah !== undefined && typeof golonganDarah === "string" && !golonganDarah.includes("•")) {
      const val = golonganDarah.trim();
      if (val !== "") {
        updates.push("golongan_darah = ?");
        values.push(val);
      }
    }
    if (gender !== undefined && typeof gender === "string" && !gender.includes("•")) {
      const val = gender.trim();
      if (val !== "") {
        updates.push("gender = ?");
        values.push(val);
      }
    }
    if (domisili !== undefined && typeof domisili === "string" && !domisili.includes("•")) {
      const val = domisili.trim();
      if (val !== "") {
        updates.push("domisili = ?");
        values.push(val);
      }
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
