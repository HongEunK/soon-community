const bcrypt = require('bcrypt');
const userDB = require('../models/userDB');
const healthDB = require('../models/healthDB');
const exerciseDB = require('../models/exerciseDB');
const likeDB = require('../models/likeDB');
const postDB = require('../models/postDB');
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

exports.createExerciseGoal = async (req, res) => {
  try {
    const { member_id, target_calories_burned, target_exercise_duration } = req.body;

    if (!member_id || !target_calories_burned || !target_exercise_duration) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    await exerciseDB.createExerciseGoal({ member_id, target_calories_burned, target_exercise_duration });

    res.status(200).json({ message: '운동 목표가 성공적으로 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getExerciseGoalsByMember = async (req, res) => {
  try {
    const member_id = req.params.member_id;
    const goals = await exerciseDB.getExerciseGoalsByMember(member_id);

    res.status(200).json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.createExerciseRecord = async (req, res) => {
  try {
    const newRecord = req.body;
    await healthDB.insertExerciseRecord(newRecord);
    res.status(201).json({ message: '운동 기록이 저장되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 저장 중 오류 발생' });
  }
};

exports.getExerciseRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    const records = await healthDB.getExerciseRecords(member_id);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '운동 기록 조회 중 오류 발생' });
  }
};

exports.createDietRecord = async (req, res) => {
  try {
    const {
      member_id, food_name, amount, protein, fat,
      carbohydrate, calories, intake_date
    } = req.body;

    if (!member_id || !food_name || !amount || !protein || !fat || !carbohydrate || !calories || !intake_date) {
      return res.status(400).json({ error: '필수 값이 누락되었습니다.' });
    }

    await healthDB.insertDietRecord({ member_id, food_name, amount, protein, fat, carbohydrate, calories, intake_date });

    res.status(200).json({ message: "Diet record saved" });
  } catch (err) {
    console.error("Error inserting diet record:", err);
    res.status(500).send("DB error");
  }
};

exports.getDietRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ error: 'member_id가 필요합니다.' });

    const results = await healthDB.getDietRecordsByMember(member_id);
    res.json(results);
  } catch (err) {
    console.error("Error fetching diet records:", err);
    res.status(500).send("DB error");
  }
};

exports.createHealthStatus = async (req, res) => {
  try {
    const { member_id, measurement_date, blood_pressure, blood_sugar, body_fat_percentage } = req.body;

    if (!member_id || !measurement_date) {
      return res.status(400).json({ error: '필수 값이 누락되었습니다.' });
    }

    // 유효하지 않은 body_fat_percentage 처리
    const allowedValues = ['underfat', 'normal', 'overweight', 'obese'];
    const bodyFat = allowedValues.includes(body_fat_percentage) ? body_fat_percentage : 'normal';

    await healthDB.insertHealthStatus({
      member_id,
      measurement_date,
      blood_pressure,
      blood_sugar,
      body_fat_percentage: bodyFat,
    });

    res.status(200).json({ message: "Health status saved" });
  } catch (err) {
    console.error("Error inserting health status:", err);
    res.status(500).send("DB error");
  }
};


exports.getHealthStatusRecords = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.status(400).json({ error: 'member_id가 필요합니다.' });

    const results = await healthDB.getHealthStatusRecordsByMember(member_id);
    res.json(results);
  } catch (err) {
    console.error("Error fetching health status records:", err);
    res.status(500).send("DB error");
  }
};

exports.getCommunityPosts = async (req, res) => {
  const memberId = req.query.memberId;
  if (!memberId) {
    return res.status(400).json({ message: "memberId가 필요합니다." });
  }

  try {
    const posts = await postDB.getAllPostsWithTagsByMember(memberId);
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

    const result = await postDB.createPostWithTags({ title, content, is_public, member_id, tags: tagArray });

    res.status(201).json({ message: '게시글이 성공적으로 작성되었습니다.', post_id: result.post_id });
  } catch (err) {
    console.error('게시글 작성 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.getPostById = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);  // 문자열을 정수로 변환
  const requesterId = req.query.member_id;  // 로그인한 사용자 ID (프론트에서 함께 보내줘야 함)

  if (!requesterId) {
    return res.status(400).json({ message: 'memberId가 필요합니다.' });
  }

  try {
    // 1. 조회수 증가
    await postDB.incrementPostViewCount(postId);

    // 2. 게시글 정보 조회
    const post = await postDB.getPostDetailById(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 3. 비공개 게시글 접근 제한
    if (!post.is_public && post.member_id !== requesterId) {
      return res.status(403).json({ message: '비공개 게시글입니다.' });
    }

    // 4. 댓글 조회
    const comments = await postDB.getCommentsByPostId(postId);

    res.status(200).json({ post, comments });
  } catch (err) {
    console.error('게시글 상세 조회 중 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};



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

exports.getComments = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await postDB.getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 목록 조회 실패' });
  }
};

exports.addComment = async (req, res) => {
  const postId = req.params.postId;
  const { content, member_id } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: '댓글 내용을 입력하세요.' });
  }
  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const commentId = await postDB.addComment(postId, member_id, content);
    res.json({ comment_id: commentId, message: '댓글이 등록되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '댓글 등록 실패' });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.postId;
  const member_id = req.query.memberId;

  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const authorId = await postDB.getPostAuthorId(postId);
    if (authorId === null) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    if (authorId !== member_id) {
      return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' });
    }

    await postDB.deletePostById(postId);
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '게시글 삭제 실패' });
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.postId;
  const member_id = req.body.member_id;

  if (!member_id) {
    return res.status(400).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const originalPost = await postDB.getPostById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    if (originalPost.member_id !== member_id) {
      return res.status(403).json({ message: '본인 게시글만 수정할 수 있습니다.' });
    }

    const title = req.body.title ?? originalPost.title;
    const content = req.body.content ?? originalPost.content;
    const is_public = typeof req.body.is_public === 'boolean' ? req.body.is_public : originalPost.is_public;

    await postDB.updatePostById(postId, title, content, is_public);
    res.json({ message: '게시글이 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '게시글 수정 실패' });
  }
};