
/* =========================================
   KINERJAKU
   SISTEM FUZZY LOGIC METODE MAMDANI
   ========================================= */

// 1. FUNGSI KEANGGOTAAN FUZZY

function keanggotaanRendah(nilai) {
    if (nilai <= 30) return 1;
    if (nilai >= 50) return 0;

    return (50 - nilai) / 20;
}

function keanggotaanSedang(nilai) {
    if (nilai <= 30 || nilai >= 70) return 0;
    if (nilai <= 50) return (nilai - 30) / 20;

    return (70 - nilai) / 20;
}

function keanggotaanTinggi(nilai) {
    if (nilai <= 50) return 0;
    if (nilai >= 70) return 1;

    return (nilai - 50) / 20;
}


// 2. PROSES FUZZIFIKASI

function fuzzifikasi(nilai) {
    return {
        rendah: keanggotaanRendah(nilai),
        sedang: keanggotaanSedang(nilai),
        tinggi: keanggotaanTinggi(nilai)
    };
}


// 3. MEMBUAT 27 ATURAN FUZZY

const himpunan = ["rendah", "sedang", "tinggi"];

const aturanFuzzy = [];

for (let disiplin of himpunan) {
    for (let produktivitas of himpunan) {
        for (let tanggungJawab of himpunan) {

            const jumlah =
                himpunan.indexOf(disiplin) +
                himpunan.indexOf(produktivitas) +
                himpunan.indexOf(tanggungJawab);

            let output;

            if (jumlah <= 2) {
                output = "buruk";
            } else if (jumlah <= 4) {
                output = "cukup";
            } else {
                output = "baik";
            }

            aturanFuzzy.push({
                disiplin,
                produktivitas,
                tanggungJawab,
                output
            });
        }
    }
}


// 4. FUNGSI INFERENSI MAMDANI

function inferensiMamdani(
    fuzzyDisiplin,
    fuzzyProduktivitas,
    fuzzyTanggungJawab
) {

    const hasilAgregasi = {
        buruk: 0,
        cukup: 0,
        baik: 0
    };

    let aturanAktif = 0;

    for (let aturan of aturanFuzzy) {

        // Mengambil derajat keanggotaan setiap input

        const nilaiDisiplin =
            fuzzyDisiplin[aturan.disiplin];

        const nilaiProduktivitas =
            fuzzyProduktivitas[aturan.produktivitas];

        const nilaiTanggungJawab =
            fuzzyTanggungJawab[aturan.tanggungJawab];

        // Operator AND menggunakan MIN

        const alpha = Math.min(
            nilaiDisiplin,
            nilaiProduktivitas,
            nilaiTanggungJawab
        );

        if (alpha > 0) {
            aturanAktif++;
        }

        // Agregasi menggunakan MAX

        hasilAgregasi[aturan.output] = Math.max(
            hasilAgregasi[aturan.output],
            alpha
        );
    }

    return {
        hasilAgregasi,
        aturanAktif
    };
}


// 5. FUNGSI KEANGGOTAAN OUTPUT

function keanggotaanOutput(kategori, nilai) {

    if (kategori === "buruk") {
        return keanggotaanRendah(nilai);
    }

    if (kategori === "cukup") {
        return keanggotaanSedang(nilai);
    }

    if (kategori === "baik") {
        return keanggotaanTinggi(nilai);
    }

    return 0;
}


// 6. DEFUZZIFIKASI METODE CENTROID

function defuzzifikasi(hasilAgregasi) {

    let pembilang = 0;
    let penyebut = 0;

    // Menghitung nilai output dari 0 sampai 100
    // Dengan interval 0,5

    for (let x = 0; x <= 100; x += 0.5) {

        // Implikasi MIN dan agregasi MAX

        const buruk = Math.min(
            hasilAgregasi.buruk,
            keanggotaanOutput("buruk", x)
        );

        const cukup = Math.min(
            hasilAgregasi.cukup,
            keanggotaanOutput("cukup", x)
        );

        const baik = Math.min(
            hasilAgregasi.baik,
            keanggotaanOutput("baik", x)
        );

        // Agregasi semua output

        const nilaiFuzzy = Math.max(
            buruk,
            cukup,
            baik
        );

        pembilang += x * nilaiFuzzy;
        penyebut += nilaiFuzzy;
    }

    if (penyebut === 0) {
        return 0;
    }

    return pembilang / penyebut;
}


// 7. MENENTUKAN KATEGORI KINERJA

function kategoriKinerja(nilai) {

    if (nilai < 40) {
        return "Buruk";
    }

    if (nilai < 70) {
        return "Cukup";
    }

    return "Baik";
}


// 8. PROSES UTAMA PERHITUNGAN FUZZY

function hitungKinerja(disiplin, produktivitas, tanggungJawab) {

    // Fuzzifikasi

    const fuzzyDisiplin = fuzzifikasi(disiplin);

    const fuzzyProduktivitas = fuzzifikasi(produktivitas);

    const fuzzyTanggungJawab = fuzzifikasi(tanggungJawab);

    // Inferensi Mamdani

    const hasilInferensi = inferensiMamdani(
        fuzzyDisiplin,
        fuzzyProduktivitas,
        fuzzyTanggungJawab
    );

    // Defuzzifikasi Centroid

    const nilaiAkhir = defuzzifikasi(
        hasilInferensi.hasilAgregasi
    );

    // Kategori akhir

    const kategori = kategoriKinerja(nilaiAkhir);

    return {
        fuzzyDisiplin,
        fuzzyProduktivitas,
        fuzzyTanggungJawab,
        hasilAgregasi: hasilInferensi.hasilAgregasi,
        aturanAktif: hasilInferensi.aturanAktif,
        nilaiAkhir,
        kategori
    };
}


