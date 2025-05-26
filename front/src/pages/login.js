import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = '회원 아이디를 입력하세요.';
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = '비밀번호를 다시 입력해주세요.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('로그인 정보 제출:', formData);
      // 로그인 성공 처리 (예: API 호출 등)
      navigate('/mainPage');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">로그인</h2>
      <p className="page-subtitle">순천향대학교 건강관리 커뮤니티에 로그인 해주세요</p>
      <form onSubmit={handleSubmit} className="form">
        <InputField
          name="userId"
          placeholder="회원 아이디"
          value={formData.userId}
          onChange={handleChange}
          error={errors.userId}
        />
        <InputField
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <button type="submit" className="button">로그인</button>
      </form>
    </div>
  );
}

function InputField({ name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="input-group">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input"
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Login;
