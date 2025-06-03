import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import soonmuImg from '../soonmu02.png';
import './base.css';
import axios from 'axios';
import './community.css';

function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');  // 검색어 상태

  useEffect(() => {
    const memberId = localStorage.getItem('member_id');  // 로그인 시 저장해둔 ID

    axios.get('http://localhost:3001/api/community-posts', {
      params: { memberId }
    })
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

  // 검색어 기반 필터링: 검색어가 비어있으면 전체 posts, 아니면 키워드 태그에 검색어 포함 글만 반환
  const filteredPosts = posts.filter(post => {
    if (!searchKeyword.trim()) return true;
    // keyword_tags가 null 혹은 undefined일 수 있으니 확인
    if (!post.keyword_tags) return false;
    // 소문자로 변환해 대소문자 구분 없이 비교
    return post.keyword_tags.toLowerCase().includes(searchKeyword.toLowerCase());
  });

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

        {/* 검색 입력창 */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="키워드 태그로 검색하세요..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
          />
        </div>

        <div className="post-list">
          {filteredPosts.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.post_id}
                className="post-card"
                onClick={() => navigate(`/post/${post.post_id}`)}
              >
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                  {!post.is_public && (
                    <span className="private-label">[비공개]</span>
                  )}
                  <span>작성자: {post.author_id}</span>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;