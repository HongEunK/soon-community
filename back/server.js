const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.get('/api/test', (res) => {
    console.log('test');
});

app.listen(3001, () => {		// 3001번 포트로 서버 실행
    console.log("서버 실행")
});