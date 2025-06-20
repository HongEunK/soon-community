import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soonmuImg from '../soonmu02.png';
import './base.css';

function HealthRecords() {
  const navigate = useNavigate();
  const [exerciseRecords, setExerciseRecords] = useState([]);
  const [dietRecords, setDietRecords] = useState([]);
  const [healthStatusRecords, setHealthStatusRecords] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [exercise, setExercise] = useState({
    exercise_date: '',
    exercise_type: '',
    exercise_duration: '',
    exercise_intensity: 'moderate',
    calories_burned: '',
  });

  const [healthStatus, setHealthStatus] = useState({
    measurement_date: '',
    blood_pressure: 'normal',
    blood_sugar: 'normal',
    body_fat_percentage: 'normal',
  });

  const [diet, setDiet] = useState({
    food_name: '',
    amount: '',
    protein: '',
    fat: '',
    carbohydrate: '',
    calories: '',
    intake_date: '',
  });

  const menuItems = [
    { label: '프로필', path: '/profile' },
    { label: '건강 기록 조회', path: '/healthRecords' },
    { label: '커뮤니티', path: '/community' },
    { label: '맞춤형 운동 추천', path: '/exerciseRecommend' },
    { label: '운동 목표 설정', path: '/exerciseGoal' },
  ];

  const handleChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  const handleHealthChange = (e) => {
    setHealthStatus({ ...healthStatus, [e.target.name]: e.target.value });
  };

  const handleDietChange = (e) => {
    setDiet({ ...diet, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
  setSelectedDate(e.target.value);
};

  const submitExercise = async () => {
    const member_id = localStorage.getItem('member_id');
    try {
      await axios.post('http://localhost:3001/api/exercise-record', { ...exercise, member_id });
      alert('저장되었습니다!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  const submitHealthStatus = async () => {
    const member_id = localStorage.getItem('member_id');
    try {
      await axios.post('http://localhost:3001/api/health-status-record', { ...healthStatus, member_id });
      alert('건강 상태가 저장되었습니다!');
      setHealthStatus({
        measurement_date: '',
        blood_pressure: 'normal',
        blood_sugar: 'normal',
        body_fat_percentage: 'normal',
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  const submitDiet = async () => {
    const member_id = localStorage.getItem('member_id');
    try {
      await axios.post('http://localhost:3001/api/diet-record', { ...diet, member_id });
      alert('식단이 저장되었습니다!');
      setDiet({
        food_name: '',
        amount: '',
        protein: '',
        fat: '',
        carbohydrate: '',
        calories: '',
        intake_date: '',
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  // useState 추가
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    const memberId = localStorage.getItem('member_id');
    const fetchAll = async () => {
      try {
        const [ex, hs, dt] = await Promise.all([
          axios.get(`http://localhost:3001/api/exercise-record?member_id=${memberId}`),
          axios.get(`http://localhost:3001/api/health-status-record?member_id=${memberId}`),
          axios.get(`http://localhost:3001/api/diet-record?member_id=${memberId}`),
        ]);
        setExerciseRecords(ex.data);
        setHealthStatusRecords(hs.data);
        setDietRecords(dt.data);

        if (hs.data.length > 0) {
          const latest = hs.data[hs.data.length - 1];

          const res = await axios.get('http://localhost:3001/api/health-status-evaluation', {
            params: {
              member_id: memberId,
              measurement_date: latest.measurement_date,
              blood_pressure: latest.blood_pressure,
              blood_sugar: latest.blood_sugar,
              body_fat_percentage: latest.body_fat_percentage,
            },
          });
          setEvaluationResult(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

useEffect(() => {
  const memberId = localStorage.getItem('member_id');
  const fetchDailySummary = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/daily-health-summary?member_id=${memberId}`);
      setDailySummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchDailySummary();
}, []);


useEffect(() => {
  const memberId = localStorage.getItem('member_id');
  if (!selectedDate) return; // 날짜 선택 안 하면 호출 안 함

  const fetchDailySummaryByDate = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/daily-health-summary', {
        params: {
          member_id: memberId,
          date: selectedDate,
        },
      });
      setDailySummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchDailySummaryByDate();
}, [selectedDate]);


useEffect(() => {
  const today = new Date().toISOString().slice(0, 10);
  setSelectedDate(today);
}, []);

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
<h2>일별 통합 건강 정보</h2>
<input
  type="date"
  value={selectedDate}
  onChange={handleDateChange}
  className="input"
/>
<table className="profile-table">
  <thead>
    <tr>
      <th>날짜</th>
      <th>운동 시간(분)</th>
      <th>소모 칼로리(kcal)</th>
      <th>혈압</th>
      <th>혈당</th>
      <th>체지방률</th>
      <th>총 섭취량</th>
      <th>섭취 칼로리(kcal)</th>
    </tr>
  </thead>
  <tbody>
    {dailySummary.length === 0 ? (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>해당 날짜의 데이터가 없습니다.</td>
      </tr>
    ) : (
      dailySummary.map((record, idx) => (
        <tr key={idx}>
          <td>{record.record_date ? new Date(record.record_date).toLocaleDateString() : '-'}</td>
          <td>{record.total_exercise_duration || '-'}</td>
          <td>{record.total_calories_burned || '-'}</td>
          <td>{record.blood_pressure || '-'}</td>
          <td>{record.blood_sugar || '-'}</td>
          <td>{record.body_fat_percentage || '-'}</td>
          <td>{record.total_amount || '-'}</td>
          <td>{record.total_calories || '-'}</td>
        </tr>
      ))
    )}
  </tbody>
</table>

      <div className="bottom-info">
        <div className="form-container">
          {/* 운동 입력 */}
          <h2>운동 기록 입력</h2>
          <form className="form" onSubmit={(e) => { e.preventDefault(); submitExercise(); }}>
            <input type="date" name="exercise_date" value={exercise.exercise_date} onChange={handleChange} className="input" />
            <input type="text" name="exercise_type" placeholder="운동 종류" value={exercise.exercise_type} onChange={handleChange} className="input" />
            <input type="number" name="exercise_duration" placeholder="운동 시간 (분)" value={exercise.exercise_duration} onChange={handleChange} className="input" />
            <select name="exercise_intensity" value={exercise.exercise_intensity} onChange={handleChange} className="input">
              <option value="low">운동 강도 : 낮음</option>
              <option value="moderate">운동 강도 : 보통</option>
              <option value="high">운동 강도 : 높음</option>
            </select>
            <input type="number" name="calories_burned" placeholder="소모 칼로리 (kcal)" value={exercise.calories_burned} onChange={handleChange} className="input" />
            <button type="submit" className="button">저장</button>
          </form>

          {/* 건강 상태 입력 */}
          <h2>건강 상태 입력</h2>
          <form onSubmit={(e) => { e.preventDefault(); submitHealthStatus(); }} className="form">
            <input type="date" name="measurement_date" value={healthStatus.measurement_date} onChange={handleHealthChange} className="input" />
            <select name="blood_pressure" value={healthStatus.blood_pressure} onChange={handleHealthChange} className="input">
              <option value="low">혈압 : 낮음</option>
              <option value="normal">혈압 : 보통</option>
              <option value="high">혈압 : 높음</option>
            </select>
            <select name="blood_sugar" value={healthStatus.blood_sugar} onChange={handleHealthChange} className="input">
              <option value="low">혈당 : 낮음</option>
              <option value="normal">혈당 : 보통</option>
              <option value="high">혈당 : 높음</option>
            </select>
            <select name="body_fat_percentage" value={healthStatus.body_fat_percentage} onChange={handleHealthChange} className="input">
              <option value="underfat">체지방률 : 부족</option>
              <option value="normal">체지방률 : 정상</option>
              <option value="overweight">체지방률 : 과체중</option>
              <option value="obese">체지방률 : 비만</option>
            </select>
            <button type="submit" className="button">저장</button>
          </form>

          {/* 식단 입력 */}
          <h2>식단 입력</h2>
          <form onSubmit={(e) => { e.preventDefault(); submitDiet(); }} className="form">
            <input type="text" name="food_name" placeholder="음식명" value={diet.food_name} onChange={handleDietChange} className="input" />
            <input type="number" name="amount" placeholder="양 (g)" value={diet.amount} onChange={handleDietChange} className="input" />
            <input type="number" name="protein" placeholder="단백질 (g)" value={diet.protein} onChange={handleDietChange} className="input" />
            <input type="number" name="fat" placeholder="지방 (g)" value={diet.fat} onChange={handleDietChange} className="input" />
            <input type="number" name="carbohydrate" placeholder="탄수화물 (g)" value={diet.carbohydrate} onChange={handleDietChange} className="input" />
            <input type="number" name="calories" placeholder="칼로리 (kcal)" value={diet.calories} onChange={handleDietChange} className="input" />
            <input type="date" name="intake_date" value={diet.intake_date} onChange={handleDietChange} className="input" />
            <button type="submit" className="button">저장</button>
          </form>
        </div>

        {/* 운동 기록 테이블 */}
        <h2>운동 기록</h2>
        <table className="profile-table">
          <thead>
            <tr>
              <th>기록 ID</th>
              <th>날짜</th>
              <th>운동 종류</th>
              <th>운동 시간</th>
              <th>강도</th>
              <th>칼로리</th>
            </tr>
          </thead>
          <tbody>
            {exerciseRecords.map((record) => (
              <tr key={record.exercise_record_id}>
                <td>{record.exercise_record_id}</td>
                <td>{new Date(record.exercise_date).toLocaleDateString()}</td>
                <td>{record.exercise_type}</td>
                <td>{record.exercise_duration}</td>
                <td>{record.exercise_intensity}</td>
                <td>{record.calories_burned}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 건강 상태 기록 테이블 */}
        <h2>건강 상태 기록</h2>
        <table className="profile-table">
          <thead>
            <tr>
              <th>측정일</th>
              <th>혈압</th>
              <th>혈당</th>
              <th>체지방률</th>
            </tr>
          </thead>
          <tbody>
            {healthStatusRecords.map((record) => (
              <tr key={record.health_status_record_id}>
                <td>{new Date(record.measurement_date).toLocaleDateString()}</td>
                <td>{record.blood_pressure}</td>
                <td>{record.blood_sugar}</td>
                <td>{record.body_fat_percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 식단 기록 테이블 */}
        <h2>식단 기록</h2>
        <table className="profile-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>음식명</th>
              <th>양</th>
              <th>단백질</th>
              <th>지방</th>
              <th>탄수화물</th>
              <th>칼로리</th>
            </tr>
          </thead>
          <tbody>
            {dietRecords.map((record) => (
              <tr key={record.diet_record_id}>
                <td>{new Date(record.intake_date).toLocaleDateString()}</td>
                <td>{record.food_name}</td>
                <td>{record.amount}</td>
                <td>{record.protein}</td>
                <td>{record.fat}</td>
                <td>{record.carbohydrate}</td>
                <td>{record.calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>건강 상태 평가</h2>
        {evaluationResult && (
          <table className="profile-table" style={{ maxWidth: '400px', marginTop: '20px' }}>
            <thead>
              <tr>
                <th>항목</th>
                <th>평가 결과</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>혈압</td>
                <td>{evaluationResult.blood_pressure}</td>
              </tr>
              <tr>
                <td>혈당</td>
                <td>{evaluationResult.blood_sugar}</td>
              </tr>
              <tr>
                <td>체지방률</td>
                <td>{evaluationResult.body_fat_percentage}</td>
              </tr>
              <tr>
                <td>건강 등급</td>
                <td>{evaluationResult.health_grade}</td>
              </tr>
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default HealthRecords;