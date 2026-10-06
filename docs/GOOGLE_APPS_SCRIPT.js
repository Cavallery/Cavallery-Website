/**
 * =========================================================================
 * CAVALLERY WEBSITE - GOOGLE APPS SCRIPT SYNC & BACKUP INTEGRATION
 * Versi: 3.1 (Dashboard Visualisasi Chart + Indikator Kesehatan Kas)
 * =========================================================================
 * 
 * CARA MEMASANG / UPDATE DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet Cavallery.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus semua kode lama di "Code.gs", lalu tempel (paste) seluruh isi file ini.
 * 4. Klik tombol "Simpan" (ikon disket).
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas -> "Kelola penerapan" (Manage deployments) -> Edit (ikon pensil) -> Pilih "Versi Baru" (New version) -> Klik "Terapkan" (Deploy).
 *    (Atau: Deploy baru -> Web App -> Siapa saja yang memiliki akses: "Siapa saja / Anyone").
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: false, message: "Tidak ada data payload yang dikirim" });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ─────────────────────────────────────────────────────────────
    // 1. SYNC ALL (FULL BACKUP DARI DATABASE WEBSITE)
    // ─────────────────────────────────────────────────────────────
    if (action === "sync_all") {
      // 1. Tab Anggota
      if (data.anggotaRows && data.anggotaRows.length > 0) {
        syncTab(ss, "Anggota", [
          "Nomor Anggota", "Nama Lengkap", "ID Line", "Display Name Line", "Discord",
          "Jenis Kelamin", "Domisili", "Kontak", "Status", "Jabatan", "Anggota Sejak", "Terdaftar Pada"
        ], data.anggotaRows);
      }

      // 2. Tab Kontributor
      if (data.kontributorRows && data.kontributorRows.length > 0) {
        syncTab(ss, "Kontributor", [
          "ID", "Nama", "Platform Kontak", "ID Kontak", "Discord", "Status", "Total Kontribusi", "Waktu Terdaftar"
        ], data.kontributorRows);
      }

      // 3. Tab Riwayat Kas
      if (data.kasRows && data.kasRows.length > 0) {
        syncTab(ss, "Kas", [
          "ID", "Nomor Anggota", "Nama Anggota", "ID Line", "Periode", "Nominal", "Status", "Link Bukti Bayar", "Tanggal Bayar"
        ], data.kasRows);
      }

      // 4. Tab Donasi
      if (data.donasiRows && data.donasiRows.length > 0) {
        syncTab(ss, "Donasi", [
          "ID", "Tipe Donatur", "No. Anggota / Kontak", "Nama", "Kontak", "Tipe Donasi", "Nominal", "Status", "Link Bukti Bayar", "Tanggal Donasi"
        ], data.donasiRows);
      }

      // 5. Tab Matriks Kas Tahunan (Kas 2024 s/d Kas 2029)
      if (data.yearlyMatrixTabs && data.yearlyMatrixTabs.length > 0) {
        for (var i = 0; i < data.yearlyMatrixTabs.length; i++) {
          var yData = data.yearlyMatrixTabs[i];
          syncMatrixTab(ss, yData);
        }
      }

      // 6. Tab Anggota Aktif
      if (data.anggotaAktifRows) {
        syncTab(ss, "Anggota Aktif", [
          "No.", "Nomor Anggota", "Nama Lengkap", "ID Line", "Kontak Resmi", "Anggota Sejak", "Tanggal Input"
        ], data.anggotaAktifRows);
      }

      // 7. Tab Status Anggota
      if (data.statusAnggotaRows) {
        syncTab(ss, "Status Anggota", [
          "No.", "Nomor Anggota", "Nama Lengkap", "Status Keaktifan", "Jabatan & Divisi", "Ketentuan Iuran Kas"
        ], data.statusAnggotaRows);
      }

      // 8. Tab Leaderboard Donatur
      if (data.leaderboardRows) {
        syncTab(ss, "Leaderboard Donatur", [
          "No.", "Ranking", "Nama Donatur", "Kontak", "Total Donasi (Angka)", "Total Donasi (Format Rp)", "Frekuensi"
        ], data.leaderboardRows);
      }

      // 9. Tab Laporan Pengeluaran Kas
      if (data.pengeluaranRows) {
        syncTab(ss, "Laporan Pengeluaran", [
          "No.", "ID", "Tanggal", "Tahun", "Kategori", "Keperluan Belanja", "Nominal", "Format Rupiah", "Penanggung Jawab (PJ)", "Bukti Nota", "Catatan"
        ], data.pengeluaranRows);
      }

      // 10. Tab Laporan Pemasukan Kas (Eksternal Income)
      if (data.pemasukanRows) {
        syncTab(ss, "Laporan Pemasukan", [
          "No.", "ID", "Tanggal", "Tahun", "Kategori", "Sumber / Deskripsi", "Nominal", "Format Rupiah", "Dicatat Oleh (PJ)", "Bukti Nota", "Catatan"
        ], data.pemasukanRows);
      }

      // 11. Tab Ringkasan Kas (4 Kartu & Saldo Otomatis)
      if (data.ringkasanKasRows) {
        syncRingkasanKasTab(ss, data.ringkasanKasRows);
      }

      return jsonResponse({ status: true, message: "Full sync backup berhasil diselesaikan!" });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. APPEND SINGLE ROWS
    // ─────────────────────────────────────────────────────────────
    if (action === "append_pemasukan") {
      var sheet = getOrCreateSheet(ss, "Laporan Pemasukan", [
        "No.", "ID", "Tanggal", "Tahun", "Kategori", "Sumber / Deskripsi", "Nominal", "Format Rupiah", "Dicatat Oleh (PJ)", "Bukti Nota", "Catatan"
      ]);
      var nextNo = Math.max(1, sheet.getLastRow());
      var rowData = data.row || [];
      if (rowData.length > 0) rowData[0] = nextNo;
      sheet.appendRow(rowData);
      return jsonResponse({ status: true, message: "Pemasukan berhasil dicatat di spreadsheet" });
    }

    if (action === "append_pengeluaran") {
      var sheet = getOrCreateSheet(ss, "Laporan Pengeluaran", [
        "No.", "ID", "Tanggal", "Tahun", "Kategori", "Keperluan Belanja", "Nominal", "Format Rupiah", "Penanggung Jawab (PJ)", "Bukti Nota", "Catatan"
      ]);
      var nextNo = Math.max(1, sheet.getLastRow());
      var rowData = data.row || [];
      if (rowData.length > 0) rowData[0] = nextNo;
      sheet.appendRow(rowData);
      return jsonResponse({ status: true, message: "Pengeluaran berhasil dicatat di spreadsheet" });
    }

    if (action === "append_kas") {
      var sheet = getOrCreateSheet(ss, "Kas", [
        "ID", "Nomor Anggota", "Nama Anggota", "ID Line", "Periode", "Nominal", "Status", "Link Bukti Bayar", "Tanggal Bayar"
      ]);
      sheet.appendRow(data.row);
      return jsonResponse({ status: true, message: "Kas berhasil ditambahkan" });
    }

    if (action === "append_donasi") {
      var sheet = getOrCreateSheet(ss, "Donasi", [
        "ID", "Tipe Donatur", "No. Anggota / Kontak", "Nama", "Kontak", "Tipe Donasi", "Nominal", "Status", "Link Bukti Bayar", "Tanggal Donasi"
      ]);
      sheet.appendRow(data.row);
      return jsonResponse({ status: true, message: "Donasi berhasil ditambahkan" });
    }

    if (action === "append_anggota") {
      var sheet = getOrCreateSheet(ss, "Anggota", [
        "Nomor Anggota", "Nama Lengkap", "ID Line", "Display Name Line", "Discord",
        "Jenis Kelamin", "Domisili", "Kontak", "Status", "Jabatan", "Anggota Sejak", "Terdaftar Pada"
      ]);
      sheet.appendRow(data.row);
      return jsonResponse({ status: true, message: "Anggota berhasil ditambahkan" });
    }

    if (action === "append_kontributor") {
      var sheet = getOrCreateSheet(ss, "Kontributor", [
        "ID", "Nama", "Platform Kontak", "ID Kontak", "Discord", "Status", "Total Kontribusi", "Waktu Terdaftar"
      ]);
      sheet.appendRow(data.row);
      return jsonResponse({ status: true, message: "Kontributor berhasil ditambahkan" });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. REALTIME CELL UPDATE (CHECKBOX MATRIKS)
    // ─────────────────────────────────────────────────────────────
    if (action === "update_kas_matrix_cell") {
      var tabName = data.tabName;
      var noAnggota = data.noAnggota;
      var bulan = Number(data.bulan);
      var isPaid = Boolean(data.isPaid);

      var sheet = ss.getSheetByName(tabName);
      if (!sheet) return jsonResponse({ status: false, message: "Sheet tidak ditemukan" });

      var lastRow = sheet.getLastRow();
      if (lastRow < 6) return jsonResponse({ status: false, message: "Data kosong" });

      var noAnggotaCol = sheet.getRange(6, 2, lastRow - 5, 1).getValues();
      var targetRow = -1;
      for (var r = 0; r < noAnggotaCol.length; r++) {
        if (String(noAnggotaCol[r][0]).trim() === String(noAnggota).trim()) {
          targetRow = r + 6;
          break;
        }
      }

      if (targetRow > 0) {
        var targetCol = 5 + bulan; // Kolom 6 = Bulan 1 (Januari)
        var cell = sheet.getRange(targetRow, targetCol);
        cell.setValue(isPaid);
        return jsonResponse({ status: true, message: "Checkbox matriks diperbarui" });
      }

      return jsonResponse({ status: false, message: "Anggota tidak ditemukan pada matriks" });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. UPDATE STATUS / DELETE ROW
    // ─────────────────────────────────────────────────────────────
    if (action === "update_status") {
      var sheet = ss.getSheetByName(data.tab);
      if (sheet) {
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
          for (var i = 0; i < idValues.length; i++) {
            if (String(idValues[i][0]).trim() === String(data.id).trim()) {
              var rowIdx = i + 2;
              if (data.row) {
                sheet.getRange(rowIdx, 1, 1, data.row.length).setValues([data.row]);
              } else {
                sheet.getRange(rowIdx, 7).setValue(data.status); // kolom status
              }
              return jsonResponse({ status: true, message: "Status diperbarui" });
            }
          }
        }
      }
      return jsonResponse({ status: false, message: "Baris tidak ditemukan" });
    }

    if (action === "delete_row" || action === "delete_anggota" || action === "delete_kas" || action === "delete_donasi" || action === "delete_kontributor") {
      var tab = data.tab;
      var col = data.matchColumn || 1;
      var val = data.matchValue || data.id || data.noAnggota;

      var sheet = ss.getSheetByName(tab);
      if (sheet) {
        var lastRow = sheet.getLastRow();
        if (lastRow > 1) {
          var vals = sheet.getRange(2, col, lastRow - 1, 1).getValues();
          for (var i = 0; i < vals.length; i++) {
            if (String(vals[i][0]).trim() === String(val).trim()) {
              sheet.deleteRow(i + 2);
              return jsonResponse({ status: true, message: "Baris berhasil dihapus" });
            }
          }
        }
      }
      return jsonResponse({ status: false, message: "Baris tidak ditemukan untuk dihapus" });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. UPLOAD TO GOOGLE DRIVE
    // ─────────────────────────────────────────────────────────────
    if (action === "upload_drive") {
      var folderName = data.folderName || "Cavallery Bukti & Nota";
      var folders = DriveApp.getFoldersByName(folderName);
      var targetFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

      var decoded = Utilities.base64Decode(data.base64);
      var blob = Utilities.newBlob(decoded, data.mimeType || "image/jpeg", data.filename);
      var file = targetFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var viewUrl = file.getUrl();
      var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();

      return jsonResponse({
        status: true,
        fileId: file.getId(),
        url: directUrl,
        viewUrl: viewUrl,
        directUrl: directUrl,
        message: "File berhasil disimpan di Google Drive"
      });
    }

    return jsonResponse({ status: false, message: "Action tidak dikenali: " + action });
  } catch (err) {
    return jsonResponse({ status: false, message: "Server error: " + err.toString() });
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, tabName, headers) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#111111");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function syncTab(ss, tabName, headers, dataRows) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  } else {
    sheet.clear();
  }

  // Header
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#111111");
  sheet.setFrozenRows(1);

  if (dataRows && dataRows.length > 0) {
    sheet.getRange(2, 1, dataRows.length, dataRows[0].length).setValues(dataRows);
  }

  // Auto-resize columns
  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

function syncMatrixTab(ss, matrixData) {
  var tabName = matrixData.tabName;
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  } else {
    sheet.clear();
  }

  // Header 1-3: Judul & Informasi
  sheet.getRange(1, 1).setValue("MATRIKS KAS CAVALLERY TAHUN " + matrixData.tahun).setFontWeight("bold").setFontSize(14);
  sheet.getRange(2, 1).setValue("Total Pemasukan Iuran: Rp " + Number(matrixData.grandTotalPemasukan || 0).toLocaleString("id-ID")).setFontWeight("bold");
  sheet.getRange(2, 6).setValue("Total Pengeluaran Kas: Rp " + Number(matrixData.totalPengeluaranKas || 0).toLocaleString("id-ID")).setFontWeight("bold");

  // Header 4: Kolom Nama & Bulan
  sheet.getRange(4, 1, 1, matrixData.headerRow4.length).setValues([matrixData.headerRow4]).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  
  // Header 5: Total per Bulan
  if (matrixData.headerRow5) {
    sheet.getRange(5, 1, 1, matrixData.headerRow5.length).setValues([matrixData.headerRow5]).setFontWeight("bold").setBackground("#0f172a").setFontColor("#c9a84c");
  }

  sheet.setFrozenRows(5);
  sheet.setFrozenColumns(3);

  // Data Rows
  if (matrixData.dataRows && matrixData.dataRows.length > 0) {
    sheet.getRange(6, 1, matrixData.dataRows.length, matrixData.dataRows[0].length).setValues(matrixData.dataRows);
    
    // Pasang Checkbox di kolom bulan (Kolom 6 s/d 17)
    sheet.getRange(6, 6, matrixData.dataRows.length, 12).insertCheckboxes();
  }
}

function syncRingkasanKasTab(ss, ringkasanRows) {
  var tabName = "Ringkasan Kas";
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  } else {
    sheet.clear();
    // Hapus semua chart lama
    var existingCharts = sheet.getCharts();
    for (var ci = 0; ci < existingCharts.length; ci++) {
      sheet.removeChart(existingCharts[ci]);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: HEADER BANNER
  // ─────────────────────────────────────────────────────────────
  sheet.getRange(1, 1, 1, 6).merge().setValue("📊 DASHBOARD KEUANGAN KAS FANBASE CAVALLERY")
    .setFontWeight("bold").setFontSize(16).setBackground("#c9a84c").setFontColor("#111111").setHorizontalAlignment("center");

  sheet.getRange(2, 1, 1, 6).merge().setValue("Laporan Transparansi Keuangan — Data Akumulasi Seluruh Periode")
    .setFontWeight("bold").setFontSize(10).setBackground("#fef3c7").setFontColor("#92400e").setHorizontalAlignment("center");

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: TABEL RINGKASAN KEUANGAN (Baris 4-8)
  // ─────────────────────────────────────────────────────────────
  var headers = ["No.", "Pos Keuangan Kas", "Nominal (Angka)", "Format Mata Uang (IDR)", "Keterangan Lengkap", "Persentase"];
  sheet.getRange(4, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  sheet.setFrozenRows(4);

  // Parse data dari ringkasanRows
  var iuranNominal = 0, eksternalNominal = 0, pengeluaranNominal = 0, saldoNominal = 0;

  if (ringkasanRows && ringkasanRows.length > 0) {
    for (var ri = 0; ri < ringkasanRows.length; ri++) {
      var row = ringkasanRows[ri];
      // Tambah kolom Persentase di akhir
      var extendedRow = row.slice();
      
      // Parse nominal (kolom index 2)
      var nominal = Number(row[2]) || 0;
      if (ri === 0) iuranNominal = nominal;
      if (ri === 1) eksternalNominal = nominal;
      if (ri === 2) pengeluaranNominal = nominal;
      if (ri === 3) saldoNominal = nominal;
      
      extendedRow.push(""); // Persentase placeholder
      sheet.getRange(5 + ri, 1, 1, extendedRow.length).setValues([extendedRow]);
    }

    // Hitung persentase kontribusi pemasukan
    var totalPemasukan = iuranNominal + eksternalNominal;
    if (totalPemasukan > 0) {
      var pctIuran = ((iuranNominal / totalPemasukan) * 100).toFixed(1) + "%";
      var pctEksternal = ((eksternalNominal / totalPemasukan) * 100).toFixed(1) + "%";
      var pctPengeluaran = ((pengeluaranNominal / totalPemasukan) * 100).toFixed(1) + "% dari pemasukan";
      sheet.getRange(5, 6).setValue(pctIuran);
      sheet.getRange(6, 6).setValue(pctEksternal);
      sheet.getRange(7, 6).setValue(pctPengeluaran);
      sheet.getRange(8, 6).setValue("—");
    }

    // Format warna untuk 4 baris:
    // Baris 5: Iuran Kas (Hijau)
    sheet.getRange(5, 1, 1, 6).setBackground("#d1fae5").setFontColor("#065f46").setFontWeight("bold");
    // Baris 6: Pemasukan Eksternal (Cyan)
    sheet.getRange(6, 1, 1, 6).setBackground("#cffafe").setFontColor("#155e75").setFontWeight("bold");
    // Baris 7: Pengeluaran (Merah)
    sheet.getRange(7, 1, 1, 6).setBackground("#ffe4e6").setFontColor("#9f1239").setFontWeight("bold");
    // Baris 8: SALDO (Gold / Kuning Emas)
    sheet.getRange(8, 1, 1, 6).setBackground("#fef3c7").setFontColor("#92400e").setFontWeight("bold").setFontSize(12);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: DATA UNTUK CHART (Baris 11-14, kolom tersembunyi)
  // ─────────────────────────────────────────────────────────────
  sheet.getRange(10, 1, 1, 6).merge().setValue("📈 VISUALISASI KEUANGAN")
    .setFontWeight("bold").setFontSize(13).setBackground("#1e293b").setFontColor("#c9a84c").setHorizontalAlignment("center");

  // Data source untuk chart — BAR CHART (Pemasukan vs Pengeluaran)
  sheet.getRange(12, 1).setValue("Kategori").setFontWeight("bold").setBackground("#374151").setFontColor("#ffffff");
  sheet.getRange(12, 2).setValue("Nominal (Rp)").setFontWeight("bold").setBackground("#374151").setFontColor("#ffffff");
  sheet.getRange(13, 1).setValue("Iuran Kas Anggota");
  sheet.getRange(13, 2).setValue(iuranNominal);
  sheet.getRange(14, 1).setValue("Pemasukan Eksternal");
  sheet.getRange(14, 2).setValue(eksternalNominal);
  sheet.getRange(15, 1).setValue("Total Pengeluaran");
  sheet.getRange(15, 2).setValue(pengeluaranNominal);
  sheet.getRange(16, 1).setValue("Saldo Kas Saat Ini");
  sheet.getRange(16, 2).setValue(saldoNominal);

  // Warna data rows
  sheet.getRange(13, 1, 1, 2).setBackground("#d1fae5").setFontColor("#065f46");
  sheet.getRange(14, 1, 1, 2).setBackground("#cffafe").setFontColor("#155e75");
  sheet.getRange(15, 1, 1, 2).setBackground("#ffe4e6").setFontColor("#9f1239");
  sheet.getRange(16, 1, 1, 2).setBackground("#fef3c7").setFontColor("#92400e").setFontWeight("bold");

  // Data source untuk PIE CHART — Komposisi Pemasukan (kolom D-E)
  sheet.getRange(12, 4).setValue("Sumber Pemasukan").setFontWeight("bold").setBackground("#374151").setFontColor("#ffffff");
  sheet.getRange(12, 5).setValue("Nominal (Rp)").setFontWeight("bold").setBackground("#374151").setFontColor("#ffffff");
  sheet.getRange(13, 4).setValue("Iuran Kas Anggota");
  sheet.getRange(13, 5).setValue(iuranNominal);
  sheet.getRange(14, 4).setValue("Pemasukan Eksternal");
  sheet.getRange(14, 5).setValue(eksternalNominal);

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: BUAT CHART — BAR CHART (Arus Kas)
  // ─────────────────────────────────────────────────────────────
  try {
    var barChart = sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(sheet.getRange("A12:B16"))
      .setPosition(18, 1, 0, 0) // Baris 18, kolom A
      .setOption("title", "Arus Kas Fanbase Cavallery (All-Time)")
      .setOption("titleTextStyle", {fontSize: 13, bold: true, color: "#111111"})
      .setOption("legend", {position: "none"})
      .setOption("hAxis", {title: "Nominal (Rp)", format: "#,##0", textStyle: {fontSize: 10}})
      .setOption("vAxis", {textStyle: {fontSize: 10}})
      .setOption("colors", ["#c9a84c"])
      .setOption("chartArea", {left: "30%", top: "15%", width: "60%", height: "70%"})
      .setOption("width", 600)
      .setOption("height", 350)
      .build();
    sheet.insertChart(barChart);
  } catch(e) {
    // Fallback jika chart gagal
    sheet.getRange(18, 1).setValue("⚠️ Grafik batang tidak dapat dibuat: " + e.toString());
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: BUAT CHART — PIE CHART (Komposisi Pemasukan)
  // ─────────────────────────────────────────────────────────────
  try {
    var pieChart = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange("D12:E14"))
      .setPosition(18, 4, 0, 0) // Baris 18, kolom D
      .setOption("title", "Komposisi Sumber Pemasukan")
      .setOption("titleTextStyle", {fontSize: 13, bold: true, color: "#111111"})
      .setOption("legend", {position: "bottom", textStyle: {fontSize: 10}})
      .setOption("pieSliceTextStyle", {fontSize: 11})
      .setOption("colors", ["#10b981", "#06b6d4"])
      .setOption("is3D", true)
      .setOption("chartArea", {left: "10%", top: "15%", width: "80%", height: "65%"})
      .setOption("width", 400)
      .setOption("height", 350)
      .build();
    sheet.insertChart(pieChart);
  } catch(e) {
    sheet.getRange(18, 4).setValue("⚠️ Grafik pie tidak dapat dibuat: " + e.toString());
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: MINI INDIKATOR KESEHATAN KAS (Baris 40+)
  // ─────────────────────────────────────────────────────────────
  var infoStartRow = 40;
  sheet.getRange(infoStartRow, 1, 1, 6).merge().setValue("📋 INDIKATOR KESEHATAN KAS")
    .setFontWeight("bold").setFontSize(13).setBackground("#1e293b").setFontColor("#c9a84c").setHorizontalAlignment("center");

  // Rasio Pengeluaran terhadap Pemasukan
  var rasio = totalPemasukan > 0 ? ((pengeluaranNominal / totalPemasukan) * 100).toFixed(1) : 0;
  var statusKas = "🟢 Sehat";
  var statusColor = "#d1fae5";
  var statusTextColor = "#065f46";
  if (Number(rasio) > 90) {
    statusKas = "🔴 Kritis — Pengeluaran Melebihi 90% Pemasukan";
    statusColor = "#ffe4e6";
    statusTextColor = "#9f1239";
  } else if (Number(rasio) > 70) {
    statusKas = "🟡 Waspada — Pengeluaran Melebihi 70% Pemasukan";
    statusColor = "#fef3c7";
    statusTextColor = "#92400e";
  } else if (Number(rasio) > 50) {
    statusKas = "🟢 Normal — Pengeluaran Di Bawah 70% Pemasukan";
  }

  sheet.getRange(infoStartRow + 2, 1).setValue("Rasio Pengeluaran").setFontWeight("bold");
  sheet.getRange(infoStartRow + 2, 2, 1, 2).merge().setValue(rasio + "% dari total pemasukan");

  sheet.getRange(infoStartRow + 3, 1).setValue("Status Kas").setFontWeight("bold");
  sheet.getRange(infoStartRow + 3, 2, 1, 2).merge().setValue(statusKas)
    .setBackground(statusColor).setFontColor(statusTextColor).setFontWeight("bold").setFontSize(11);

  sheet.getRange(infoStartRow + 5, 1).setValue("Saldo Tersedia").setFontWeight("bold");
  sheet.getRange(infoStartRow + 5, 2, 1, 2).merge().setValue("Rp " + Number(saldoNominal).toLocaleString("id-ID"))
    .setFontWeight("bold").setFontSize(12).setFontColor(saldoNominal >= 0 ? "#065f46" : "#9f1239");

  sheet.getRange(infoStartRow + 7, 1, 1, 6).merge()
    .setValue("Data ini disinkronkan otomatis dari website Cavallery. Terakhir diperbarui: " + new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"}))
    .setFontStyle("italic").setFontColor("#6b7280").setFontSize(9);

  // Auto-resize columns
  for (var c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }
  
  // Set lebar minimum kolom
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 200);
  sheet.setColumnWidth(5, 300);
  sheet.setColumnWidth(6, 160);
}

