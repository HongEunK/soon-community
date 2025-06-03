import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('접근 권한이 없습니다.');
      navigate('/mainPage');
      return;
    }

    const fetchData = async () => {
      try {
        const resMembers = await fetch('http://localhost:3001/api/admin/members', {
          credentials: 'include',
        });
        const membersData = await resMembers.json();

        const resPosts = await fetch('http://localhost:3001/api/admin/posts', {
          credentials: 'include',
        });
        const postsData = await resPosts.json();

        if (Array.isArray(membersData)) {
          const filteredMembers = membersData.filter(member => member.role !== 'admin');
          setMembers(filteredMembers);
        } else {
          setMembers([]);
        }

        if (Array.isArray(postsData)) {
          setPosts(postsData);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDeleteMember = async (member_id) => {
    if (!window.confirm(`회원 ${member_id}을(를) 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/members/${member_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        alert('회원 삭제 완료');
        setMembers(members.filter(m => m.member_id !== member_id));
      } else {
        const errorData = await res.json();
        alert(`삭제 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleDeletePost = async (post_id) => {
    if (!window.confirm(`게시글 ${post_id}을(를) 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/posts/${post_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        alert('게시글 삭제 완료');
        setPosts(posts.filter(p => p.post_id !== post_id));
      } else {
        const errorData = await res.json();
        alert(`삭제 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="admin-page-container">
      <button className="admin-exit-button" onClick={() => navigate('/')}>
        나가기
      </button>

      <h1 className="admin-title">관리자 페이지</h1>

      <h2>회원 목록</h2>
      {members.length === 0 ? (
        <p>회원이 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>회원 ID</th>
              <th>이름</th>
              <th>권한</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.member_id}>
                <td>{member.member_id}</td>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td className="text-center">
                  <button className="delete-button" onClick={() => handleDeleteMember(member.member_id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>게시글 목록</h2>
      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>게시글 ID</th>
              <th>작성자 ID</th>
              <th>제목</th>
              <th>작성일</th>
              <th className="text-center"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.post_id}>
                <td>{post.post_id}</td>
                <td>{post.member_id}</td>
                <td>{post.title}</td>
                <td>{new Date(post.created_date).toLocaleString()}</td>
                <td className="text-center">
                  <button className="delete-button" onClick={() => handleDeletePost(post.post_id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
