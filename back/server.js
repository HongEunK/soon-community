const express = require('express');
const cors = require("cors");
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use('/api', userRoutes);

const db = require('./database/db');

app.get('/', (req, res) => {
    db.query('SELECT * FROM table_name', function (err, results, fields) {
        if (err) throw err;
        res.send(results);
    });
});

app.post("/api/insert", (req,res) => {
    const title = req.body.title;
    const content = req.body.content;
    const date = req.body.date
    const sqlQuery = "INSERT INTO easyboard (title, content, date) VALUES (?,?,?)";
    db.query(sqlQuery, [title, content, date], (err, result) => {
        res.send('succ');
    })
})

const port = 3001;
app.listen(port, () => {		// 3001번 포트로 서버 실행
    console.log(`Server is running on port ${port}`);
});
