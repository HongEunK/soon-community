const db = require('../database/db'); // 데이터베이스 연결 설정

exports.getMemberProfile = (memberId) => {
  const query = `
    SELECT 
      m.member_id, 
      m.name,
      mp.height, 
      mp.weight, 
      mp.activity_level,
      hik.keyword_id,
      hik.keyword_name
    FROM member m
    JOIN member_profile mp ON m.member_id = mp.member_id
    LEFT JOIN selection s ON mp.profile_id = s.profile_id
    LEFT JOIN health_issue_keyword hik ON s.keyword_id = hik.keyword_id
    WHERE m.member_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
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

exports.insertSelection = ({ profile_id, keyword_id }) => {
  const query = `
    INSERT INTO selection (profile_id, keyword_id)
    VALUES (?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [profile_id, keyword_id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

exports.updateMemberProfile = ({ member_id, height, weight, activity_level }) => {
  const query = `
    UPDATE member_profile
    SET height = ?, weight = ?, activity_level = ?
    WHERE member_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [height, weight, activity_level, member_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getProfileIdByMemberId = (member_id) => {
  const query = `SELECT profile_id FROM member_profile WHERE member_id = ?`;

  return new Promise((resolve, reject) => {
    db.query(query, [member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]?.profile_id || null);
    });
  });
};

exports.deleteSelectionByProfileId = (profile_id) => {
  const query = `DELETE FROM selection WHERE profile_id = ?`;

  return new Promise((resolve, reject) => {
    db.query(query, [profile_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};