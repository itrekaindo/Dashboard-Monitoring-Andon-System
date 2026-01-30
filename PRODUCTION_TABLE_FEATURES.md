# Production Progress Table - Fitur Baru

## Deskripsi
Tabel Detail Produksi menampilkan informasi lengkap tentang progress produksi dengan fitur pencarian, penyaringan, dan pengurutan yang komprehensif.

## Fitur-Fitur Utama

### 1. **Kolom Data**
- **ID Perproduk**: Identifier unik untuk setiap produk produksi
- **Nama Produk**: Nama produk yang sedang diproduksi
- **Workstation**: Nomor workstation tempat proses berlangsung
- **Operator**: Nama operator yang menjalankan proses
- **Mulai**: Waktu mulai proses produksi
- **Durasi**: Lama waktu proses berlangsung
- **Selesai**: Waktu selesai proses produksi
- **Status**: Status proses dengan visualisasi warna dan ikon

### 2. **Filter Tanggal**
Default menampilkan data **7 hari terakhir**

Opsi filter yang tersedia:
- Hari ini
- 3 hari terakhir
- 7 hari terakhir ✓ (default)
- 14 hari terakhir
- 30 hari terakhir
- 90 hari terakhir
- 1 tahun terakhir

### 3. **Search/Pencarian**
Setiap kolom memiliki fitur search independen:

#### a. Search ID Perproduk
- Pencarian text real-time
- Case-insensitive
- Tombol clear untuk menghapus filter

#### b. Search Nama Produk
- Pencarian text real-time
- Case-insensitive
- Tombol clear untuk menghapus filter

#### c. Search Workstation
- Pencarian nomor workstation
- Exact match
- Tombol clear untuk menghapus filter

#### d. Search Operator
- Pencarian nama operator
- Case-insensitive
- Tombol clear untuk menghapus filter

#### e. Search Tanggal Mulai
- Pencarian format tanggal (contoh: "19 Jan")
- Partial match
- Tombol clear untuk menghapus filter

### 4. **Sort/Pengurutan**
Fitur sort untuk kolom-kolom berikut:
- **ID Perproduk**: Ascending/Descending
- **Nama Produk**: Ascending/Descending
- **Workstation**: Ascending/Descending (numeric)
- **Operator**: Ascending/Descending (alphabetic)
- **Mulai**: Ascending/Descending (default: **Descending** - terbaru duluan)
- **Durasi**: Ascending/Descending (time format)
- **Selesai**: Ascending/Descending

Indikator sort ditampilkan dengan chevron (↑/↓) di header kolom

### 5. **Visualisasi Status**
Setiap status memiliki warna dan ikon unik:

#### Status Colors:
| Status | Warna | Ikon | Makna |
|--------|-------|------|-------|
| Gangguan | Merah Rose | ⚠ | Ada masalah/kendala |
| Tunggu | Amber/Orange | ⏸ | Menunggu sesuatu |
| Finish Good | Hijau/Emerald | ✓ | Proses selesai dengan baik |
| Not OK / Tidak OK | Merah | ✗ | Proses tidak memenuhi standar |
| Masuk WS | Biru | ▶ | Sedang berlangsung |
| Unknown/None | Abu-abu | ○ | Status tidak diketahui |

### 6. **Ringkasan Statistik**
Di bawah tabel, terdapat 4 card statistik:
- **Total**: Jumlah total item yang ditampilkan
- **Selesai**: Jumlah item yang sudah selesai (ada finish_actual)
- **Proses**: Jumlah item yang sedang berlangsung (ada start_actual, tidak ada finish_actual)
- **Belum Mulai**: Jumlah item yang belum dimulai (tidak ada start_actual)

### 7. **Responsive Design**
- Overflow-x untuk layar kecil (horizontal scroll)
- Grid summary yang responsif (2 kolom mobile, 4 kolom desktop)
- Optimized untuk berbagai ukuran layar

## Default Behavior

### Saat Pertama Kali Load:
1. ✓ Filter: 7 hari terakhir
2. ✓ Sort: Start Actual (Terbaru duluan)
3. ✓ Search: Kosong (menampilkan semua data sesuai filter tanggal)

## Penggunaan

### Pencarian Multi-Kolom:
User dapat melakukan pencarian di multiple kolom sekaligus. Misalnya:
- Filter workstation "3" + operator "Budi" = menampilkan hanya proses WS3 yang dikerjakan Budi

### Clear Filter:
Setiap search field memiliki tombol X yang muncul ketika ada input. Klik untuk clear filter tersebut.

### Ubah Tanggal Range:
Dropdown di atas kanan memungkinkan quick change untuk date range

### Sort Multistep:
Hanya bisa sort 1 kolom pada saat yang sama. Klik kolom lain untuk mengganti sort column.

## Technical Details

### File Komponen:
- **Location**: `components/production/ProductionProgressTable.tsx`
- **Type**: Client Component (uses useState, useMemo)
- **Dependencies**: lucide-react, Badge UI component

### Integration:
- **Location**: `app/production-progress/timeline/timeline-content.tsx`
- **Import**: `import ProductionProgressTable from "@/components/production/ProductionProgressTable";`
- **Usage**: `<ProductionProgressTable data={recent} />`

### Data Type:
```typescript
interface ProductionProgress {
  id_process: number;
  id_product: string | null;
  id_perproduct: string | null;
  project_name: string | null;
  product_name: string | null;
  line: string | null;
  workshop: string | null;
  process_name: string | null;
  workstation: number | null;
  operator_actual_rfid: number | null;
  operator_actual_name: string | null;
  start_actual: Date | string | null;
  duration_sec_actual: number | null;
  duration_time_actual: string | null;
  status: string | null;
  note_qc?: string | null;
  finish_actual: Date | string | null;
}
```

## Performance Optimization

### useMemo Hooks:
1. **dateFiltered**: Computed ketika `data` atau `daysFilter` berubah
2. **filtered**: Computed ketika `dateFiltered` atau `searches` berubah
3. **sorted**: Computed ketika `filtered`, `sortColumn`, atau `sortDirection` berubah

Ini memastikan hanya data yang relevan yang di-recompute.

### Null Safety:
- Semua null/undefined values ditampilkan sebagai "—"
- Sorting handles null values dengan baik (always at end/start based on direction)

## Future Enhancement Ideas

1. Pagination untuk data yang besar (1000+ rows)
2. Column visibility toggle (show/hide columns)
3. Export ke CSV/Excel
4. Advanced filter builder
5. Grouped view by workstation atau operator
6. Real-time update dengan WebSocket
7. Comparison view (sebelum vs sesudah filter)
