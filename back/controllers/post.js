const db = require('../database/db');
const postDB = require('../models/postDB');

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
    if (!post.is_public && String(post.member_id) !== String(requesterId)) {
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