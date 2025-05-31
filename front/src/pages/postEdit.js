import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import soonmuImg from '../soonmu02.png';
import './base.css';
import axios from 'axios';

function PostEdit() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const member_id = localStorage.getItem('member_id');

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');

  useEffect(() => {
  axios.get(`http://localhost:3001/api/posts/${postId}`, {
    params: { member_id }
  })
  .then((res) => {
    const { post, comments } = res.data;
    if (post.member_id !== member_id) {
      alert('수정 권한이 없습니다.');
      navigate('/community');
      return;
    }
    setTitle(post.title);
    setContent(post.content);
    setIsPublic(post.is_public);
    setTags(post.keyword_tags || '');
  })
  .catch((err) => {
    console.error(err);
    alert('게시글 정보를 불러오는 데 실패했습니다.');
    navigate('/community');
  });
}, [postId, member_id, navigate]);


  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3001/api/posts/${postId}`, {
        title,
        content,
        is_public: isPublic,
        tags,
        member_id,
      });

      alert('게시글이 수정되었습니다.');
      navigate(`/community`);
    } catch (error) {
      console.error(error);
      alert('게시글 수정에 실패했습니다.');
    }
  };

  return (
    <div className="main-container">
      <button
        className="logout-btn"
        onClick={() => {
          localStorage.clear();
          navigate('/');
        }}
      >
        로그아웃
      </button>

      <div
        className="title-with-image"
        onClick={() => navigate('/mainPage')}
        style={{ cursor: 'pointer' }}
      >
        <img src={soonmuImg} alt="순무 로고" className="soonmu-logo" />
        <h1 className="main-title">순무</h1>
      </div>
      
      {/* 메뉴 영역 */}
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

      <div className="bottom-info"></div>
      <div className="post-box post-form">
        <h2>게시글 수정</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>제목</label><br />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={50}
              placeholder="제목을 입력하세요"
              className="input-field"
            />
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>내용</label><br />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="내용을 입력하세요"
              className="textarea-field"
            />
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>공개 여부</label><br />
            <select
              value={isPublic ? 'true' : 'false'}
              onChange={(e) => setIsPublic(e.target.value === 'true')}
              className="select-field"
            >
              <option value="true">공개</option>
              <option value="false">비공개</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label>태그 (쉼표로 구분)</label><br />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 운동, 건강, 다이어트"
              className="input-field"
            />
          </div>

          <button type="submit" className="submit-btn">
            수정하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostEdit;
