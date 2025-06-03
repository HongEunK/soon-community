const adminDB = require('../models/adminDB');
const userDB = require('../models/userDB');

exports.getAllMembers = async (req, res) => {
    try {
        const members = await adminDB.getAllUsers(); 
        res.status(200).json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '회원 조회 실패', error: err });
    }
};

exports.deleteMember = async (req, res) => {
    const { member_id } = req.params;
    try {
        await adminDB.deleteUser(member_id);
        res.status(200).json({ message: '회원 삭제 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '회원 삭제 실패', error: err });
    }
};

exports.deleteMember = async (req, res) => {
  const { member_id } = req.params;
  try {
    await userDB.deleteUser(member_id);
    res.status(200).json({ message: '회원 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '회원 삭제 실패', error: err });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await adminDB.getAllPosts();
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '게시글 조회 실패', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { post_id } = req.params;
  try {
    await adminDB.deletePost(post_id);
    res.status(200).json({ message: '게시글 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '게시글 삭제 실패', error: err.message });
  }
};
