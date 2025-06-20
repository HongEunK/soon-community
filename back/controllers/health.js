const db = require('../database/db');
const healthDB = require('../models/healthDB');

exports.createExerciseRecord = async (req, res) => {
  try {
    const newRecord = req.body;
    await healthDB.insertExerciseRecord(newRecord);
    res.status(201).json({ message: '운동 기록이 저장되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 저장 중 오류 발생' });
  }
};

exports.getExerciseRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    const records = await healthDB.getExerciseRecords(member_id);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 조회 중 오류 발생' });
  }
};

exports.createDietRecord = async (req, res) => {
  try {
    const {
      member_id, food_name, amount, protein, fat,
      carbohydrate, calories, intake_date
    } = req.body;

    if (!member_id || !food_name || !amount || !protein || !fat || !carbohydrate || !calories || !intake_date) {
      return res.status(400).json({ error: '필수 값이 누락되었습니다.' });
    }

    await healthDB.insertDietRecord({ member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date });

    res.status(200).json({ message: "Diet record saved" });
  } catch (err) {
    console.error("Error inserting diet record:", err);
    res.status(500).send("DB error");
  }
};

exports.getDietRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ error: 'member_id가 필요합니다.' });

    const results = await healthDB.getDietRecordsByMember(member_id);
    res.json(results);
  } catch (err) {
    console.error("Error fetching diet records:", err);
    res.status(500).send("DB error");
  }
};

exports.createHealthStatus = async (req, res) => {
  try {
    const { member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage } = req.body;

    if (!member_id || !measurement_date) {
      return res.status(400).json({ error: '필수 값이 누락되었습니다.' });
    }

    // 유효하지 않은 body_fat_percentage 처리
    const allowedValues = ['underfat', 'normal', 'overweight', 'obese'];
    const bodyFat = allowedValues.includes(body_fat_percentage) ? body_fat_percentage : 'normal';

    await healthDB.insertHealthStatus({
      member_id,
      measurement_date,
      blood_pressure,
      blood_sugar,
      body_fat_percentage: bodyFat,
    });

    res.status(200).json({ message: "Health status saved" });
  } catch (err) {
    console.error("Error inserting health status:", err);
    res.status(500).send("DB error");
  }
};


exports.getHealthStatusRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ error: 'member_id가 필요합니다.' });

    const results = await healthDB.getHealthStatusRecordsByMember(member_id);
    res.json(results);
  } catch (err) {
    console.error("Error fetching health status records:", err);
    res.status(500).send("DB error");
  }
};

exports.getLatestHealthStatusEvaluation = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ error: 'member_id가 필요합니다.' });

    // 최근 건강 상태 기록 조회
    const latestStatus = await healthDB.getLatestHealthStatus(member_id);
    if (!latestStatus) {
      return res.status(404).json({ message: '최근 건강 상태 기록이 없습니다.' });
    }

    // 평가 조회
    const evaluation = await healthDB.getHealthStatusEvaluation(
      latestStatus.blood_pressure,
      latestStatus.blood_sugar,
      latestStatus.body_fat_percentage
    );

    if (!evaluation) {
      return res.status(404).json({ message: '해당 건강 상태 평가가 없습니다.' });
    }

    res.json(evaluation);

  } catch (err) {
    console.error('Error fetching health status evaluation:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
};

exports.getDailyHealthSummary = async (req, res) => {
  try {
    const { member_id, date } = req.query;

    if (!member_id) {
      return res.status(400).json({ error: 'member_id가 필요합니다.' });
    }

    const summary = await healthDB.getDailyHealthSummary(member_id, date);

    res.json(summary);
  } catch (err) {
    console.error('Error fetching daily health summary:', err);
    res.status(500).json({ error: '서버 오류 발생' });
  }
};