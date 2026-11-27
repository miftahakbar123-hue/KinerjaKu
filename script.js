
/* =========================================
   KINERJAKU - FUZZY MAMDANI
   LOGIN ADMIN DAN KARYAWAN
========================================= */


/* =========================================
   BAGIAN A: PERHITUNGAN FUZZY MAMDANI
========================================= */

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

function fuzzifikasi(nilai) {
    return {
        rendah: keanggotaanRendah(nilai),
        sedang: keanggotaanSedang(nilai),
        tinggi: keanggotaanTinggi(nilai)
    };
}

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
        const nilaiDisiplin = fuzzyDisiplin[aturan.disiplin];
        const nilaiProduktivitas =
            fuzzyProduktivitas[aturan.produktivitas];
        const nilaiTanggungJawab =
            fuzzyTanggungJawab[aturan.tanggungJawab];

        const alpha = Math.min(
            nilaiDisiplin,
            nilaiProduktivitas,
            nilaiTanggungJawab
        );

        if (alpha > 0) aturanAktif++;

        hasilAgregasi[aturan.output] = Math.max(
            hasilAgregasi[aturan.output],
            alpha
        );
    }

    return { hasilAgregasi, aturanAktif };
}

function keanggotaanOutput(kategori, nilai) {
    if (kategori === "buruk") return keanggotaanRendah(nilai);
    if (kategori === "cukup") return keanggotaanSedang(nilai);
    if (kategori === "baik") return keanggotaanTinggi(nilai);
    return 0;
}

function defuzzifikasi(hasilAgregasi) {
    let pembilang = 0;
    let penyebut = 0;

    for (let x = 0; x <= 100; x += 0.5) {
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

        const nilaiFuzzy = Math.max(buruk, cukup, baik);

        pembilang += x * nilaiFuzzy;
        penyebut += nilaiFuzzy;
    }

    return penyebut === 0 ? 0 : pembilang / penyebut;
}

function kategoriKinerja(nilai) {
    if (nilai < 40) return "Buruk";
    if (nilai < 70) return "Cukup";
    return "Baik";
}

function hitungKinerja(disiplin, produktivitas, tanggungJawab) {
    const fuzzyDisiplin = fuzzifikasi(disiplin);
    const fuzzyProduktivitas = fuzzifikasi(produktivitas);
    const fuzzyTanggungJawab = fuzzifikasi(tanggungJawab);

    const hasilInferensi = inferensiMamdani(
        fuzzyDisiplin,
        fuzzyProduktivitas,
        fuzzyTanggungJawab
    );

    const nilaiAkhir = defuzzifikasi(
        hasilInferensi.hasilAgregasi
    );

    return {
        nilaiAkhir,
        kategori: kategoriKinerja(nilaiAkhir),
        aturanAktif: hasilInferensi.aturanAktif
    };
}


/* =========================================
   BAGIAN B: PENYIMPANAN DATA LOKAL
========================================= */

function ambilData(kunci) {
    try {
        return JSON.parse(localStorage.getItem(kunci)) || [];
    } catch (error) {
        return [];
    }
}

function simpanData(kunci, data) {
    localStorage.setItem(kunci, JSON.stringify(data));
}

function usernameNormal(username) {
    return username.trim().toLowerCase();
}

function ambilAkun() {
    return ambilData("akunKinerjaKu");
}

function ambilPenilaian() {
    return ambilData("dataPenilaianKinerjaKu");
}


/* =========================================
   BAGIAN C: ELEMEN WEBSITE
========================================= */

const halamanLogin = document.getElementById("halamanLogin");
const halamanDashboard = document.getElementById("halamanDashboard");

const formLogin = document.getElementById("formLogin");
const formRegistrasi = document.getElementById("formRegistrasi");
const formPenilaian = document.getElementById("formPenilaian");

const bagianLogin = document.getElementById("bagianLogin");
const bagianRegistrasi = document.getElementById("bagianRegistrasi");

const pesanLogin = document.getElementById("pesanLogin");
const pesanRegistrasi = document.getElementById("pesanRegistrasi");

