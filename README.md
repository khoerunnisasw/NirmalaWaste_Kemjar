# ♻️ Nirmala Waste Platform

Nirmala Waste Platform adalah sistem informasi tata kelola sampah berbasis web yang dirancang dengan pendekatan **Security by Design**. Aplikasi ini mendigitalisasi pelaporan, penimbangan, dan konversi sampah menjadi poin bernilai ekonomis dengan perlindungan mutlak pada *Application Layer* dan *Infrastructure Security*.

Proyek ini dikembangkan sebagai pemenuhan Tugas Besar Keamanan Jaringan dan Aplikasi.

##  Fitur Keamanan (Security Implementations)
Sistem ini telah memenuhi standar keamanan OWASP Top 10 dan kontrol keamanan tingkat lanjut:
-  **Password Hashing:** Menggunakan algoritma `bcrypt` dengan 12 *salt rounds*.
-  **Session Management:** Kuki sesi diamankan dengan flag `Secure`, `HttpOnly`, dan `SameSite=Lax`.
-  **Input Validation:** *Allowlist validation* yang ketat menggunakan `express-validator`.
-  **SQLi Protection:** Penerapan murni *Parameterized Queries* via `mysql2`.
-  **XSS Protection:** Pembersihan muatan (*payload*) kotor via `xss-clean` dan pemetaan DOM React.
-  **CSRF Protection:** Mekanisme *Double-Submit Cookie* via `csurf` dan HTTP Headers Axios.
-  **Rate Limiting:** Pencegahan *Brute-Force* via `express-rate-limit` pada jalur otentikasi.
-  **Role-Based Access Control (RBAC):** Validasi *middleware* berbasis peran (Warga vs Admin).
-  **Secure File Upload:** Penangkapan berkas di RAM (`multer`) & *re-encoding* ke format murni JPG (`sharp`).
-  **Centralized Logging:** Aktivitas terekam dalam format JSON via `Winston` untuk dibaca oleh agen SIEM (Wazuh/Suricata).
-  **Poin Plus:** Reverse Proxy Lokal (Vite), HTTPS/TLS terenkripsi, dan Arsitektur WAF Sederhana.

---

## Teknologi yang Digunakan
* **Frontend:** React.js, Vite, Tailwind CSS, Axios.
* **Backend:** Node.js, Express.js.
* **Database:** MySQL.
* **Security & SIEM:** Wazuh Agent, Suricata NIDS (via Linux VM).

---

## Panduan Instalasi (Installation Guide)

### Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (Versi 18+ direkomendasikan)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)
* Git

### 1. Kloning Repositori
```bash
git clone [https://github.com/username/nirmala-waste.git](https://github.com/username/nirmala-waste.git)
cd nirmala-waste
