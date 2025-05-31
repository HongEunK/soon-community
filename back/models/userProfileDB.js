const db = require('../database/db'); // 데이터베이스 연결 설정

exports.getMemberProfile = (memberId) => {
  const query = `
    SELECT m.member_id, mp.height, mp.weight, mp.activity_level
    FROM member m
    JOIN member_profile mp ON m.member_id = mp.member_id
    WHERE m.member_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);  // results가 undefined일 수 있으니 기본값 빈 배열
    });
  });
};

exports.getMaxProfileId = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT MAX(profile_id) AS maxId FROM member_profile', (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0].maxId || 0);
    });
  });
};

exports.insertMemberProfile = ({ profile_id, height, weight, activity_level, member_id }) => {
  const insertQuery = `
    INSERT INTO member_profile (profile_id, height, weight, activity_level, member_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(insertQuery, [profile_id, height, weight, activity_level, member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};