const hasilPenilaian = document.getElementById("hasilPenilaian");
const namaPengguna = document.getElementById("namaPengguna");
const rolePengguna = document.getElementById("rolePengguna");

const akunKaryawan = document.getElementById("akunKaryawan");
const menuPenilaian = document.getElementById("menuPenilaian");


/* =========================================
   BAGIAN D: AKUN ADMIN
========================================= */

// Ganti username dan password ini sebelum digunakan.
// Ini hanya untuk demonstrasi, bukan autentikasi aman.

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";


/* =========================================
   BAGIAN E: REGISTRASI KARYAWAN
========================================= */

document.getElementById("linkDaftar").addEventListener("click", function(event) {
    event.preventDefault();

    bagianLogin.style.display = "none";
    bagianRegistrasi.style.display = "block";

    pesanRegistrasi.textContent = "";
});

document.getElementById("linkLogin").addEventListener("click", function(event) {
    event.preventDefault();

    bagianRegistrasi.style.display = "none";
    bagianLogin.style.display = "block";

    pesanLogin.textContent = "";
});

formRegistrasi.addEventListener("submit", function(event) {
    event.preventDefault();

    const nama = document.getElementById("namaDaftar").value.trim();
    const username = usernameNormal(
        document.getElementById("usernameDaftar").value
    );
    const password = document.getElementById("passwordDaftar").value;
    const konfirmasi = document.getElementById("konfirmasiPassword").value;

    if (!nama || !username || !password) {
        pesanRegistrasi.textContent = "Semua kolom wajib diisi.";
        return;
    }

    if (!/^[a-z0-9_.-]{4,20}$/.test(username)) {
        pesanRegistrasi.textContent =
            "Username 4-20 karakter, gunakan huruf kecil, angka, titik, garis bawah, atau tanda hubung.";
        return;
    }

    if (username === ADMIN_USERNAME) {
        pesanRegistrasi.textContent = "Username tidak tersedia.";
        return;
    }

    if (password.length < 6) {
        pesanRegistrasi.textContent =
            "Password minimal terdiri dari 6 karakter.";
        return;
    }

    if (password !== konfirmasi) {
        pesanRegistrasi.textContent =
            "Konfirmasi password tidak sama.";
        return;
    }

    const akun = ambilAkun();

    const sudahAda = akun.some(
        user => user.username === username
    );

    if (sudahAda) {
        pesanRegistrasi.textContent =
            "Username sudah digunakan. Silakan gunakan username lain.";
        return;
    }

    akun.push({
        nama: nama,
        username: username,
        password: password,
        role: "karyawan"
    });

    simpanData("akunKinerjaKu", akun);

    formRegistrasi.reset();

    bagianRegistrasi.style.display = "none";
    bagianLogin.style.display = "block";

    document.getElementById("jenisLogin").value = "karyawan";
    document.getElementById("username").value = username;

    pesanLogin.textContent =
        "Registrasi berhasil. Silakan login menggunakan akun baru Anda.";
});


/* =========================================
   BAGIAN F: LOGIN
========================================= */

formLogin.addEventListener("submit", function(event) {
    event.preventDefault();

    const jenis = document.getElementById("jenisLogin").value;
    const username = usernameNormal(
        document.getElementById("username").value
    );
    const password = document.getElementById("password").value;

    let pengguna = null;

    if (jenis === "admin") {
        if (
            username === ADMIN_USERNAME &&
            password === ADMIN_PASSWORD
        ) {
            pengguna = {
                nama: "Administrator",
                username: ADMIN_USERNAME,
                role: "admin"
            };
        }
    } else {
        const akun = ambilAkun();

        pengguna = akun.find(user =>
            user.username === username &&
            user.password === password &&
            user.role === "karyawan"
        ) || null;
    }

    if (!pengguna) {
        pesanLogin.textContent =
            "Username, password, atau jenis akun tidak sesuai.";

        document.getElementById("password").value = "";
        return;
    }

    sessionStorage.setItem("penggunaAktif", JSON.stringify({
        nama: pengguna.nama,
        username: pengguna.username,
        role: pengguna.role
    }));

    formLogin.reset();
    pesanLogin.textContent = "";

    tampilkanDashboard();
});


