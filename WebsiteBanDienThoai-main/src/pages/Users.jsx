import { useEffect, useState } from "react";

function Users() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const userData = data.data || data;
        setUsers(userData);
      })
      .catch(err => console.log("Lỗi kết nối:", err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Danh sách Users</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default Users;