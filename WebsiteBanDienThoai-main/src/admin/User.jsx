import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Admin.css";

const User = () => {

    const [users, setUsers] = useState([]);

    const navigate = useNavigate();

    const token = localStorage.getItem('admin_token');

    const API_BASE = import.meta.env.VITE_API_BASE_URL;


    /* ================= FETCH USERS ================= */

    const fetchUsers = async () => {

        try {

            const res = await axios.get(
                `${API_BASE}/api/admin/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            setUsers(res.data?.data?.data || []);

        } catch (error) {

            console.log(error);

        }

    };


    /* ================= CHECK LOGIN ================= */

    useEffect(() => {

        if (!token) {

            navigate('/admin/login');

        } else {

            fetchUsers();

        }

    }, []);


    /* ================= DELETE USER ================= */

    const deleteUser = async (id) => {

        if (!window.confirm('Bạn có chắc muốn xóa user này?')) {
            return;
        }

        try {

            await axios.delete(
                `${API_BASE}/api/admin/users/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert('Xóa user thành công');

            fetchUsers();

        } catch (error) {

            console.log(error);

            alert('Xóa thất bại');

        }

    };


    /* ================= LOGOUT ================= */

    const handleLogout = () => {

        localStorage.removeItem('admin_token');

        navigate('/admin/login');

    };


    return (

        <div className="admin-container">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <h2>ADMIN CP</h2>

                <ul>

                    <li
                        onClick={() => navigate('/admin')}
                        style={{ cursor: 'pointer' }}
                    >
                        📦 Quản lý sản phẩm
                    </li>

                    <li className="active">
                        👤 Quản lý User
                    </li>

                    <li
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        🏠 Về Trang Chủ
                    </li>

                    <li
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                    >
                        🚪 Đăng xuất
                    </li>

                </ul>

            </aside>


            {/* MAIN */}

            <main className="admin-main">

                <div className="admin-card">

                    <div className="admin-header-row">

                        <h1>Quản lý User</h1>

                    </div>


                    {/* TABLE */}

                    <table className="admin-table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Tên</th>

                                <th>Email</th>

                                <th>SĐT</th>

                                <th>Vai trò</th>

                                <th>Trạng thái</th>

                                <th>Thao tác</th>

                            </tr>

                        </thead>


                        <tbody>

                            {Array.isArray(users) && users.map((user) => (

                                <tr key={user.id}>

                                    <td>{user.id}</td>

                                    <td>{user.name}</td>

                                    <td>{user.email}</td>

                                    <td>{user.phone}</td>

                                    <td>

                                        <span
                                            className={
                                                user.role === 'admin'
                                                    ? 'role-admin'
                                                    : 'role-user'
                                            }
                                        >
                                            {user.role}
                                        </span>

                                    </td>

                                    <td>

                                        {user.status == 1 ? (
                                            <span className="role-user">
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="role-admin">
                                                Khóa
                                            </span>
                                        )}

                                    </td>

                                    <td>

                                        {user.role !== 'admin' && (

                                            <button
                                                className="btn-delete"
                                                onClick={() => deleteUser(user.id)}
                                            >
                                                Xóa
                                            </button>

                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </main>

        </div>

    );

};

export default User;