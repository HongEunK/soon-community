const bcrypt = require('bcrypt');
const userDB = require('../models/userDB');
const db = require('../database/db');

const textToHash = async (text) => {		// 텍스트 값을 hash로 변환
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(text, saltRounds);
        return hash
    } catch (err) {
        console.error(err);
        return err;
    }
}

exports.signup = async (req, res) => {
    const { member_id, password, student_number, name, gender, department } = req.body;

    try {
        const getUser = await userDB.getUser(member_id);
        if (getUser.length) {
            res.status(401).json('이미 존재하는 아이디입니다.');
            return;
        }

        const hash = await textToHash(password);
        const signUp = await userDB.signUp([
            member_id,
            hash,
            department || null,
            student_number,
            name,
            gender,
            'user',  // role 고정
        ]);
        res.status(200).json('가입 성공');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

const hashCompare = async (inputValue, hash) => {
    try {
        const isMatch = await bcrypt.compare(inputValue, hash);
        if (isMatch) return true;
        else return false;
    } catch(err) {
        console.error(err);
        return err;
    }
}

exports.loginCheck = async (req, res) => {
    const { member_id, password } = req.body;

    try {
        const getUser = await userDB.getUser(member_id);
        if (!getUser.length) {
            res.status(401).json('존재하지 않는 아이디입니다.');
            return;
        }

        const blobToStr = Buffer.from(getUser[0].password).toString();
        const isMatch = await hashCompare(password, blobToStr);

        if (!isMatch) {
            res.status(401).json('비밀번호가 일치하지 않습니다.');
            return;
        }
        res.status(200).json('로그인 성공');
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}

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