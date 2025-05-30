// src/pages/PostDetail.js
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

  useEffect(() => {
    axios.get(`http://localhost:3001/api/posts/${postId}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error(err));
  }, [postId]);

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
      <h2 className=".post-title-Detail">{post.title}</h2>
      <div className="post-meta">
        <span>작성일: {new Date(post.created_date).toLocaleString()}</span>
        <span>조회수: {post.view_count}</span>
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
