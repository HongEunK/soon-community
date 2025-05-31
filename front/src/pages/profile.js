import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  const memberId = localStorage.getItem('member_id');

  useEffect(() => {
    axios.get(`http://localhost:3001/api/member-profile/${memberId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.error('Error fetching profile:', err));
  }, [memberId]);

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
           <h2>회원 프로필</h2>
        {profile ? (
  <>
    <table className="profile-table">
      <tbody>
  <tr><td>회원 ID</td><td>{profile.member_id}</td></tr>
  <tr><td>이름</td><td>{profile.name}</td></tr>
  <tr><td>신장</td><td>{profile.height} cm</td></tr>
  <tr><td>체중</td><td>{profile.weight} kg</td></tr>
  <tr><td>활동 수준</td><td>{profile.activity_level}</td></tr>
  <tr>
    <td>선택한 건강고민 키워드</td>
    <td>
      {profile.keywords && profile.keywords.length > 0 ? (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
  {profile.keywords.map((kw) => (
    <li key={kw.keyword_id}>{kw.keyword_name}</li>
  ))}
</ul>
      ) : (
        '선택한 건강고민 키워드가 없습니다.'
      )}
    </td>
  </tr>
</tbody>

    </table>
  </>
) : (
  <div>
            <p>아직 프로필이 없습니다.</p>
            <button className="button" onClick={() => navigate('/createProfile')}>
              프로필 생성하기
            </button>
          </div>
)}
      </div>
    </div>
  );
}

export default Profile;