import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function ExerciseRecommend() {
  const navigate = useNavigate();
  const memberId = localStorage.getItem('member_id');

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  const [profile, setProfile] = useState(null);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [rankingList, setRankingList] = useState([]);  // 랭킹용 상태 추가
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!memberId) {
      setErrorMsg('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:3001/api/member-profile/${memberId}`)
      .then(res => {
        const prof = res.data;
        setProfile(prof);

        if (!prof) {
          setErrorMsg('프로필이 없습니다. 프로필을 생성해주세요.');
          setLoading(false);
          return;
        }

        if (prof.keywords && prof.keywords.length > 0) {
          setSelectedKeyword(prof.keywords[0].keyword_name);
          setErrorMsg('');
        } else {
          setErrorMsg('프로필에 건강 고민 키워드가 없습니다. 프로필을 수정해주세요.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('프로필 조회 오류:', err);
        setErrorMsg('프로필 조회 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [memberId]);

  useEffect(() => {
    if (!selectedKeyword) {
      setRecommendations([]);
      return;
    }

    axios.get('http://localhost:3001/api/exercise-recommendations', {
      params: { target: selectedKeyword }
    })
      .then(res => {
        setRecommendations(res.data);
      })
      .catch(err => {
        console.error('운동 추천 조회 오류:', err);
        setRecommendations([]);
      });
  }, [selectedKeyword]);

  // 랭킹 운동 추천 데이터 가져오기
  useEffect(() => {
    axios.get('http://localhost:3001/api/exercise-recommendation-rank')
      .then(res => {
        setRankingList(res.data);
      })
      .catch(err => {
        console.error('운동 추천 랭킹 조회 오류:', err);
        setRankingList([]);
      });
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

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
          {menuItems.map(item => (
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
        <h2>맞춤형 운동 추천</h2>

        {errorMsg ? (
          <p>{errorMsg}</p>
        ) : (
          <>
            <table className="profile-table" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '150px' }}>건강 고민 키워드</td>
                  <td><strong>{selectedKeyword}</strong></td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: '20px' }}>추천 운동 목록</h3>

            {recommendations.length === 0 ? (
              <p>선택된 키워드에 해당하는 운동이 없습니다.</p>
            ) : (
              <table className="profile-table" style={{ width: '100%', marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>운동 이름</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map(ex => (
                    <tr key={ex.exercise_id}>
                      <td style={{ padding: '8px' }}>{ex.exercise_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 랭킹 추천 영역 */}
            <h2 style={{ marginTop: '40px' }}>운동 추천 랭킹</h2>
            {rankingList.length === 0 ? (
              <p>랭킹 데이터가 없습니다.</p>
            ) : (
              <table className="profile-table" style={{ width: '100%', marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', padding: '8px' }}>순위</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>운동 이름</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>추천 횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingList.map(item => (
                    <tr key={item.exercise_id}>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{item.rank_position}</td>
                      <td style={{ padding: '8px' }}>{item.exercise_name}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{item.recommend_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExerciseRecommend;
