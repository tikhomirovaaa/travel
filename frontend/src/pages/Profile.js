import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/users/?username=${username}`)
      .then(res => setUser(res.data));
  }, [username]);

  return (
    <div>
      <h1>{user?.username}</h1>
      <img src={user?.avatar} alt="Аватар" width="100" />
      <p>{user?.bio}</p>
    </div>
  );
}