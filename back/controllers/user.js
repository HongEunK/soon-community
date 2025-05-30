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
    const results = await userDB.getUser(memberId);

    if (results.length === 0) {
      return res.status(404).send('사용자 없음');
    }

    res.json(results[0]);
  } catch (err) {
    console.error('DB 오류:', err);
    res.status(500).send('서버 에러');
  }
};

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

const getNextProfileId = async () => {
  const result = await new Promise((resolve, reject) => {
    db.query('SELECT MAX(profile_id) AS maxId FROM member_profile', (err, res) => {
      if (err) reject(err);
      else resolve(res[0].maxId || 0);
    });
  });
  return result + 1;
};

exports.createMemberProfile = async (req, res) => {
  try {
    const { member_id, height, weight, activity_level } = req.body;

    if (!member_id || !height || !weight || !activity_level) {
      return res.status(400).json({ error: '필수 값이 없습니다.' });
    }

    const result = await new Promise((resolve, reject) => {
      db.query('SELECT MAX(profile_id) AS maxId FROM member_profile', (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].maxId || 0);
      });
    });

    const profile_id = result + 1;
    console.log("profile_id:", profile_id);

    // DB 삽입
    const insertQuery = `
      INSERT INTO member_profile (profile_id, height, weight, activity_level, member_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [profile_id, height, weight, activity_level, member_id], (err, results) => {
        if (err) {
          console.error('삽입 중 에러:', err); // 로그 추가
          reject(err);
        } else resolve(results);
      });
    });

    res.status(200).json({ message: '프로필 생성 성공', profile_id });

  } catch (err) {
    console.error('프로필 생성 오류:', err); // 로그 확인
    res.status(500).send('서버 에러');
  }
};

exports.createExerciseGoal = async (req, res) => {
  try {
    const { member_id, target_calories_burned, target_exercise_duration } = req.body;

    if (!member_id || !target_calories_burned || !target_exercise_duration) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    await userDB.createExerciseGoal({ member_id, target_calories_burned, target_exercise_duration });

    res.status(200).json({ message: '운동 목표가 성공적으로 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getExerciseGoalsByMember = async (req, res) => {
  try {
    const member_id = req.params.member_id;
    const goals = await userDB.getExerciseGoalsByMember(member_id);

    res.status(200).json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 운동 기록 추가
exports.createExerciseRecord = async (req, res) => {
  try {
    const newRecord = req.body;
    await userDB.insertExerciseRecord(newRecord);
    res.status(201).json({ message: '운동 기록이 저장되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 저장 중 오류 발생' });
  }
};

// 운동 기록 조회
exports.getExerciseRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    const records = await userDB.getExerciseRecords(member_id);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 조회 중 오류 발생' });
  }
};

exports.createDietRecord = (req, res) => {
  const {
    member_id, food_name, amount, protein, fat,
    carbohydrate, calories, intake_date
  } = req.body;

  const query = `
    INSERT INTO diet_record 
    (member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date], (err, result) => {
    if (err) {
      console.error("Error inserting diet record:", err);
      return res.status(500).send("DB error");
    }
    res.send("Diet record saved");
  });
};

