-- CreateTable
CREATE TABLE `andon_line1_lantai3` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_project` VARCHAR(50) NULL,
    `id_product` VARCHAR(50) NULL,
    `id_perproduct` VARCHAR(50) NULL,
    `product_name` VARCHAR(50) NULL,
    `timestamps` DATETIME(0) NULL,
    `start_actual` DATE NULL,
    `finish_actual` DATE NULL,
    `operator_assigned` INTEGER NULL,
    `operator_rfid` INTEGER NULL,
    `workstation` INTEGER NULL,
    `mtc_status` INTEGER NULL,
    `operator_actual` INTEGER NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ideal_time` (
    `id` INTEGER NULL,
    `project` VARCHAR(50) NULL,
    `id_product` VARCHAR(50) NULL,
    `product_name` VARCHAR(50) NULL,
    `id_process` VARCHAR(50) NULL,
    `process_name` VARCHAR(50) NULL,
    `workstation` INTEGER NULL,
    `duration_sec` INTEGER NULL,
    `duration_time` TIME(0) NULL,
    `percentage` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_material_612` (
    `wbs` VARCHAR(10) NOT NULL,
    `kategori` VARCHAR(20) NOT NULL,
    `produk` VARCHAR(30) NOT NULL,
    `kode_material` VARCHAR(20) NOT NULL,
    `komponen` VARCHAR(170) NOT NULL,
    `ts` TINYINT NOT NULL,
    `nama_produk` VARCHAR(40) NOT NULL,
    `qty_per_ts` VARCHAR(10) NOT NULL,
    `qty_terpenuhi` VARCHAR(10) NULL,
    `qty_deviasi` TINYINT NULL,
    `presentase_pemenuhan` VARCHAR(50) NULL,
    `status_pemenuhan` VARCHAR(20) NOT NULL,
    `ready` TINYINT NULL,
    `belum_ready` TINYINT NULL,
    `kekurangan_pada_ts` VARCHAR(10) NULL,
    `kekurangan_mulai_ts` TINYINT NOT NULL,
    `satuan` VARCHAR(10) NOT NULL,
    `tgl_datang_terakhir` VARCHAR(50) NULL,
    `lokasi_produksi` VARCHAR(10) NULL,
    `material_saat_ini` VARCHAR(10) NULL,
    `status_ts` VARCHAR(10) NULL,
    `komponen_belum_datang` VARCHAR(10) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal` (
    `id_product` VARCHAR(50) NULL,
    `project` VARCHAR(50) NULL,
    `trainset` INTEGER NULL,
    `product_name` VARCHAR(50) NULL,
    `jumlah_tiapts` INTEGER NULL,
    `total_personil` INTEGER NULL,
    `line` VARCHAR(50) NULL,
    `workshop` VARCHAR(50) NULL,
    `tanggal_mulai` DATE NULL,
    `tanggal_selesai` DATE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_produksi` (
    `timestamps` DATETIME(0) NULL,
    `pic_assy` VARCHAR(100) NULL,
    `pic_qc` VARCHAR(100) NULL,
    `pic_pulling` VARCHAR(100) NULL,
    `no_produk` VARCHAR(100) NULL,
    `status` VARCHAR(100) NULL,
    `id_product` VARCHAR(15) NULL,
    `trainset` INTEGER NULL,
    `nama_produk` VARCHAR(25) NULL,

    UNIQUE INDEX `timestamps`(`timestamps` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_jumlah_trainset` (
    `id_product` VARCHAR(10) NOT NULL,
    `id_kanban` VARCHAR(50) NULL,
    `product` TEXT NOT NULL,
    `jumlah_pertrainset` TINYINT NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operator` (
    `rf_id` INTEGER NULL,
    `nip` VARCHAR(50) NULL,
    `operator_name` VARCHAR(50) NULL,
    `unit_kerja` VARCHAR(50) NULL,
    `skill_level` INTEGER NULL,
    `work_hours` INTEGER NULL,
    `finish_good_product` INTEGER NULL,
    `mtc_handled` INTEGER NULL,
    `oee` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operator_qc` (
    `rf_id` INTEGER NULL,
    `nip` INTEGER NULL,
    `operator_name` VARCHAR(50) NULL,
    `unit_kerja` VARCHAR(50) NULL,
    `work_hours` INTEGER NULL,
    `finish_good_labeled` INTEGER NULL,
    `defect_labeled` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operator_scheduled` (
    `id` INTEGER NULL,
    `project_name` VARCHAR(50) NULL,
    `trainset` INTEGER NULL,
    `product_name` VARCHAR(50) NULL,
    `id_product` VARCHAR(50) NULL,
    `id_item` VARCHAR(50) NULL,
    `line` VARCHAR(50) NULL,
    `workstation` INTEGER NULL,
    `process_name` VARCHAR(50) NULL,
    `operator_nip_assigned` VARCHAR(50) NULL,
    `operator_rfid_assigned` INTEGER NULL,
    `operator_name_assigned` VARCHAR(50) NULL,
    `date_scheduled` DATE NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_progress` (
    `id_process` INTEGER NOT NULL AUTO_INCREMENT,
    `id_product` VARCHAR(50) NULL,
    `id_perproduct` VARCHAR(50) NULL,
    `project_name` VARCHAR(50) NULL,
    `product_name` VARCHAR(50) NULL,
    `trainset` INTEGER NULL,
    `line` VARCHAR(50) NULL,
    `workshop` VARCHAR(50) NULL,
    `process_name` VARCHAR(50) NULL,
    `workstation` INTEGER NULL,
    `operator_actual_rfid` INTEGER NULL,
    `operator_actual_name` VARCHAR(50) NULL,
    `start_actual` DATETIME(0) NULL,
    `duration_sec_actual` INTEGER NULL,
    `duration_time_actual` TIME(0) NULL,
    `status` VARCHAR(50) NULL,
    `finish_actual` DATETIME(0) NULL,
    `note_qc` VARCHAR(50) NULL,

    UNIQUE INDEX `id_process`(`id_process` ASC),
    PRIMARY KEY (`id_process` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_progress_backup` (
    `id_process` INTEGER NOT NULL AUTO_INCREMENT,
    `id_product` VARCHAR(50) NULL,
    `id_perproduct` VARCHAR(50) NULL,
    `project_name` VARCHAR(50) NULL,
    `product_name` VARCHAR(50) NULL,
    `trainset` INTEGER NULL,
    `line` VARCHAR(50) NULL,
    `workshop` VARCHAR(50) NULL,
    `process_name` VARCHAR(50) NULL,
    `workstation` INTEGER NULL,
    `operator_actual_rfid` INTEGER NULL,
    `operator_actual_name` VARCHAR(50) NULL,
    `start_actual` DATETIME(0) NULL,
    `duration_sec_actual` INTEGER NULL,
    `duration_time_actual` TIME(0) NULL,
    `status` VARCHAR(50) NULL,
    `finish_actual` DATETIME(0) NULL,
    `note_qc` VARCHAR(50) NULL,

    UNIQUE INDEX `id_process`(`id_process` ASC),
    PRIMARY KEY (`id_process` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_project` VARCHAR(50) NULL,
    `id_product` VARCHAR(50) NULL,
    `mppl` DATE NULL,
    `month` VARCHAR(50) NULL,
    `project` VARCHAR(50) NULL,
    `project_client` VARCHAR(50) NULL,
    `batch` INTEGER NULL,
    `trainset` INTEGER NULL,
    `workshop` VARCHAR(50) NULL,
    `line` VARCHAR(50) NULL,
    `product` VARCHAR(50) NULL,
    `production_hours` INTEGER NULL,
    `quantity` INTEGER NULL,
    `start_schedule` DATE NULL,
    `finish_schedule` DATE NULL,
    `qc_schedule` DATE NULL,
    `man_power` INTEGER NULL,
    `islembur` VARCHAR(50) NULL,
    `production_progress` VARCHAR(50) NULL,
    `start_actual` DATE NULL,
    `finish_actual` DATE NULL,
    `finish_qc` DATE NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scada_line1_lantai3` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `waktu_log` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status_ws1` BOOLEAN NULL,
    `status_ws2` BOOLEAN NULL,
    `status_ws3` BOOLEAN NULL,
    `status_ws4` BOOLEAN NULL,
    `status_ws5` BOOLEAN NULL,
    `timer_kerja_ws1` INTEGER NULL,
    `timer_kerja_ws2` INTEGER NULL,
    `timer_kerja_ws3` INTEGER NULL,
    `timer_kerja_ws4` INTEGER NULL,
    `timer_kerja_ws5` INTEGER NULL,
    `timer_kuning_ws1` INTEGER NULL,
    `timer_kuning_ws2` INTEGER NULL,
    `timer_kuning_ws3` INTEGER NULL,
    `timer_kuning_ws4` INTEGER NULL,
    `timer_kuning_ws5` INTEGER NULL,
    `timer_merah_ws1` INTEGER NULL,
    `timer_merah_ws2` INTEGER NULL,
    `timer_merah_ws3` INTEGER NULL,
    `timer_merah_ws4` INTEGER NULL,
    `timer_merah_ws5` INTEGER NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

