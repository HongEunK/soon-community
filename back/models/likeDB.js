const db = require('../database/db'); // 데이터베이스 연결 설정

exports.getLikesCountByPostId = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?';
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0].count);
    });
  });
};

exports.checkIfLiked = (postId, memberId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT 1 FROM likes WHERE post_id = ? AND member_id = ?';
    db.query(query, [postId, memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results.length > 0);
    });
  });
};

exports.addLike = (postId, memberId) => {
  return new Promise((resolve, reject) => {
    const insertQuery = 'INSERT INTO likes (post_id, member_id) VALUES (?, ?)';
    db.query(insertQuery, [postId, memberId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.removeLike = (postId, memberId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = 'DELETE FROM likes WHERE post_id = ? AND member_id = ?';
    db.query(deleteQuery, [postId, memberId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};