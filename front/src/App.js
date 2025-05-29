import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import soonmu01 from './soonmu01.png';
import Login from './pages/login';
import Signup from './pages/signup';
import MainPage from './pages/mainPage';
import Profile from './pages/profile';
import Community from './pages/community';
import HealthRecords from './pages/healthRecords';
import ExerciseGoal from './pages/exerciseGoal';
import ExerciseRecommend from './pages/exerciseRecommend';
import CreateProfile from './pages/createProfile';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <img src={soonmu01} alt="Soonmu Logo" className="soonmu-logo-app" />
        <h1 className="title">순무</h1>
        <p className="subtitle">순천향대학교 건강관리 커뮤니티 방문을 환영합니다</p>
        <div className="button-group">
          <button onClick={() => navigate('/login')} className="btn">로그인</button>
          <button onClick={() => navigate('/signup')} className="btn">회원가입</button>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mainPage" element={<MainPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/healthRecords" element={<HealthRecords />} />
        <Route path="/exerciseGoal" element={<ExerciseGoal />} />
        <Route path="/exerciseRecommend" element={<ExerciseRecommend />} />
        <Route path="/createProfile" element={<CreateProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
