const db = require('../database/db'); // 데이터베이스 연결 설정

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

exports.getExerciseRecommendationsByTarget = (target) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT er.exercise_id, er.exercise_name
      FROM exercise_recommendation er
      JOIN exercise_recommendation_target ert ON er.exercise_id = ert.exercise_id
      WHERE ert.target = ?
      ORDER BY er.exercise_id ASC
    `;
    db.query(query, [target], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};