// 9. MENGHUBUNGKAN PROGRAM DENGAN FORM HTML

const form = document.getElementById("formPenilaian");

const hasilPenilaian = document.getElementById("hasilPenilaian");


// 10. PROSES KETIKA TOMBOL HITUNG DIKLIK

form.addEventListener("submit", function(event) {

    event.preventDefault();

    // Mengambil data input

    const nama = document.getElementById("nama").value.trim();

    const disiplin = Number(
        document.getElementById("disiplin").value
    );

    const produktivitas = Number(
        document.getElementById("produktivitas").value
    );

    const tanggungJawab = Number(
        document.getElementById("tanggungJawab").value
    );

    // Memastikan input berada pada rentang 0-100

    if (
        nama === "" ||
        !Number.isFinite(disiplin) ||
        !Number.isFinite(produktivitas) ||
        !Number.isFinite(tanggungJawab) ||
        disiplin < 0 || disiplin > 100 ||
        produktivitas < 0 || produktivitas > 100 ||
        tanggungJawab < 0 || tanggungJawab > 100
    ) {
        alert("Masukkan data dengan benar. Nilai harus 0-100.");
        return;
    }

    // Menjalankan sistem fuzzy

    const hasil = hitungKinerja(
        disiplin,
        produktivitas,
        tanggungJawab
    );

    // Menampilkan hasil

    hasilPenilaian.innerHTML = `
        <div class="result-data">

            <h3>Hasil Penilaian Karyawan</h3>

            <p>
                <strong>Nama Karyawan:</strong>
                <span id="namaHasil"></span>
            </p>

            <p>
                <strong>Kedisiplinan:</strong> ${disiplin}
            </p>

            <p>
                <strong>Produktivitas:</strong> ${produktivitas}
            </p>

            <p>
                <strong>Tanggung Jawab:</strong> ${tanggungJawab}
            </p>

            <hr style="margin: 15px 0; border: 1px solid #bfdbfe;">

            <p>Nilai Akhir Kinerja:</p>

            <div class="result-score">
                ${hasil.nilaiAkhir.toFixed(2)}
            </div>

            <span class="result-category">
                Kategori: ${hasil.kategori}
            </span>

            <p style="margin-top: 15px; font-size: 13px;">
                Aturan fuzzy yang aktif:
                ${hasil.aturanAktif} dari 27 aturan
            </p>

            <p style="margin-top: 8px; font-size: 12px;">
                Metode: Fuzzy Mamdani - Centroid
            </p>

        </div>
    `;

    // Menampilkan nama sebagai teks agar aman dari HTML

    document.getElementById("namaHasil").textContent = nama;

});


// 11. RESET HASIL PENILAIAN

form.addEventListener("reset", function() {

    hasilPenilaian.innerHTML = `
        <div class="result-placeholder">

            <div class="result-icon">📊</div>

            <h3>Belum Ada Penilaian</h3>

            <p>
                Silakan masukkan nilai karyawan
                dan klik Hitung Kinerja.
            </p>
            /* =================================
   FITUR LOGIN DAN LOGOUT KINERJAKU
================================= */

// Username dan password untuk demonstrasi
const usernameBenar = "admin";
const passwordBenar = "12345";

// Mengambil elemen HTML
const halamanLogin = document.getElementById("halamanLogin");
const halamanDashboard = document.getElementById("halamanDashboard");
const formLogin = document.getElementById("formLogin");
const tombolLogout = document.getElementById("tombolLogout");
const pesanLogin = document.getElementById("pesanLogin");
const namaPengguna = document.getElementById("namaPengguna");

// Fungsi menampilkan halaman sesuai status login
function periksaLogin() {
    const statusLogin = sessionStorage.getItem("statusLogin");

    if (statusLogin === "aktif") {
        halamanLogin.style.display = "none";
        halamanDashboard.style.display = "flex";

        namaPengguna.textContent =
            sessionStorage.getItem("usernameAktif") || "Administrator";
    } else {
        halamanLogin.style.display = "flex";
        halamanDashboard.style.display = "none";
    }
}

// Proses ketika tombol Login ditekan
formLogin.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (
        username === usernameBenar &&
        password === passwordBenar
    ) {
        sessionStorage.setItem("statusLogin", "aktif");
        sessionStorage.setItem("usernameAktif", username);

        pesanLogin.textContent = "";

        periksaLogin();
    } else {
        pesanLogin.textContent =
            "Username atau password salah!";

        document.getElementById("password").value = "";
    }
});

// Proses ketika tombol Logout ditekan
tombolLogout.addEventListener("click", function() {
    sessionStorage.removeItem("statusLogin");
    sessionStorage.removeItem("usernameAktif");

    formLogin.reset();

    periksaLogin();
});

// Memeriksa status login ketika halaman dibuka
periksaLogin();

        </div>
    `;

});
