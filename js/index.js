const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const path = require('path');


app.use(express.static(path.join(__dirname, '../')));

// 루트 경로에 대한 요청을 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

https.createServer({
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
}, app).listen(3000, '0.0.0.0', () => {
  console.log('HTTPS server running on https://localhost:3000');
});

