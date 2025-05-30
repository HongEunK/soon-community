import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import soonmuImg from '../soonmu02.png';
import './base.css';
import axios from 'axios';

function PostWrite() {
  const navigate = useNavigate();

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  // 글쓰기 폼 상태관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const member_id = localStorage.getItem('member_id');
    if (!member_id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

     const tagsArray = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

    try {
      await axios.post('http://localhost:3001/api/community-post', {
        title,
        content,
        is_public: isPublic,
        member_id,
        tags,  // 쉼표로 구분된 태그 문자열
      });

      alert('게시글이 성공적으로 등록되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록 중 오류가 발생했습니다.');
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

      {/* 글 작성 폼 */}
      <div className="bottom-info" style={{ marginTop: '20px' }}>
        <h2>게시글 작성</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>제목</label><br />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={50}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>내용</label><br />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>공개 여부</label><br />
            <select
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value === 'true')}
            >
              <option value="true">공개</option>
              <option value="false">비공개</option>
            </select>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>태그 (쉼표로 구분)</label><br />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: 운동, 건강, 다이어트"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostWrite;
