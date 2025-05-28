import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';


const Signup = () => {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [department, setDepartment] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!id) newErrors.id = '아이디를 입력해주세요.';
        if (!pw || pw.length < 8) newErrors.pw = '비밀번호는 8자 이상이어야 합니다.';
        if (!studentNumber) newErrors.studentNumber = '학번을 입력해주세요.';
        if (!name) newErrors.name = '이름을 입력해주세요.';
        if (!gender) newErrors.gender = '성별을 선택해주세요.';
        return newErrors;
    };

    const submitBtn = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }
        try {
                const res = await fetch('http://localhost:3001/api/signup', {
                    method: 'POST',
                    body: JSON.stringify({
                        member_id: id,
                        password: pw,
                        student_number: Number(studentNumber),
                        name,
                        gender,
                        department: department || null,
                    }),
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await res.json();

                alert(data);
                if (res.status === 200) {
                    navigate('/');
                } else {
                    setId('');
                    setPw('');
                    setStudentNumber('');
                    setName('');
                    setGender('');
                    return;
                }
            } catch(err) {
                console.log(err);
            }
    };

    return (
       <div className="page-container">
            <h1 className="page-title">회원가입</h1>
            <div className="form">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="input"
                    />
                    {errors.id && <p className="error">{errors.id}</p>}
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="비밀번호 (8자 이상)"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="input"
                    />
                    {errors.pw && <p className="error">{errors.pw}</p>}
                </div>
                <div className="input-group">
                    <input
                        type="number"
                        placeholder="학번"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        className="input"
                    />
                    {errors.studentNumber && <p className="error">{errors.studentNumber}</p>}
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                    />
                    {errors.name && <p className="error">{errors.name}</p>}
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="학과 (선택사항)"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="gender-group">
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={gender === 'M'}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        남성
                    </label>
                    <label style={{ marginLeft: '20px' }}>
                        <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={gender === 'F'}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        여성
                    </label>
                </div>
                {errors.gender && <p className="error">{errors.gender}</p>}
                <button type='submit' onClick={submitBtn} className="button">가입</button>
            </div>
        </div>
    );
};

export default Signup;
