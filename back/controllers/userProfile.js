const bcrypt = require('bcrypt');
const userDB = require('../models/userProfileDB');
const db = require('../database/db');

exports.getMemberProfile = async (req, res) => {
  const memberId = req.params.member_id;

  try {
    const results = await userDB.getMemberProfile(memberId);

    if (results.length === 0) {
      return res.status(404).send('프로필이 존재하지 않습니다.');
    }

    res.json(results[0]);
  } catch (err) {
    console.error('DB 오류:', err);
    res.status(500).send('서버 에러');
  }
};

exports.createMemberProfile = async (req, res) => {
  try {
    const { member_id, height, weight, activity_level } = req.body;

    if (!member_id || !height || !weight || !activity_level) {
      return res.status(400).json({ error: '필수 값이 없습니다.' });
    }

    // profile_id 최대값 조회
    const maxProfileId = await userDB.getMaxProfileId();
    const profile_id = maxProfileId + 1;

    // 데이터 삽입
    await userDB.insertMemberProfile({ profile_id, height, weight, activity_level, member_id });

    res.status(200).json({ message: '프로필 생성 성공', profile_id });

  } catch (err) {
    console.error('프로필 생성 오류:', err);
    res.status(500).send('서버 에러');
  }
};