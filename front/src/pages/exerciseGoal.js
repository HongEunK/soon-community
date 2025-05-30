import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function ExerciseGoalPage() {
  const navigate = useNavigate();
  const memberId = localStorage.getItem('member_id');

  const [targetCalories, setTargetCalories] = useState('');
  const [targetDuration, setTargetDuration] = useState('');
  const [exerciseGoals, setExerciseGoals] = useState([]);

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  // 기존 목표 불러오기
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/exercise-goal/${memberId}`);
        setExerciseGoals(res.data);
      } catch (err) {
        console.error('운동 목표 조회 오류:', err);
      }
    };

    fetchGoals();
  }, [memberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetCalories || !targetDuration) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/exercise-goal', {
        member_id: memberId,
        target_calories_burned: Number(targetCalories),
        target_exercise_duration: Number(targetDuration),
      });

      alert('운동 목표가 성공적으로 생성되었습니다.');
      setTargetCalories('');
      setTargetDuration('');

      // 목표 새로 불러오기
      const res = await axios.get(`http://localhost:3001/api/exercise-goal/${memberId}`);
      setExerciseGoals(res.data);
    } catch (error) {
      console.error('운동 목표 생성 오류:', error);
      alert('운동 목표 생성에 실패했습니다.');
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

      {/* 운동 목표 입력 폼 */}
      <div className="form-container" style={{ marginTop: '40px' }}>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label>목표 소모 칼로리 (kcal)</label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="input"
              min="1"
            />
          </div>
          <div className="input-group">
            <label>목표 운동 시간 (분)</label>
            <input
              type="number"
              value={targetDuration}
              onChange={(e) => setTargetDuration(e.target.value)}
              className="input"
              min="1"
            />
          </div>
          <button type="submit" className="button">
            운동 목표 생성
          </button>
        </form>
      </div>

      {/* 기존 운동 목표 리스트 출력 */}
      <div className="bottom-info" style={{ marginTop: '60px' }}>
        <h2>저장된 운동 목표 목록</h2>
        {exerciseGoals.length === 0 ? (
          <p>등록된 운동 목표가 없습니다.</p>
        ) : (
          <table className="profile-table" style={{ margin: 'auto', backgroundColor: '#e0f2db' }}>
            <thead>
              <tr>
                <th>목표 ID</th>
                <th>시작 날짜</th>
                <th>목표 소모 칼로리 (kcal)</th>
                <th>목표 운동 시간 (분)</th>
              </tr>
            </thead>
            <tbody>
              {exerciseGoals.map((goal) => (
                <tr key={goal.goal_id}>
                  <td>{goal.goal_id}</td>
                  <td>{new Date(goal.start_date).toLocaleDateString()}</td>
                  <td>{goal.target_calories_burned}</td>
                  <td>{goal.target_exercise_duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ExerciseGoalPage;