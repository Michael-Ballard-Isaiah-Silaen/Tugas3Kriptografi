# About
Proyek ini dibuat untuk memenuhi tugas Mata Kuliah Kriptografi (II4021). Ave Maria adalah aplikasi web yang berfungsi sebagai klien percakapan dengan fitur kriptografis sebagai berikut:
1. Autentikasi JWT yang difasilitasi ECDSA (menggunakan kurva eliptik)
2. Pertukaran kunci ECDH (Elliptic Curve Diffie-Hellman)
3. Enkripsi pesan dengan AES-256 mode GCM
4. MAC SHA-256 untuk pesan

# Stack
Aplikasi dibangun dengan stack MERN (MongoDB, Express, React, Node).

# Dependency
Sebelum memakai aplikasi, pastikan perangkat sudah memiliki:
1. MongoDB: https://www.mongodb.com/docs/manual/installation/
2. Node Packet Manager (npm): https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/
3. Docker: https://docs.docker.com/engine/install/

# Installation/Configuration
1. Pastikan semua dependensi berjalan (terutama pastikan MongoDB dan Docker berjalan)
2. Unduh seluruh repositori (atau clone ke dalam sebuah folder)
3. Masuk ke folder `chatbackend` lalu ke folder `keygen` dan jalankan file generateKeys.js melalui terminal
4. Buat sebuah file `.env` dalam folder chatbackend dan salin kedua kunci JWT yang diperoleh ke file itu
5. Buka terminal di folder Tugas3Kriptografi 
6. Masukkan perintah ```docker-compose up -d --build``` pada terminal tersebut
7. Aplikasi web bisa diakses pada ```localhost:3000```
8. Jika ingin tes aplikasi web untuk melihat message exchange secara real-time, bukalah ```localhost:3000``` satu tab di browser biasa dan satu tab lagi di browser tapi status incognito/private window
