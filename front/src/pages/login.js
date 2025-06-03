import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const navigate = useNavigate();

    const loginSubmit = async () => {
    if (id === '' || pw === '') {
        alert('아이디 또는 비밀번호를 입력해주시기 바랍니다');
        return;
    }

    try {
        const res = await fetch('http://localhost:3001/api/loginCheck', {
            method: 'POST',
            body: JSON.stringify({ member_id: id, password: pw }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await res.json();

        if (res.status === 200) {
            localStorage.setItem('member_id', id);
            localStorage.setItem('role', data.role); // role 저장

            // 역할에 따라 이동
            if (data.role === 'admin') {
                navigate('/admin'); // 관리자 페이지
            } else {
                navigate('/mainPage'); // 일반 사용자
            }
        } else {
            alert(data.message || '로그인 실패');
            setId('');
            setPw('');
        }
    } catch (err) {
        console.log(err);
        alert('서버 오류가 발생했습니다');
    }
};


    const moveSignUP = () => {
        navigate('/signup');
    }

    return (
        <div className="page-container">
            <h1 className="page-title">로그인</h1>
            <div className="form">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="input"
                    />
                </div>
                <button type="submit" onClick={loginSubmit} className="button">로그인</button>
                <button onClick={moveSignUP} className="button">회원가입</button>
            </div>
        </div>
    );
};

export default Login;