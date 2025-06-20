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

    // 프로필 기본 정보는 첫 번째 행에서 가져오기
    const profile = {
      member_id: results[0].member_id,
      name: results[0].name,
      height: results[0].height,
      weight: results[0].weight,
      activity_level: results[0].activity_level,
      keywords: results
        .filter(row => row.keyword_id)  // 키워드가 있는 행만 필터
        .map(row => ({
          keyword_id: row.keyword_id,
          keyword_name: row.keyword_name
        })),
    };

    res.json(profile);
  } catch (err) {
    console.error('DB 오류:', err);
    res.status(500).send('서버 에러');
  }
};


exports.createMemberProfile = async (req, res) => {
  try {
    const { member_id, height, weight, activity_level, keyword_id} = req.body;

    if (!member_id || !height || !weight || !activity_level || !keyword_id) {
      return res.status(400).json({ error: '필수 값이 없습니다.' });
    }

    const maxProfileId = await userDB.getMaxProfileId();
    const profile_id = maxProfileId + 1;

    // 1. 프로필 저장
    await userDB.insertMemberProfile({ profile_id, height, weight, activity_level, member_id });

    // 2. selection 테이블 저장
    await userDB.insertSelection({ profile_id, keyword_id });

    res.status(200).json({ message: '프로필 및 키워드 저장 성공' });

  } catch (err) {
    console.error('프로필 생성 오류:', err);
    res.status(500).send('서버 에러');
  }
};

// GET /api/health-keywords
exports.getHealthKeywords = async (req, res) => {
  db.query('SELECT keyword_id, keyword_name FROM health_issue_keyword', (err, results) => {
    if (err) return res.status(500).send('DB 오류');
    res.json(results);
  });
};

exports.updateMemberProfile = async (req, res) => {
  const memberId = req.params.member_id;
  const { height, weight, activity_level, keywords } = req.body;

  if (!height || !weight || !activity_level) {
    return res.status(400).json({ error: '신장, 체중, 활동 수준은 필수입니다.' });
  }

  try {
    // 1. 프로필 업데이트
    await userDB.updateMemberProfile({ member_id: memberId, height, weight, activity_level });

    // 2. 프로필 ID 조회
    const profileId = await userDB.getProfileIdByMemberId(memberId);

    if (!profileId) {
      return res.status(404).json({ error: '프로필이 존재하지 않습니다.' });
    }

    // 3. 기존 selection 삭제 후 새 keyword 저장 (단일 키워드만 저장)
    await userDB.deleteSelectionByProfileId(profileId);
    
    if (keywords && keywords.length > 0) {
      await userDB.insertSelection({ profile_id: profileId, keyword_id: keywords[0] });
    }

    res.status(200).json({ message: '프로필 수정 성공' });

  } catch (err) {
    console.error('프로필 수정 오류:', err);
    res.status(500).send('서버 에러');
  }
};
