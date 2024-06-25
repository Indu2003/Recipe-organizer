import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [newRecipe, setNewRecipe] = useState({ title: '', category: '', instructions: '', image: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded.id);
      fetchRecipes(token);
    }
  }, []);

  const fetchRecipes = async (token) => {
    const res = await axios.get('http://localhost:3000/api/recipes', { headers: { 'x-access-token': token } });
    setRecipes(res.data);
  };

  const handleLogin = async () => {
    const res = await axios.post('http://localhost:3000/api/users/login', { username, password });
    localStorage.setItem('token', res.data.token);
    const decoded = jwtDecode(res.data.token);
    setUser(decoded.id);
    fetchRecipes(res.data.token);
  };

  const handleSignup = async () => {
    const res = await axios.post('http://localhost:3000/api/users/signup', { username, password });
    local
