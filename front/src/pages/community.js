import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import soonmuImg from '../soonmu02.png';
import './base.css';
import axios from 'axios';
import './community.css';

function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/community-posts')
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error('게시글 불러오기 실패:', err);
      });
  }, []);

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
  <div style={{ textAlign: "right", marginBottom: "10px" }}>
    <button
      onClick={() => navigate("/postWrite")}
      className="button write-button"
    >
      글 쓰기
    </button>
  </div>

  <div className="post-list">
    {posts.map((post) => (
      <div
        key={post.post_id}
        className="post-card"
        onClick={() => navigate(`/post/${post.post_id}`)}
      >
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span>조회수: {post.view_count}</span>
          <span>작성일: {new Date(post.created_date).toLocaleDateString()}</span>
        </div>
        <div className="post-tags">
          {post.keyword_tags?.length
            ? post.keyword_tags.split(',').map((tag, i) => (
                <span key={i} className="tag-badge">#{tag.trim()}</span>
              ))
            : <span className="no-tag">태그 없음</span>}
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}

export default Community;
