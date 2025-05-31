const db = require('../database/db'); // 데이터베이스 연결 설정

exports.insertDietRecord = ({ member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date }) => {
  const query = `
    INSERT INTO diet_record 
    (member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getDietRecordsByMember = (member_id) => {
  const query = `SELECT * FROM diet_record WHERE member_id = ? ORDER BY intake_date DESC`;
  return new Promise((resolve, reject) => {
    db.query(query, [member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};

exports.insertHealthStatus = ({ member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage }) => {
  const query = `
    INSERT INTO health_status_record 
    (member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage)
    VALUES (?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getHealthStatusRecordsByMember = (member_id) => {
  const query = `SELECT * FROM health_status_record WHERE member_id = ? ORDER BY measurement_date DESC`;
  return new Promise((resolve, reject) => {
    db.query(query, [member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};

// 운동 기록 삽입
exports.insertExerciseRecord = (record) => {
  const {
    exercise_date,
    exercise_type,
    exercise_duration,
    exercise_intensity,
    calories_burned,
    member_id
  } = record;

  const query = `
    INSERT INTO exercise_record (exercise_date, exercise_type, exercise_duration, exercise_intensity, calories_burned, member_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [exercise_date, exercise_type, exercise_duration, exercise_intensity, calories_burned, member_id];

  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// 운동 기록 조회
exports.getExerciseRecords = (memberId) => {
  const query = `
    SELECT * FROM exercise_record
    WHERE member_id = ?
    ORDER BY exercise_date DESC
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};