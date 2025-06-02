const db = require('../database/db'); // 데이터베이스 연결 설정

exports.signUp = (data) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO member (member_id, password, department, student_number, name, gender, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data[0], data[1], data[2], data[3], data[4], data[5], data[6]],
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
};

exports.getUser = (member_id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM member where member_id = ?`, member_id, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

exports.deleteUser = (member_id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM member WHERE member_id = ?`, [member_id], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};
