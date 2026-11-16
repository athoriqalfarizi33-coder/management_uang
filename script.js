/* ==========================================
   DUITLY - POCKET MONEY MANAGEMENT
   Manage Your Money, Build Your Future.
========================================== */


/* 1. MENGAMBIL ELEMEN HTML */

const form = document.getElementById("formTransaksi");

const daftar = document.getElementById("daftarTransaksi");

const saldoEl = document.getElementById("saldo");

const pemasukanEl = document.getElementById("pemasukan");

const pengeluaranEl = document.getElementById("pengeluaran");

const targetInput = document.getElementById("target");

const progress = document.getElementById("progress");

const progressText = document.getElementById("progressText");

const targetMessage = document.getElementById("targetMessage");

const pilihanGrafik = document.getElementById("pilihanGrafik");

const grafikBatang = document.getElementById("grafikBatang");


/* 2. MENGAMBIL DATA LOCAL STORAGE */

function bacaData(key, nilaiDefault) {

    try {
        const data = localStorage.getItem(key);

        return data === null
            ? nilaiDefault
            : JSON.parse(data);

    } catch (error) {

        console.error("Gagal membaca data:", error);

        return nilaiDefault;

    }

}

let transaksi = bacaData("duitlyTransaksi", []);

let target = bacaData("duitlyTarget", 0);


/* 3. FORMAT MATA UANG RUPIAH */

function rupiah(angka) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0

    }).format(angka);

}


/* 4. FORMAT TANGGAL LOKAL */

function tanggalHariIni() {

    const sekarang = new Date();

    const tahun = sekarang.getFullYear();

    const bulan = String(
        sekarang.getMonth() + 1
    ).padStart(2, "0");

    const hari = String(
        sekarang.getDate()
    ).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;

}


