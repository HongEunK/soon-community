
const db = require('../database/db'); // 데이터베이스 연결 설정

exports.incrementPostViewCount = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE post SET view_count = view_count + 1 WHERE post_id = ?';
    db.query(query, [postId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getPostDetailById = (postId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.post_id, p.title, p.content, p.created_date, p.view_count,
             p.is_public, 
             p.member_id,
             m.name AS author_name,
             GROUP_CONCAT(pkt.keyword_tag SEPARATOR ', ') AS keyword_tags
      FROM post p
      LEFT JOIN post_keyword_tag pkt ON p.post_id = pkt.post_id
      LEFT JOIN member m ON p.member_id = m.member_id
      WHERE p.post_id = ?
      GROUP BY p.post_id, m.name
    `;
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

exports.getCommentsByPostId = (postId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.comment_id, c.content, c.created_date, c.member_id, m.name AS nickname
      FROM comment c
      JOIN member m ON c.member_id = m.member_id
      WHERE c.post_id = ?
      ORDER BY c.created_date ASC
    `;
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

exports.addComment = (postId, member_id, content) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO comment (post_id, member_id, content) VALUES (?, ?, ?)';
    db.query(query, [postId, member_id, content.trim()], (err, result) => {
      if (err) reject(err);
      else resolve(result.insertId);
    });
  });
};

// 비공개 게시글은 작성자만 볼 수 있도록 조회 쿼리 수정
exports.getAllPostsWithTagsByMember = async (memberId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.post_id,
        p.title,
        p.content,
        p.created_date,
        p.view_count,
        p.is_public,
        p.member_id,
        m.member_id AS author_id,
        GROUP_CONCAT(pkt.keyword_tag SEPARATOR ', ') AS keyword_tags
      FROM post p
      LEFT JOIN member m ON p.member_id = m.member_id
      LEFT JOIN post_keyword_tag pkt ON p.post_id = pkt.post_id
      WHERE p.is_public = 1 OR p.member_id = ?
      GROUP BY p.post_id
      ORDER BY p.created_date DESC
    `;

    db.query(query, [memberId], (err, results) => {
      if (err) {
        console.error('게시글 목록 조회 오류:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.createPostWithTags = async ({ title, content, is_public, member_id, tags }) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT MAX(post_id) AS maxId FROM post', (err, results) => {
      if (err) return reject(err);

      const newPostId = (results[0].maxId || 0) + 1;

      // 직접 트랜잭션 없이 쿼리 실행 (단순화)
      db.query(
        `INSERT INTO post (post_id, title, content, is_public, member_id) VALUES (?, ?, ?, ?, ?)`,
        [newPostId, title, content, is_public, member_id],
        (err) => {
          if (err) return reject(err);

          if (tags && tags.length > 0) {
            const tagInserts = tags.map(tag => new Promise((res, rej) => {
              db.query(
                `INSERT INTO post_keyword_tag (post_id, keyword_tag) VALUES (?, ?)`,
                [newPostId, tag],
                (err) => (err ? rej(err) : res())
              );
            }));

            Promise.all(tagInserts)
              .then(() => resolve({ post_id: newPostId }))
              .catch(reject);
          } else {
            resolve({ post_id: newPostId });
          }
        }
      );
    });
  });
};

exports.getPostById = (postId) => {
  const query = `
    SELECT 
      p.post_id,
      p.title,
      p.content,
      p.created_date,
      p.view_count,
      GROUP_CONCAT(pk.keyword_tag) AS keyword_tags
    FROM post p
    LEFT JOIN post_keyword_tag pk ON p.post_id = pk.post_id
    WHERE p.post_id = ?
    GROUP BY p.post_id
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]); // 단일 게시글
    });
  });
};

exports.getPostAuthorId = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT member_id FROM post WHERE post_id = ?';
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else if (results.length === 0) resolve(null);
      else resolve(results[0].member_id);
    });
  });
};

exports.deletePostById = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM post WHERE post_id = ?';
    db.query(query, [postId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

exports.getPostById = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM post WHERE post_id = ?';
    db.query(query, [postId], (err, results) => {
      if (err) reject(err);
      else if (results.length === 0) resolve(null);
      else resolve(results[0]);
    });
  });
};

exports.updatePostById = (postId, title, content, is_public) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE post 
      SET title = ?, content = ?, is_public = ?
      WHERE post_id = ?
    `;
    db.query(query, [title, content, is_public, postId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};
