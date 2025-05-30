const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');	// 유저 컨트롤러 가져오기

router.post('/signup', userController.signup);			// 회원가입 부분
router.post('/loginCheck', userController.loginCheck);	// 로그인 부분
router.get('/member-profile/:member_id', userController.getMemberProfile);
router.post('/member-profile', userController.createMemberProfile);
router.post('/exercise-goal', userController.createExerciseGoal);
router.get('/exercise-goal/:member_id', userController.getExerciseGoalsByMember);
router.post('/exercise-record', userController.createExerciseRecord);
router.get('/exercise-record', userController.getExerciseRecords);
router.post('/diet-record', userController.createDietRecord);
router.get('/diet-record', userController.getDietRecords);
router.post('/health-status-record', userController.createHealthStatus);
router.get('/health-status-record', userController.getHealthStatusRecords);
router.get('/community-posts', userController.getCommunityPosts);
router.post('/community-post', userController.createPost);

router.get('/posts/:postId', userController.getPostById);

router.get('/posts/:postId/likes/count', userController.getLikesCount);
router.get('/posts/:postId/likes/check', userController.checkLiked);
router.post('/posts/:postId/likes', userController.addLike);
router.delete('/posts/:postId/likes', userController.removeLike);

router.get('/posts/:postId/comments', userController.getComments);
router.post('/posts/:postId/comments', userController.addComment);
router.delete('/posts/:postId', userController.deletePost);
router.put('/posts/:postId', userController.updatePost);

// 게시글 상세 조회
router.get('/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    // 게시글 상세 정보 + 키워드 태그
    const [post] = await db.query(`
      SELECT 
        p.id, p.title, p.content, p.created_date, p.view_count,
        GROUP_CONCAT(pkt.keyword_tag SEPARATOR ', ') AS keyword_tags
      FROM post p
      LEFT JOIN post_keyword_tag pkt ON p.id = pkt.post_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [postId]);

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;