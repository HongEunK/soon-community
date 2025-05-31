import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function CreateProfile() {
  const navigate = useNavigate();
  const memberId = localStorage.getItem('member_id');

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  // 추가: 키워드 관련 상태
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState('');

  const activityMap = {
    '낮음': 'low',
    '보통': 'moderate',
    '높음': 'high'
  };

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  // 키워드 목록 불러오기
  useEffect(() => {
    axios.get('http://localhost:3001/api/health-keywords')
      .then(res => setKeywords(res.data))
      .catch(err => console.error('키워드 불러오기 실패:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!height || !weight || !activityLevel || !selectedKeywordId) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const mappedActivityLevel = activityMap[activityLevel];

    try {
      await axios.post('http://localhost:3001/api/member-profile', {
        member_id: memberId,
        height,
        weight,
        activity_level: mappedActivityLevel,
        keyword_id: selectedKeywordId,
      });

      alert('프로필이 성공적으로 생성되었습니다.');
      navigate('/profile');
    } catch (error) {
      console.error('프로필 생성 오류:', error);
      alert('프로필 생성에 실패했습니다.');
    }
  };

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

      {/* 프로필 생성 폼 */}
      <div className="form-container" style={{ marginTop: '40px' }}>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label>신장 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input"
            />
          </div>
          <div className="input-group">
            <label>체중 (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
            />
          </div>
          <div className="input-group">
            <label>활동 수준</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="input"
            >
              <option value="">선택하세요</option>
              <option value="낮음">낮음</option>
              <option value="보통">보통</option>
              <option value="높음">높음</option>
            </select>
          </div>

          <div className="input-group">
            <label>건강 고민 키워드</label>
            <select
              value={selectedKeywordId}
              onChange={(e) => setSelectedKeywordId(e.target.value)}
              className="input"
            >
              <option value="">선택하세요</option>
              {keywords.map(k => (
                <option key={k.keyword_id} value={k.keyword_id}>
                  {k.keyword_name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="button">프로필 생성</button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