exports.getDietRecords = (req, res) => {
  const { member_id } = req.query;
  const query = `SELECT * FROM diet_record WHERE member_id = ? ORDER BY intake_date DESC`;

  db.query(query, [member_id], (err, results) => {
    if (err) {
      console.error("Error fetching diet records:", err);
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
};

exports.createHealthStatus = (req, res) => {
  const { member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage } = req.body;
  const query = `
    INSERT INTO health_status_record 
    (member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage], (err, result) => {
    if (err) {
      console.error("Error inserting health status:", err);
      return res.status(500).send("DB error");
    }
    res.send("Health status saved");
  });
};

exports.getHealthStatusRecords = (req, res) => {
  const { member_id } = req.query;
  const query = `SELECT * FROM health_status_record WHERE member_id = ? ORDER BY measurement_date DESC`;

  db.query(query, [member_id], (err, results) => {
    if (err) {
      console.error("Error fetching health status records:", err);
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
};

exports.getCommunityPosts = async (req, res) => {
  try {
    const posts = await userDB.getAllPostsWithTags();
    res.status(200).json(posts);
  } catch (err) {
    console.error("게시글 조회 중 오류:", err);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, is_public, member_id, tags } = req.body;

    if (!title || !content || typeof is_public === 'undefined' || !member_id) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }

    // tags는 쉼표 구분 문자열일 수도 있으니 배열이면 그대로, 아니면 쉼표로 분리 처리
    let tagArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagArray = tags;
      } else if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    const result = await userDB.createPostWithTags({ title, content, is_public, member_id, tags: tagArray });

    res.status(201).json({ message: '게시글이 성공적으로 작성되었습니다.', post_id: result.post_id });
  } catch (err) {
    console.error('게시글 작성 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.getPostById = (req, res) => {
  const postId = req.params.postId;

  // 1. 조회수 증가
  db.query('UPDATE post SET view_count = view_count + 1 WHERE post_id = ?', [postId], (updateErr) => {
    if (updateErr) {
      console.error(updateErr);
      return res.status(500).json({ message: '조회수 업데이트 실패' });
    }

    // 2. 게시글 상세 조회 (작성자 닉네임 포함)
    db.query(
  `SELECT p.post_id, p.title, p.content, p.created_date, p.view_count,
          p.member_id,
          m.name AS author_name,
          GROUP_CONCAT(pkt.keyword_tag SEPARATOR ', ') AS keyword_tags
   FROM post p
   LEFT JOIN post_keyword_tag pkt ON p.post_id = pkt.post_id
   LEFT JOIN member m ON p.member_id = m.member_id
   WHERE p.post_id = ?
   GROUP BY p.post_id, m.name`,
  [postId],
  (selectErr, results) => {
    if (selectErr) {
      console.error(selectErr);
      return res.status(500).json({ message: '게시글 조회 실패' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(results[0]);
  }
);

  });
};



// 좋아요 개수 조회
exports.getLikesCount = (req, res) => {
  const postId = req.params.postId;
  const query = 'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?'; // post_likes -> likes
  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '좋아요 개수 조회 실패' });
    }
    res.json({ count: results[0].count });
  });
};

// 내가 좋아요 눌렀는지 조회
exports.checkLiked = (req, res) => {
  const postId = req.params.postId;
  const memberId = req.query.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  const query = 'SELECT 1 FROM likes WHERE post_id = ? AND member_id = ?'; // post_likes -> likes
  db.query(query, [postId, memberId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '좋아요 여부 조회 실패' });
    }
    res.json({ liked: results.length > 0 });
  });
};

// 좋아요 누르기
exports.addLike = (req, res) => {
  const postId = req.params.postId;
  const memberId = req.body.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  const checkQuery = 'SELECT 1 FROM likes WHERE post_id = ? AND member_id = ?'; // post_likes -> likes
  db.query(checkQuery, [postId, memberId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: '좋아요 추가 실패' });
    }
    if (checkResults.length > 0) {
      return res.status(400).json({ message: '이미 좋아요를 누른 상태입니다.' });
    }

    const insertQuery = 'INSERT INTO likes (post_id, member_id) VALUES (?, ?)'; // post_likes -> likes
    db.query(insertQuery, [postId, memberId], (insertErr) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ message: '좋아요 추가 실패' });
      }
      res.json({ message: '좋아요가 추가되었습니다.' });
    });
  });
};

// 좋아요 취소
exports.removeLike = (req, res) => {
  const postId = req.params.postId;
  const memberId = req.query.memberId;
  if (!memberId) return res.status(400).json({ message: 'memberId 필요' });

  const deleteQuery = 'DELETE FROM likes WHERE post_id = ? AND member_id = ?'; // post_likes -> likes
  db.query(deleteQuery, [postId, memberId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '좋아요 취소 실패' });
    }
    res.json({ message: '좋아요가 취소되었습니다.' });
  });
};

// 댓글 목록 조회
exports.getComments = (req, res) => {
  const postId = req.params.postId;
  const query = `
    SELECT c.comment_id, c.content, c.created_date, c.member_id, m.name AS nickname
    FROM comment c
    JOIN member m ON c.member_id = m.member_id
    WHERE c.post_id = ?
    ORDER BY c.created_date ASC
  `;
  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '댓글 목록 조회 실패' });
    }
    res.json(results);
  });
};

exports.addComment = (req, res) => {
  const postId = req.params.postId;
  const { content, member_id } = req.body;  // 수정: memberId → member_id
  if (!content || !content.trim()) return res.status(400).json({ message: '댓글 내용을 입력하세요.' });
  if (!member_id) return res.status(400).json({ message: '로그인이 필요합니다.' });

  const query = 'INSERT INTO comment (post_id, member_id, content) VALUES (?, ?, ?)';
  db.query(query, [postId, member_id, content.trim()], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '댓글 등록 실패' });
    }
    res.json({ comment_id: result.insertId, message: '댓글이 등록되었습니다.' });
  });
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;
  const member_id = req.query.memberId;  // 프론트에서 params로 보내는 멤버 아이디

  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  // 먼저 게시글 작성자 확인
  const checkQuery = 'SELECT member_id FROM post WHERE post_id = ?';
  db.query(checkQuery, [postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 오류' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (results[0].member_id !== member_id) {
      return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' });
    }

    // 작성자 맞으면 삭제 실행
    const deleteQuery = 'DELETE FROM post WHERE post_id = ?';
    db.query(deleteQuery, [postId], (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: '게시글 삭제 실패' });
      }
      res.json({ message: '게시글이 삭제되었습니다.' });
    });
  });
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;
  const member_id = req.query.memberId;  // 프론트에서 params로 보내는 멤버 아이디

  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  // 먼저 게시글 작성자 확인
  const checkQuery = 'SELECT member_id FROM post WHERE post_id = ?';
  db.query(checkQuery, [postId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 오류' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (results[0].member_id !== member_id) {
      return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' });
    }

    // 작성자 맞으면 삭제 실행
    const deleteQuery = 'DELETE FROM post WHERE post_id = ?';
    db.query(deleteQuery, [postId], (err2, result) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: '게시글 삭제 실패' });
      }
      res.json({ message: '게시글이 삭제되었습니다.' });
    });
  });
};

exports.updatePost = (req, res) => {
  const postId = req.params.postId;
  const member_id = req.body.member_id;

  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  // 게시글 작성자 확인 + 기존 게시글 데이터 조회
  const checkQuery = 'SELECT * FROM post WHERE post_id = ?';
  db.query(checkQuery, [postId], (err, results) => {
    if (err) {
      console.error('게시글 확인 오류:', err);
      return res.status(500).json({ message: '서버 오류' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (results[0].member_id !== member_id) {
      return res.status(403).json({ message: '본인 게시글만 수정할 수 있습니다.' });
    }

    const originalPost = results[0];

    // 요청 body에서 값 추출, 없으면 기존 값 유지
    const title = req.body.title ?? originalPost.title;
    const content = req.body.content ?? originalPost.content;
    const is_public = typeof req.body.is_public === 'boolean' ? req.body.is_public : originalPost.is_public;

    const updateQuery = `
      UPDATE post 
      SET title = ?, content = ?, is_public = ?
      WHERE post_id = ?
    `;
    db.query(updateQuery, [title, content, is_public, postId], (err2, result) => {
      if (err2) {
        console.error('게시글 수정 오류:', err2);
        return res.status(500).json({ message: '게시글 수정 실패' });
      }
      res.json({ message: '게시글이 수정되었습니다.' });
    });
  });
};