/* =========================================
   BAGIAN G: PENGATURAN DASHBOARD
========================================= */

function ambilPenggunaAktif() {
    try {
        return JSON.parse(sessionStorage.getItem("penggunaAktif"));
    } catch (error) {
        return null;
    }
}

function tampilkanDashboard() {
    const pengguna = ambilPenggunaAktif();

    if (!pengguna) {
        halamanLogin.style.display = "flex";
        halamanDashboard.style.display = "none";
        return;
    }

    halamanLogin.style.display = "none";
    halamanDashboard.style.display = "flex";

    namaPengguna.textContent = pengguna.nama;
    rolePengguna.textContent =
        pengguna.role === "admin" ? "ADMIN" : "KARYAWAN";

    const admin = pengguna.role === "admin";

    // Menu input hanya untuk admin
    document.getElementById("penilaian").style.display =
        admin ? "block" : "none";

    menuPenilaian.style.display =
        admin ? "block" : "none";

    document.getElementById("judulSelamatDatang").textContent =
        admin
            ? "Selamat Datang, Admin!"
            : "Selamat Datang, " + pengguna.nama + "!";

    document.getElementById("deskripsiSelamatDatang").textContent =
        admin
            ? "Silakan kelola data dan lakukan penilaian kinerja karyawan."
            : "Berikut adalah hasil penilaian kinerja Anda.";

    document.getElementById("judulHasil").textContent =
        admin ? "Seluruh Hasil Penilaian" : "Hasil Penilaian Saya";

    document.getElementById("deskripsiHasil").textContent =
        admin
            ? "Daftar hasil penilaian seluruh karyawan."
            : "Berikut hasil penilaian berdasarkan akun Anda.";

    if (admin) {
        perbaruiPilihanKaryawan();
    }

    tampilkanHasil();
}


/* =========================================
   BAGIAN H: PILIH AKUN KARYAWAN
========================================= */

function perbaruiPilihanKaryawan() {
    const akun = ambilAkun();

    akunKaryawan.innerHTML =
        '<option value="">Pilih username karyawan</option>';

    akun.forEach(user => {
        const option = document.createElement("option");
        option.value = user.username;
        option.textContent = user.nama + " (" + user.username + ")";
        akunKaryawan.appendChild(option);
    });
}


/* =========================================
   BAGIAN I: INPUT DAN HITUNG PENILAIAN
========================================= */

formPenilaian.addEventListener("submit", function(event) {
    event.preventDefault();

    const pengguna = ambilPenggunaAktif();

    if (!pengguna || pengguna.role !== "admin") {
        alert("Hanya Admin yang dapat menginput penilaian.");
        return;
    }

    const username = akunKaryawan.value;

    const akun = ambilAkun();
    const karyawan = akun.find(user =>
        user.username === username
    );

    if (!karyawan) {
        alert("Pilih akun karyawan yang terdaftar.");
        return;
    }

    const disiplin = Number(
        document.getElementById("disiplin").value
    );

    const produktivitas = Number(
        document.getElementById("produktivitas").value
    );

    const tanggungJawab = Number(
        document.getElementById("tanggungJawab").value
    );

    if (
        !Number.isFinite(disiplin) ||
        !Number.isFinite(produktivitas) ||
        !Number.isFinite(tanggungJawab) ||
        disiplin < 0 || disiplin > 100 ||
        produktivitas < 0 || produktivitas > 100 ||
        tanggungJawab < 0 || tanggungJawab > 100
    ) {
        alert("Nilai harus berada di antara 0 sampai 100.");
        return;
    }

    const hasil = hitungKinerja(
        disiplin,
        produktivitas,
        tanggungJawab
    );

    const dataPenilaian = ambilPenilaian();

    dataPenilaian.push({
        id: Date.now(),
        username: karyawan.username,
        nama: karyawan.nama,
        disiplin: disiplin,
        produktivitas: produktivitas,
        tanggungJawab: tanggungJawab,
        nilaiAkhir: hasil.nilaiAkhir,
        kategori: hasil.kategori,
        aturanAktif: hasil.aturanAktif,
        tanggal: new Date().toLocaleString("id-ID")
    });

    simpanData("dataPenilaianKinerjaKu", dataPenilaian);

    formPenilaian.reset();

    alert("Penilaian berhasil disimpan.");

    tampilkanHasil();
});


