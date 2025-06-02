import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileEdit() {
  const navigate = useNavigate();
  const memberId = localStorage.getItem('member_id');

  const [profile, setProfile] = useState(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [keywordId, setKeywordId] = useState(null); // 단일 선택
  const [allKeywords, setAllKeywords] = useState([]);

  useEffect(() => {
    // 기존 프로필 데이터 불러오기
    axios.get(`http://localhost:3001/api/member-profile/${memberId}`)
      .then(res => {
        const data = res.data;
        setProfile(data);
        setHeight(data.height || '');
        setWeight(data.weight || '');
        setActivityLevel(data.activity_level || '');
        setKeywordId(data.keywords?.[0]?.keyword_id || null); // 단일 키워드
      })
      .catch(err => console.error('프로필 로드 실패:', err));

    // 전체 키워드 목록 불러오기
    axios.get('http://localhost:3001/api/health-issue-keywords')
      .then(res => setAllKeywords(res.data))
      .catch(err => console.error('키워드 목록 로드 실패:', err));
  }, [memberId]);

  // 저장 처리
  const handleSave = () => {
    const payload = {
      height,
      weight,
      activity_level: activityLevel,
      keywords: keywordId ? [keywordId] : [], // 배열 형태로 보냄
    };

    axios.put(`http://localhost:3001/api/member-profile/${memberId}`, payload)
      .then(() => {
        alert('프로필이 수정되었습니다.');
        navigate('/profile');
      })
      .catch(err => {
        console.error('프로필 수정 실패:', err);
        alert('프로필 수정에 실패했습니다.');
      });
  };

  if (!profile) return <div>프로필 정보를 불러오는 중입니다...</div>;

  return (
    <div className="main-container">
      <h2>프로필 수정</h2>
      <table className="profile-table">
        <tbody>
          <tr>
            <td>신장 (cm)</td>
            <td>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="50"
                max="300"
              />
            </td>
          </tr>
          <tr>
            <td>체중 (kg)</td>
            <td>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="20"
                max="300"
              />
            </td>
          </tr>
          <tr>
            <td>활동 수준</td>
            <td>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>건강 고민 키워드</td>
            <td>
              {allKeywords.length === 0 ? (
                <p>키워드 목록을 불러오는 중입니다...</p>
              ) : (
                <select
                  value={keywordId || ''}
                  onChange={(e) => setKeywordId(Number(e.target.value))}
                >
                  <option value="">선택하세요</option>
                  {allKeywords.map((kw) => (
                    <option key={kw.keyword_id} value={kw.keyword_id}>
                      {kw.keyword_name}
                    </option>
                  ))}
                </select>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <button className="button" onClick={handleSave}>저장하기</button>
      <button className="button" onClick={() => navigate('/profile')} style={{ marginLeft: '10px' }}>취소</button>
    </div>
  );
}

export default ProfileEdit;
