/**
 * ============================================================================
 * CAVALLERY GOOGLE APPS SCRIPT WEB APP - SYNC & BACKUP ENGINE
 * ============================================================================
 * Petunjuk Instalasi / Update di Google Spreadsheet:
 * 1. Buka file Google Spreadsheet Anda (misal: https://docs.google.com/spreadsheets/d/1t9PlUNLN2rdskLq-ZpellJI0umclokLm7G-DI-VnFXg/edit)
 * 2. Di menu atas, klik Extensions > Apps Script (Ekstensi > Apps Script).
 * 3. Hapus kode lama di editor (Code.gs), lalu paste seluruh kode di bawah ini.
 * 4. Klik tombol "Save" (ikon disket).
 * 5. Klik tombol "Deploy" (Terapkan) > "Manage deployments" (Kelola penerapan).
 * 6. Klik ikon pensil (Edit) pada penerapan aktif:
 *    - Version: New version (Versi baru)
 *    - Execute as: Me (email pemilik spreadsheet)
 *    - Who has access: Anyone (Siapa saja, bahkan anonim)
 * 7. Klik "Deploy", lalu salin Web App URL jika URL berubah.
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: false, message: "No data payload" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var data = payload.data || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case "sync_all":
        handleSyncAll(ss, data);
        break;

      case "append_anggota":
        handleAppendRow(ss, "Anggota", data.row || data);
        break;

      case "append_kas":
        handleAppendRow(ss, "Kas", data.row || data);
        break;

      case "append_donasi":
        handleAppendRow(ss, "Donasi", data.row || data);
        break;

      case "append_kontributor":
        handleAppendRow(ss, "Kontributor", data.row || data);
        break;

      case "append_pengeluaran":
        handleAppendRow(ss, "Laporan Pengeluaran", data.row || data);
        break;

      case "update_status":
        handleUpdateStatus(ss, data.tab || "Kas", data.id, data.status, data.row);
        break;

      case "update_anggota_status":
        handleUpdateAnggotaStatus(ss, data.noAnggota, data.status);
        break;

      case "update_anggota_jabatan":
        handleUpdateAnggotaJabatan(ss, data.noAnggota, data.jabatan);
        break;

      case "update_kas_matrix_cell":
        handleUpdateKasMatrixCell(ss, data.tabName, data.noAnggota, data.bulan, data.isPaid);
        break;

      case "delete_row":
        handleDeleteRow(ss, data.tab, data.matchColumn, data.matchValue);
        break;

      case "delete_anggota":
        handleDeleteRow(ss, "Anggota", 1, data.noAnggota);
        break;

      case "delete_kas":
        handleDeleteRow(ss, "Kas", 1, data.id);
        break;

      case "delete_donasi":
        handleDeleteRow(ss, "Donasi", 1, data.id);
        break;

      case "delete_kontributor":
        handleDeleteRow(ss, "Kontributor", 1, data.id);
        break;

      default:
        return ContentService.createTextOutput(JSON.stringify({ status: false, message: "Action not recognized: " + action }))
          .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: true, message: "Success handling " + action }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: true,
    message: "Cavallery Apps Script Web App is active and running!"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// HANDLER: SYNC ALL (FULL BACKUP ANTI-DUPLIKASI)
// ============================================================================
function handleSyncAll(ss, data) {
  // 1. Tab Anggota (Semua Anggota: Aktif & Nonaktif)
  if (data.anggotaRows && data.anggotaRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Anggota");
    sheet.clear();
    var headers = [
      ["No. Anggota", "Nama Lengkap", "ID LINE", "Display LINE", "Discord", "Gender", "Domisili", "Kontak", "Status", "Jabatan", "Anggota Sejak", "Terdaftar Pada"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#c9a84c").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.anggotaRows.length, data.anggotaRows[0].length).setValues(data.anggotaRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 2. Tab Anggota Aktif
  if (data.anggotaAktifRows && data.anggotaAktifRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Anggota Aktif");
    sheet.clear();
    var headers = [
      ["No", "No. Anggota", "Nama Lengkap", "ID LINE", "Kontak", "Anggota Sejak", "Terdaftar Pada"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.anggotaAktifRows.length, data.anggotaAktifRows[0].length).setValues(data.anggotaAktifRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 3. Tab Status Anggota
  if (data.statusAnggotaRows && data.statusAnggotaRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Status Anggota");
    sheet.clear();
    var headers = [
      ["No", "No. Anggota", "Nama Lengkap", "Status", "Jabatan", "Ketentuan Iuran Kas"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#3b82f6").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.statusAnggotaRows.length, data.statusAnggotaRows[0].length).setValues(data.statusAnggotaRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 4. Tab Kontributor
  if (data.kontributorRows && data.kontributorRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Kontributor");
    sheet.clear();
    var headers = [
      ["ID", "Nama Kontributor", "Platform", "Kontak ID", "Discord", "Status", "Total Kontribusi (Rp)", "Terdaftar Pada"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#8b5cf6").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.kontributorRows.length, data.kontributorRows[0].length).setValues(data.kontributorRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 5. Tab Kas
  if (data.kasRows && data.kasRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Kas");
    sheet.clear();
    var headers = [
      ["ID", "No. Anggota", "Nama Anggota", "ID LINE", "Periode", "Nominal (Rp)", "Status", "Bukti Bayar URL", "Tanggal Submit"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#f59e0b").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.kasRows.length, data.kasRows[0].length).setValues(data.kasRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 6. Tab Donasi
  if (data.donasiRows && data.donasiRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Donasi");
    sheet.clear();
    var headers = [
      ["ID", "Tipe Donatur", "Identitas", "Nama Donatur", "Kontak", "Tujuan / Tipe Donasi", "Nominal (Rp)", "Status", "Bukti Transfer URL", "Tanggal Donasi"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#ec4899").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.donasiRows.length, data.donasiRows[0].length).setValues(data.donasiRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 7. Tab Laporan Pengeluaran
  if (data.pengeluaranRows && data.pengeluaranRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Laporan Pengeluaran");
    sheet.clear();
    var headers = [
      ["No", "ID", "Tanggal", "Tahun", "Kategori", "Keperluan", "Nominal (Rp)", "Format Rupiah", "Penanggung Jawab (PJ)", "Bukti Nota URL", "Catatan"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#ef4444").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.pengeluaranRows.length, data.pengeluaranRows[0].length).setValues(data.pengeluaranRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 8. Tab Leaderboard Donatur
  if (data.leaderboardRows && data.leaderboardRows.length > 0) {
    var sheet = getOrCreateSheet(ss, "Leaderboard Kontributor");
    sheet.clear();
    var headers = [
      ["Rank", "Peringkat", "Nama", "Kontak", "Total Nominal (Rp)", "Format Rupiah", "Frekuensi Kontribusi"]
    ];
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers)
      .setFontWeight("bold").setBackground("#6366f1").setFontColor("#ffffff");
    sheet.getRange(2, 1, data.leaderboardRows.length, data.leaderboardRows[0].length).setValues(data.leaderboardRows);
    sheet.autoResizeColumns(1, headers[0].length);
  }

  // 9. Tab Matriks Tahunan (Kas 2024 s/d Kas 2029)
  if (data.yearlyMatrixTabs && data.yearlyMatrixTabs.length > 0) {
    for (var i = 0; i < data.yearlyMatrixTabs.length; i++) {
      var tab = data.yearlyMatrixTabs[i];
      if (!tab.tabName || !tab.dataRows || tab.dataRows.length === 0) continue;

      var sheet = getOrCreateSheet(ss, tab.tabName);
      sheet.clear();

      // Row 1: Judul
      sheet.getRange("A1").setValue("MATRIKS KAS TAHUN " + tab.tahun).setFontWeight("bold").setFontSize(14);
      sheet.getRange("A2").setValue("Grand Total Pemasukan: Rp " + Number(tab.grandTotalPemasukan || 0).toLocaleString("id-ID") + " | Total Pengeluaran: Rp " + Number(tab.totalPengeluaranKas || 0).toLocaleString("id-ID"));

      // Row 4: Header Kolom
      if (tab.headerRow4) {
        sheet.getRange(4, 1, 1, tab.headerRow4.length).setValues([tab.headerRow4])
          .setFontWeight("bold").setBackground("#c9a84c").setFontColor("#ffffff");
      }

      // Row 5: Total Bulanan
      if (tab.headerRow5) {
        sheet.getRange(5, 1, 1, tab.headerRow5.length).setValues([tab.headerRow5])
          .setFontWeight("bold").setBackground("#fef3c7").setFontColor("#92400e");
      }

      // Row 6+: Data Matriks
      var rowCount = tab.dataRows.length;
      var colCount = tab.dataRows[0].length;
      sheet.getRange(6, 1, rowCount, colCount).setValues(tab.dataRows);

      // Pasang Kotak Ceklis (Checkboxes) untuk Kolom Bulan 1 s/d 12 (Kolom F sampai Q)
      var monthCheckboxRange = sheet.getRange(6, 6, rowCount, 12);
      monthCheckboxRange.insertCheckboxes();
      monthCheckboxRange.setHorizontalAlignment("center");

      sheet.autoResizeColumns(1, 17);
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function handleAppendRow(ss, tabName, rowData) {
  var sheet = getOrCreateSheet(ss, tabName);
  var row = Array.isArray(rowData) ? rowData : Object.values(rowData);
  sheet.appendRow(row);
}

function handleUpdateStatus(ss, tabName, id, status, fullRow) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var idStr = String(id).trim();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === idStr) {
      if (fullRow && Array.isArray(fullRow)) {
        sheet.getRange(i + 1, 1, 1, fullRow.length).setValues([fullRow]);
      } else {
        var statusCol = tabName === "Kas" ? 7 : 8;
        sheet.getRange(i + 1, statusCol).setValue(status);
      }
      return;
    }
  }

  if (fullRow && Array.isArray(fullRow)) {
    sheet.appendRow(fullRow);
  }
}

function handleUpdateAnggotaStatus(ss, noAnggota, newStatus) {
  var sheet = ss.getSheetByName("Anggota");
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var target = String(noAnggota).trim().toLowerCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 9).setValue(newStatus);
      return;
    }
  }
}

function handleUpdateAnggotaJabatan(ss, noAnggota, newJabatan) {
  var sheet = ss.getSheetByName("Anggota");
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var target = String(noAnggota).trim().toLowerCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === target) {
      sheet.getRange(i + 1, 10).setValue(newJabatan);
      return;
    }
  }
}

function handleUpdateKasMatrixCell(ss, tabName, noAnggota, bulan, isPaid) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var target = String(noAnggota).trim().toLowerCase();
  var colIndex = 5 + Number(bulan);

  for (var i = 5; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === target) {
      var cell = sheet.getRange(i + 1, colIndex);
      cell.insertCheckboxes();
      cell.setHorizontalAlignment("center");
      cell.setValue(isPaid ? true : false);
      return;
    }
  }
}

function handleDeleteRow(ss, tabName, matchCol, matchValue) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var target = String(matchValue).trim().toLowerCase();
  var colIdx = (Number(matchCol) || 1) - 1;

  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][colIdx]).trim().toLowerCase() === target) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}