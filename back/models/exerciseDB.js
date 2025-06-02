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
    const query = 'CALL getExerciseRecommendationsByTargetProc(?)';
    db.query(query, [target], (err, results) => {
      if (err) reject(err);
      else {
        resolve(results[0]);
      }
    });
  });
};

exports.getExerciseRecommendationRank = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
  r.exercise_id,
  e.exercise_name,
  COUNT(*) AS recommend_count,
  RANK() OVER (ORDER BY COUNT(*) DESC) AS rank_position
FROM recommendation r
JOIN exercise_recommendation e ON r.exercise_id = e.exercise_id
GROUP BY r.exercise_id, e.exercise_name
ORDER BY recommend_count DESC;
    `;
    db.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
