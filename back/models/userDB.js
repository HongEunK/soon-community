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

exports.createExerciseGoal = ({ member_id, target_calories_burned, target_exercise_duration }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO exercise_goal (member_id, target_calories_burned, target_exercise_duration)
      VALUES (?, ?, ?)
    `;
    db.query(query, [member_id, target_calories_burned, target_exercise_duration], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

exports.getExerciseGoalsByMember = (member_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT goal_id, start_date, target_calories_burned, target_exercise_duration
      FROM exercise_goal
      WHERE member_id = ?
      ORDER BY start_date DESC
    `;
    db.query(query, [member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};