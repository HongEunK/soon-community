const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const userProfileController = require('../controllers/userProfile');
const postController = require('../controllers/post');
const likeController = require('../controllers/like');
const healthController = require('../controllers/health');
const exerciseController = require('../controllers/exercise');
const adminController = require('../controllers/admin');

router.post('/signup', userController.signup);
router.post('/loginCheck', userController.loginCheck);
router.post('/withdraw', userController.withdraw);

router.get('/member-profile/:member_id', userProfileController.getMemberProfile);
router.post('/member-profile', userProfileController.createMemberProfile);
router.get('/health-keywords', userProfileController.getHealthKeywords);

router.get('/health_issue_keywords', userProfileController.getHealthKeywords);
router.get('/exercise-recommendations', exerciseController.getExerciseRecommendationsByTarget);

router.get('/exercise-recommendation-rank', exerciseController.getExerciseRecommendationRank);

router.post('/exercise-goal', exerciseController.createExerciseGoal);
router.get('/exercise-goal/:member_id', exerciseController.getExerciseGoalsByMember);

router.get('/community-posts', postController.getCommunityPosts);
router.post('/community-post', postController.createPost);
router.get('/posts/:postId', postController.getPostById);
router.get('/posts/:postId/comments', postController.getComments);
router.post('/posts/:postId/comments', postController.addComment);
router.delete('/posts/:postId', postController.deletePost);
router.put('/posts/:postId', postController.updatePost);

router.get('/posts/:postId/likes/count', likeController.getLikesCount);
router.get('/posts/:postId/likes/check', likeController.checkLiked);
router.post('/posts/:postId/likes', likeController.addLike);
router.delete('/posts/:postId/likes', likeController.removeLike);

router.post('/exercise-record', healthController.createExerciseRecord);
router.get('/exercise-record', healthController.getExerciseRecords);
router.post('/diet-record', healthController.createDietRecord);
router.get('/diet-record', healthController.getDietRecords);
router.post('/health-status-record', healthController.createHealthStatus);
router.get('/health-status-record', healthController.getHealthStatusRecords);
router.get('/health-status-evaluation', healthController.getLatestHealthStatusEvaluation);
router.get('/daily-health-summary', healthController.getDailyHealthSummary);

router.put('/member-profile/:member_id', userProfileController.updateMemberProfile);
router.get('/health-issue-keywords', userProfileController.getHealthKeywords);

router.get('/admin/members', adminController.getAllMembers);
router.delete('/admin/members/:member_id', adminController.deleteMember);
router.get('/admin/posts', adminController.getAllPosts);
router.delete('/admin/posts/:post_id', adminController.deletePost);

module.exports = router;