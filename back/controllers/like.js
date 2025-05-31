const db = require('../database/db');
const likeDB = require('../models/likeDB');

exports.getLikesCount = async (req, res) => {
  const postId = req.params.postId;
  try {
    const count = await likeDB.getLikesCountByPostId(postId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 개수 조회 실패' });
  }
};

exports.checkLiked = async (req, res) => {
  const postId = req.params.postId;
  const memberId = req.query.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  try {
    const liked = await likeDB.checkIfLiked(postId, memberId);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 여부 조회 실패' });
  }
};

exports.addLike = async (req, res) => {
  const postId = req.params.postId;
  const memberId = req.body.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  try {
    const alreadyLiked = await likeDB.checkIfLiked(postId, memberId);
    if (alreadyLiked) {
      return res.status(400).json({ message: '이미 좋아요를 누른 상태입니다.' });
    }

    await likeDB.addLike(postId, memberId);
    res.json({ message: '좋아요가 추가되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 추가 실패' });
  }
};

exports.removeLike = async (req, res) => {
  const postId = req.params.postId;
  const memberId = req.query.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  try {
    await likeDB.removeLike(postId, memberId);
    res.json({ message: '좋아요가 취소되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '좋아요 취소 실패' });
  }
};