import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';
import './community';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const member_id = localStorage.getItem('member_id');

  useEffect(() => {
  if (!member_id) return;

  // 게시글 + 댓글 같이 조회
  axios.get(`http://localhost:3001/api/posts/${postId}`, {
    params: { member_id }  // 여기에 꼭 포함
  })
    .then((res) => {
      setPost(res.data.post);
      setComments(res.data.comments);
    })
    .catch((err) => console.error(err));

  // 좋아요 수
  axios.get(`http://localhost:3001/api/posts/${postId}/likes/count`)
    .then((res) => setLikesCount(res.data.count))
    .catch((err) => console.error(err));

  // 내가 좋아요 눌렀는지
  axios.get(`http://localhost:3001/api/posts/${postId}/likes/check`, {
    params: { memberId: member_id }
  })
    .then((res) => setLiked(res.data.liked))
    .catch((err) => console.error(err));
}, [postId, member_id]);


  const handleCommentSubmit = async () => {
  try {
    const member_id = localStorage.getItem('member_id'); // 수정된 부분

    if (!newComment.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }

    const payload = {
      content: newComment,
      member_id: member_id,
    };

    const response = await axios.post(`http://localhost:3001/api/posts/${postId}/comments`, payload);

    const res = await axios.get(`http://localhost:3001/api/posts/${postId}/comments`);
    setComments(res.data);
    setNewComment('');
  } catch (error) {
    console.error(error);
    alert('댓글 등록에 실패했습니다.');
  }
};
const handleLikeToggle = () => {
  const member_id = localStorage.getItem('member_id'); // 수정된 부분
  if (!member_id) return alert('로그인이 필요합니다.');

  if (liked) {
    axios.delete(`http://localhost:3001/api/posts/${postId}/likes`, {
      params: { memberId: member_id }
    })
      .then(() => {
        setLiked(false);
        setLikesCount((count) => count - 1);
      })
      .catch((err) => console.error(err));
  } else {
    axios.post(`http://localhost:3001/api/posts/${postId}/likes`, {
      memberId: member_id
    })
      .then(() => {
        setLiked(true);
        setLikesCount((count) => count + 1);
      })
      .catch((err) => console.error(err));
  }
};

const handleDeletePost = () => {
  if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

  axios.delete(`http://localhost:3001/api/posts/${postId}`, {
    params: { memberId: member_id }  // 필요하다면 권한 확인용으로 전달
  })
    .then(() => {
      alert('게시글이 삭제되었습니다.');
      navigate('/community');  // 삭제 후 커뮤니티 목록 페이지로 이동
    })
    .catch((err) => {
      console.error('게시글 삭제 오류:', err);
      alert('게시글 삭제에 실패했습니다.');
    });
};

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  return (
    <div className="main-container">
      <button className="logout-btn" onClick={() => {
        localStorage.clear();
        navigate('/');
      }}>로그아웃</button>

      <div className="title-with-image" onClick={() => navigate('/mainPage')} style={{ cursor: 'pointer' }}>
        <img src={soonmuImg} alt="순무 로고" className="soonmu-logo" />
        <h1 className="main-title">순무</h1>
      </div>

      <div className="bottom-info">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className="menu-item"
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer' }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="bottom-info">
        {!post ? (
          <div>로딩 중...</div>
        ) : (
          <div className="post-card">
            <h2 className="post-title-Detail">{post.title}</h2>
  <div className="post-meta">
    <span>작성자: {post.member_id}</span>
    <span>작성일: {new Date(post.created_date).toLocaleString()}</span>
    <span>조회수: {post.view_count}</span>
    <span style={{ marginLeft: '10px' }}>좋아요: {likesCount}</span>
  </div>

{/* 내 글일 때만 삭제 버튼 표시 */}
<div className="post-action-buttons">
  {post.member_id.trim() === member_id?.trim() && (
    <button className="delete-btn" onClick={handleDeletePost}>
      게시글 삭제
    </button>
  )}
<button
      className="edit-btn"
      onClick={() => navigate(`/community/edit/${postId}`)}
    >
      게시글 수정
    </button>
  <button
    className={`like-btn ${liked ? 'liked' : ''}`}
    onClick={handleLikeToggle}
  >
    {liked ? '좋아요 취소' : '좋아요'} ({likesCount})
  </button>
</div>

            <div className="post-content-box">
              {post.content}
            </div>

            <div className="post-tags">
              {post.keyword_tags
                ? post.keyword_tags.split(',').map((tag, idx) => (
                  <span key={idx} className="tag-badge">
                    #{tag.trim()}
                  </span>
                ))
                : <span className="no-tag">태그 없음</span>}
            </div>

            {/* 댓글 영역 */}
<div className="comments-section">
  <h3>댓글</h3>

  {/* 댓글 입력창 */}
  <div className="comment-input">
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="댓글을 입력하세요."
      rows={3}
    />
    <button className="button" onClick={handleCommentSubmit}>
      댓글 등록
    </button>
  </div>

  {/* 댓글 리스트 */}
  <div className="comment-list">
    {comments.length > 0 ? (
      comments.map((comment) => (
        <div key={comment.comment_id} className="comment-item">
          <div className="comment-meta">
            <span>{comment.member_id}</span>
            <span>{new Date(comment.created_date).toLocaleString()}</span>
          </div>
          <div className="comment-content">{comment.content}</div>
        </div>
      ))
    ) : (
      <p style={{ color: '#888' }}>아직 댓글이 없습니다.</p>
    )}
  </div>
</div>


            {/* 커뮤니티로 돌아가기 버튼 */}
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button className="button" onClick={() => navigate('/community')}>
                ← 커뮤니티로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
