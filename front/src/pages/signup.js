import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    department: '',
    studentId: '',
    name: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = '회원 아이디를 입력하세요.';
    if (!formData.password || formData.password.length < 8)
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.studentId) newErrors.studentId = '학번을 입력하세요.';
    if (!formData.name) newErrors.name = '이름을 입력하세요.';
    if (!formData.gender) newErrors.gender = '성별을 선택하세요.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('회원가입 정보 제출:', formData);
      navigate('/');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">회원가입</h2>
      <p className="page-subtitle">순천향대학교 건강관리 커뮤니티 가입을 환영합니다</p>
      <form onSubmit={handleSubmit} className="form">
        <InputField name="userId" placeholder="회원 아이디" value={formData.userId} onChange={handleChange} error={errors.userId} />
        <InputField name="password" type="password" placeholder="비밀번호 (8자 이상)" value={formData.password} onChange={handleChange} error={errors.password} />
        <InputField name="department" placeholder="학과 (선택 사항)" value={formData.department} onChange={handleChange} />
        <InputField name="studentId" placeholder="학번" value={formData.studentId} onChange={handleChange} error={errors.studentId} />
        <InputField name="name" placeholder="이름" value={formData.name} onChange={handleChange} error={errors.name} />

        <div className="gender-group">
          <label>
            <input type="radio" name="gender" value="남자" checked={formData.gender === '남자'} onChange={handleChange} /> 남자
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input type="radio" name="gender" value="여자" checked={formData.gender === '여자'} onChange={handleChange} /> 여자
          </label>
        </div>
        {errors.gender && <p className="error">{errors.gender}</p>}

        <button type="submit" className="button">회원가입</button>
      </form>
    </div>
  );
}

function InputField({ name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="input-group">
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} className="input" />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Signup;
