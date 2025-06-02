const db = require('../database/db');
const exerciseDB = require('../models/exerciseDB');

exports.createExerciseGoal = async (req, res) => {
  try {
    const { member_id, target_calories_burned, target_exercise_duration } = req.body;

    if (!member_id || !target_calories_burned || !target_exercise_duration) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    await exerciseDB.createExerciseGoal({ member_id, target_calories_burned, target_exercise_duration });

    res.status(200).json({ message: '운동 목표가 성공적으로 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getExerciseGoalsByMember = async (req, res) => {
  try {
    const member_id = req.params.member_id;
    const goals = await exerciseDB.getExerciseGoalsByMember(member_id);

    res.status(200).json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getExerciseRecommendationsByTarget = async (req, res) => {
  try {
    const target = req.query.target;
    if (!target) {
      return res.status(400).json({ error: 'target 쿼리 파라미터가 필요합니다.' });
    }

    const recommendations = await exerciseDB.getExerciseRecommendationsByTarget(target);
    res.status(200).json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};


exports.getExerciseRecommendationRank = async (req, res) => {
  try {
    const rankList = await exerciseDB.getExerciseRecommendationRank();
    res.status(200).json(rankList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};