function formatTanggal(tanggal) {

    const bagian = tanggal.split("-");

    const tahun = Number(bagian[0]);

    const bulan = Number(bagian[1]) - 1;

    const hari = Number(bagian[2]);

    const tanggalObjek = new Date(
        tahun,
        bulan,
        hari
    );

    return tanggalObjek.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* 5. MENYIMPAN DATA */

function simpanData() {

    localStorage.setItem(
        "duitlyTransaksi",
        JSON.stringify(transaksi)
    );

    localStorage.setItem(
        "duitlyTarget",
        JSON.stringify(target)
    );

}


/* 6. MENGHITUNG TOTAL KEUANGAN */

function hitungKeuangan() {

    let pemasukan = 0;

    let pengeluaran = 0;

    transaksi.forEach(item => {

        if (item.jenis === "pemasukan") {

            pemasukan += item.jumlah;

        } else if (item.jenis === "pengeluaran") {

            pengeluaran += item.jumlah;

        }

    });

    const saldo = pemasukan - pengeluaran;

    return {
        pemasukan,
        pengeluaran,
        saldo
    };

}


/* 7. MENAMPILKAN DASHBOARD */

function tampilkanDashboard() {

    const data = hitungKeuangan();

    saldoEl.textContent = rupiah(data.saldo);

    pemasukanEl.textContent = rupiah(data.pemasukan);

    pengeluaranEl.textContent = rupiah(data.pengeluaran);

}


/* 8. MENAMPILKAN RIWAYAT TRANSAKSI */

function tampilkanRiwayat() {

    daftar.replaceChildren();

    if (transaksi.length === 0) {

        const kosong = document.createElement("p");

        kosong.textContent = "Belum ada transaksi.";

        daftar.appendChild(kosong);

        return;

    }

    transaksi.forEach((item, index) => {

        const baris = document.createElement("div");

        baris.className = "transaksi";


        // INFORMASI TRANSAKSI

        const informasi = document.createElement("div");

        const nama = document.createElement("strong");

        nama.textContent = item.keterangan;

        const tanggal = document.createElement("small");

        tanggal.textContent = formatTanggal(item.tanggalISO);

        informasi.append(
            nama,
            document.createElement("br"),
            tanggal
        );


        // NOMINAL TRANSAKSI

        const rincian = document.createElement("div");

        const nominal = document.createElement("span");

        if (item.jenis === "pemasukan") {

            nominal.className = "masuk";

            nominal.textContent = "+ " + rupiah(item.jumlah);

        } else {

            nominal.className = "keluar";

            nominal.textContent = "- " + rupiah(item.jumlah);

        }


        // TOMBOL HAPUS

        const hapus = document.createElement("button");

        hapus.type = "button";

        hapus.textContent = "Hapus";

        hapus.addEventListener("click", function() {

            const yakin = confirm(
                "Apakah kamu yakin ingin menghapus transaksi ini?"
            );

            if (!yakin) return;

            transaksi.splice(index, 1);

            simpanData();

            tampilkanData();

        });


        rincian.append(
            nominal,
            document.createElement("br"),
            hapus
        );

        baris.append(informasi, rincian);

        daftar.appendChild(baris);

    });

}


/* 9. MENAMPILKAN GRAFIK HARIAN */

function tampilkanGrafik() {

    const mode = pilihanGrafik.value;

    const sekarang = new Date();

    let dataGrafik = [];


    // MENGAMBIL DATA 7 HARI TERAKHIR

    for (let i = 6; i >= 0; i--) {

        const tanggal = new Date(

            sekarang.getFullYear(),

            sekarang.getMonth(),

            sekarang.getDate() - i

        );


        const tahun = tanggal.getFullYear();

        const bulan = String(
            tanggal.getMonth() + 1
        ).padStart(2, "0");

        const hari = String(
            tanggal.getDate()
        ).padStart(2, "0");

        const tanggalKey = `${tahun}-${bulan}-${hari}`;


        // MENGHITUNG TOTAL HARIAN

        let total = 0;

        transaksi.forEach(item => {

            if (
                item.tanggalISO === tanggalKey &&
                item.jenis === mode
            ) {

                total += item.jumlah;

            }

        });


        dataGrafik.push({

            label: tanggal.toLocaleDateString(
                "id-ID",
                { weekday: "short" }
            ),

            nilai: total

        });

    }


    // MENENTUKAN NILAI MAKSIMUM

    const maksimum = Math.max(

        ...dataGrafik.map(item => item.nilai),

        1

    );


    // MEMBERSIHKAN GRAFIK LAMA

    grafikBatang.replaceChildren();


    // MEMBUAT GRAFIK BARU

    dataGrafik.forEach(item => {

        const kolom = document.createElement("div");

        kolom.className = "chart-column";

        if (mode === "pengeluaran") {

            kolom.classList.add("expense");

        }


        // NILAI GRAFIK

        const nilai = document.createElement("div");

        nilai.className = "chart-value";

        nilai.textContent = rupiah(item.nilai);


        // BATANG GRAFIK

        const batang = document.createElement("div");

        batang.className = "chart-bar";

        const tinggi = item.nilai > 0

            ? (item.nilai / maksimum) * 115

            : 3;

        batang.style.height = tinggi + "px";


        // LABEL HARI

        const label = document.createElement("div");

        label.className = "chart-label";

        label.textContent = item.label;


        kolom.append(

            nilai,

            batang,

            label

        );

        grafikBatang.appendChild(kolom);

    });

}


/* 10. MENGHITUNG TARGET TABUNGAN */

function tampilkanTarget() {

    const data = hitungKeuangan();

    const saldo = data.saldo;


    if (target <= 0) {

        progress.value = 0;

        progressText.textContent =
            "Target belum ditentukan.";

        targetMessage.textContent = "";

        targetMessage.classList.remove("active");

        return;

    }


    // MENGHITUNG PERSENTASE TARGET

    const persentase = Math.max(

        0,

        Math.min(100, (saldo / target) * 100)

    );


    progress.value = persentase;


    progressText.textContent =

        `Saldo tabungan: ${rupiah(Math.max(0, saldo))} ` +

        `dari ${rupiah(target)} (${persentase.toFixed(1)}%)`;


    // MEMERIKSA APAKAH TARGET TERCAPAI

    if (saldo >= target) {

        targetMessage.textContent =

            "🎉 Selamat! Target tabunganmu berhasil tercapai! " +

            "Kamu sudah berhasil mengelola uang dengan bijak. " +

            "Pertahankan kebiasaan baik ini!";

        targetMessage.classList.add("active");

    } else {

        targetMessage.textContent = "";

        targetMessage.classList.remove("active");

    }

}


/* 11. FUNGSI UTAMA MENAMPILKAN DATA */

function tampilkanData() {

    tampilkanDashboard();

    tampilkanRiwayat();

    tampilkanGrafik();

    tampilkanTarget();

}


/* 12. MENAMBAHKAN TRANSAKSI */

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const keterangan = document

        .getElementById("keterangan")

        .value.trim();


    const jumlah = Number(

        document.getElementById("jumlah").value

    );


    const jenis = document

        .getElementById("jenis")

        .value;


    // VALIDASI INPUT

    if (

        !keterangan ||

        !Number.isSafeInteger(jumlah) ||

        jumlah <= 0

    ) {

        alert("Masukkan keterangan dan nominal yang valid!");

        return;

    }


    // MENGHITUNG SALDO SAAT INI

    const data = hitungKeuangan();


    // MEMERIKSA KECUKUPAN SALDO

    if (

        jenis === "pengeluaran" &&

        jumlah > data.saldo

    ) {

        alert("Saldo tidak mencukupi untuk transaksi ini!");

        return;

    }


    // MENYIMPAN TRANSAKSI BARU

    const transaksiBaru = {

        id: Date.now(),

        keterangan: keterangan,

        jumlah: jumlah,

        jenis: jenis,

        tanggalISO: tanggalHariIni()

    };


    transaksi.unshift(transaksiBaru);


    // MENYIMPAN DAN MEMPERBARUI

    simpanData();

    tampilkanData();

    form.reset();


    alert("Transaksi berhasil disimpan!");

});


/* 13. MENYIMPAN TARGET TABUNGAN */

document

    .getElementById("simpanTarget")

    .addEventListener("click", function() {


        const nilaiTarget = Number(targetInput.value);


        if (

            !Number.isSafeInteger(nilaiTarget) ||

            nilaiTarget <= 0

        ) {

            alert("Masukkan target tabungan yang valid!");

            return;

        }


        target = nilaiTarget;


        simpanData();

        tampilkanData();


        alert("Target tabungan berhasil disimpan!");

    });


/* 14. MENGGANTI JENIS GRAFIK */

pilihanGrafik.addEventListener(

    "change",

    tampilkanGrafik

);


/* 15. MENAMPILKAN DATA SAAT WEBSITE DIBUKA */

targetInput.value = target || "";

tampilkanData();
