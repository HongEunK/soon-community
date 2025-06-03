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
            res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
            return;
        }

        const blobToStr = Buffer.from(getUser[0].password).toString();
        const isMatch = await hashCompare(password, blobToStr);

        if (!isMatch) {
            res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        // 로그인 성공 시 role과 함께 반환
        res.status(200).json({
            message: '로그인 성공',
            member_id: getUser[0].member_id,
            role: getUser[0].role, // 'user' 또는 'admin'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류', error: err });
    }
};

exports.withdraw = async (req, res) => {
    const { member_id, password } = req.body;

    try {
        // 사용자 존재 여부 확인
        const getUser = await userDB.getUser(member_id);
        if (!getUser.length) {
            res.status(404).json('존재하지 않는 회원입니다.');
            return;
        }

        // 비밀번호 확인
        const blobToStr = Buffer.from(getUser[0].password).toString();
        const isMatch = await hashCompare(password, blobToStr);

        if (!isMatch) {
            res.status(401).json('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 회원 삭제
        await userDB.deleteUser(member_id);
        res.status(200).json('회원 탈퇴가 완료되었습니다.');
    } catch (err) {
        console.error(err);
        res.status(500).json('서버 오류로 인해 탈퇴에 실패했습니다.');
    }
};