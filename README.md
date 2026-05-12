# About
Proyek ini dibuat untuk memenuhi tugas Mata Kuliah Kriptografi (II4021). Ave Maria adalah aplikasi web yang berfungsi sebagai klien percakapan dengan fitur kriptografis sebagai berikut:
1. Autentikasi JWT yang difasilitasi ECDSA (menggunakan kurva eliptik)
2. Pertukaran kunci ECDH (Elliptic Curve Diffie-Hellman)
3. Enkripsi pesan dengan AES-256 mode GCM

Aplikasi dibangun dengan stack MERN (MongoDB, Express, React, Node).
# Dependency
Sebelum memakai aplikasi, pastikan perangkat sudah memiliki:
1. MongoDB: https://www.mongodb.com/docs/manual/installation/
2. Node Packet Manager (npm): https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/

# Installation/Configuration
1. Pastikan semua dependensi berjalan (terutama pastikan MongoDB berjalan)
2. Unduh seluruh repositori (atau clone ke dalam sebuah folder)
3. Masuk ke folder `chatbackend` lalu ke folder `keygen` dan jalankan file generateKeys.js melalui terminal
4. Buat sebuah file `.env` dalam folder chatbackend dan salin kunci JWT yang diperoleh ke file itu
5. Buka terminal pada folder chatbackend DAN chatfrontend 
6. Masukkan perintah ```npm run dev``` pada KEDUA TERMINAL TERSEBUT
7. Aplikasi web bisa diakses pada ```localhost:3000```
