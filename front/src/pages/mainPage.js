import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function MainPage() {
  const navigate = useNavigate();

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleWithdraw = async () => {
    const confirmed = window.confirm('정말 회원 탈퇴하시겠습니까? 탈퇴 후에는 복구할 수 없습니다.');

    if (!confirmed) return;

    const member_id = localStorage.getItem('member_id');
    const password = prompt('비밀번호를 입력해주세요'); // 사용자 확인용

    if (!password) return;

    try {
      await axios.post('http://localhost:3001/api/withdraw', {
        member_id,
        password,
      });

      alert('회원 탈퇴가 완료되었습니다.');
      handleLogout();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="main-container">
      <div className="top-buttons">
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>

        <button className="withdraw-btn" onClick={handleWithdraw}>
          회원탈퇴
        </button>
      </div>

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
    </div>
  );
}

export default MainPage;
