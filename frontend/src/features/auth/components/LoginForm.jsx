import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../authSlice';
import { useNavigate, Link } from 'react-router-dom'; // <--- Ensure 'Link' is imported here

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useSelector((state) => state.auth);

  console.log('LoginForm rendered. loading:', loading, 'error:', error, 'userInfo:', userInfo);

  useEffect(() => {
    console.log('useEffect triggered. userInfo changed:', userInfo);
    if (userInfo) {
      console.log('User info detected in useEffect. Attempting redirect.');
      navigate('/'); // Redirect to home page on successful login
    }
    if (error) {
      console.log('Error detected in useEffect:', error);
      const timer = setTimeout(() => {
        dispatch(clearAuthError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userInfo, error, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called. Dispatching loginUser.');
    dispatch(loginUser({ email, password }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#282c34', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#61dafb' }}>Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: 'calc(100% - 16px)', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: 'calc(100% - 16px)', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 15px',
            backgroundColor: loading ? '#0056b3' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.3s ease'
          }}
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', color: '#aaa' }}>
        Don't have an account? <Link to="/register" style={{ color: '#61dafb' }}>Register</Link>
      </p>
    </div>
  );
}

export default LoginForm;