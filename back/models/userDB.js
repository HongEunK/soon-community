const db = require('../database/db'); // 데이터베이스 연결 설정

exports.signUp = (data) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO member (member_id, password, department, student_number, name, gender, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data[0], data[1], data[2], data[3], data[4], data[5], data[6]],
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
};

exports.getUser = (member_id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM member where member_id = ?`, member_id, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

exports.getMemberProfile = (memberId) => {
  const query = `
    SELECT m.member_id, mp.height, mp.weight, mp.activity_level
    FROM member m
    JOIN member_profile mp ON m.member_id = mp.member_id
    WHERE m.member_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);  // results가 undefined일 수 있으니 기본값 빈 배열
    });
  });
};

exports.createExerciseGoal = ({ member_id, target_calories_burned, target_exercise_duration }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO exercise_goal (member_id, target_calories_burned, target_exercise_duration)
      VALUES (?, ?, ?)
    `;
    db.query(query, [member_id, target_calories_burned, target_exercise_duration], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

exports.getExerciseGoalsByMember = (member_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT goal_id, start_date, target_calories_burned, target_exercise_duration
      FROM exercise_goal
      WHERE member_id = ?
      ORDER BY start_date DESC
    `;
    db.query(query, [member_id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// 운동 기록 삽입
exports.insertExerciseRecord = (record) => {
  const {
    exercise_date,
    exercise_type,
    exercise_duration,
    exercise_intensity,
    calories_burned,
    member_id
  } = record;

  const query = `
    INSERT INTO exercise_record (exercise_date, exercise_type, exercise_duration, exercise_intensity, calories_burned, member_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [exercise_date, exercise_type, exercise_duration, exercise_intensity, calories_burned, member_id];

  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// 운동 기록 조회
exports.getExerciseRecords = (memberId) => {
  const query = `
    SELECT * FROM exercise_record
    WHERE member_id = ?
    ORDER BY exercise_date DESC
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [memberId], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
};

// 게시글 목록 조회 (태그 포함)
exports.getAllPostsWithTags = () => {
  const query = `
    SELECT 
      p.post_id,
      p.title,
      p.view_count,
      p.created_date,
      GROUP_CONCAT(pk.keyword_tag) AS keyword_tags
    FROM post p
    LEFT JOIN post_keyword_tag pk ON p.post_id = pk.post_id
    WHERE p.is_public = TRUE
    GROUP BY p.post_id
    ORDER BY p.created_date DESC
  `;

  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
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