/* =========================================
   BAGIAN J: MENAMPILKAN HASIL PENILAIAN
========================================= */

function tampilkanHasil() {
    const pengguna = ambilPenggunaAktif();

    if (!pengguna) return;

    const semuaPenilaian = ambilPenilaian();

    let dataTampil;

    if (pengguna.role === "admin") {
        dataTampil = semuaPenilaian;
    } else {
        dataTampil = semuaPenilaian.filter(data =>
            data.username === pengguna.username
        );
    }

    if (dataTampil.length === 0) {
        hasilPenilaian.innerHTML = `
            <div class="result-placeholder">
                <div class="result-icon">📊</div>
                <h3>Belum Ada Penilaian</h3>
                <p>
                    ${
                        pengguna.role === "admin"
                        ? "Belum ada data penilaian yang dimasukkan."
                        : "Belum ada hasil penilaian untuk akun Anda."
                    }
                </p>
            </div>
        `;
        return;
    }

    hasilPenilaian.innerHTML = "";

    // Tampilkan data terbaru di bagian atas
    dataTampil.slice().reverse().forEach(data => {
        const kartu = document.createElement("div");
        kartu.className = "result-data";

        const judul = document.createElement("h3");
        judul.textContent = "Hasil Penilaian Karyawan";
        kartu.appendChild(judul);

        function tambahBaris(label, nilai) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = label + ": ";
            p.appendChild(strong);
            p.appendChild(document.createTextNode(String(nilai)));
            kartu.appendChild(p);
        }

        tambahBaris("Nama Karyawan", data.nama);

        if (pengguna.role === "admin") {
            tambahBaris("Username", data.username);
        }

        tambahBaris("Kedisiplinan", data.disiplin);
        tambahBaris("Produktivitas", data.produktivitas);
        tambahBaris("Tanggung Jawab", data.tanggungJawab);
        tambahBaris("Tanggal Penilaian", data.tanggal);

        const garis = document.createElement("hr");
        garis.style.margin = "15px 0";
        kartu.appendChild(garis);

        const labelNilai = document.createElement("p");
        labelNilai.textContent = "Nilai Akhir Kinerja:";
        kartu.appendChild(labelNilai);

        const nilai = document.createElement("div");
        nilai.className = "result-score";
        nilai.textContent = Number(data.nilaiAkhir).toFixed(2);
        kartu.appendChild(nilai);

        const kategori = document.createElement("span");
        kategori.className = "result-category";
        kategori.textContent = "Kategori: " + data.kategori;
        kartu.appendChild(kategori);

        tambahBaris(
            "Aturan fuzzy yang aktif",
            data.aturanAktif + " dari 27 aturan"
        );

        tambahBaris("Metode", "Fuzzy Mamdani - Centroid");

        hasilPenilaian.appendChild(kartu);
    });
}


/* =========================================
   BAGIAN K: LOGOUT
========================================= */

document.getElementById("tombolLogout").addEventListener("click", function() {
    sessionStorage.removeItem("penggunaAktif");

    formLogin.reset();
    formRegistrasi.reset();

    bagianRegistrasi.style.display = "none";
    bagianLogin.style.display = "block";

    tampilkanHalamanLogin();
});

function tampilkanHalamanLogin() {
    halamanLogin.style.display = "flex";
    halamanDashboard.style.display = "none";

    pesanLogin.textContent = "";
    pesanRegistrasi.textContent = "";
}


/* =========================================
   BAGIAN L: SAAT WEBSITE DIBUKA
========================================= */

const penggunaAwal = ambilPenggunaAktif();

if (penggunaAwal) {
    tampilkanDashboard();
} else {
    tampilkanHalamanLogin();
}
