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
            return
        } else {
            try {
                const res = await fetch('http://localhost:3001/api/loginCheck', {
                    method: 'POST',
                    body: JSON.stringify({member_id: id, password: pw}),
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const data = await res.json();
                
                alert(data);
                if (res.status === 200) {
                    navigate('/mainPage');
                } else {
                    setId('');
                    setPw('');
                    return;
                }
            } catch(err) {
                console.log(err);
            }
        }
    }

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