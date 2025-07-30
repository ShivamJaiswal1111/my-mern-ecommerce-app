import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../authSlice';
import { useNavigate, Link } from 'react-router-dom'; // <--- Ensure 'useNavigate' and 'Link' are imported

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // <--- Ensure this is initialized
  const { loading, error, success, userInfo } = useSelector((state) => state.auth);

  console.log('RegisterForm rendered. loading:', loading, 'error:', error, 'success:', success, 'userInfo:', userInfo); // NEW LOG

  useEffect(() => {
    console.log('Register useEffect triggered. userInfo changed:', userInfo, 'success changed:', success); // NEW LOG
    if (userInfo) {
      console.log('User info detected after register. Attempting redirect.'); // NEW LOG
      navigate('/'); // <--- This is the line that should redirect
    }
    // This part is for messages/errors, keep as is
    if (success && !userInfo) {
        setMessage('Registration successful! Please login.');
        dispatch(clearAuthError());
    }
    if (error) {
      console.log('Error detected after register:', error); // NEW LOG
      const timer = setTimeout(() => {
        dispatch(clearAuthError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userInfo, error, success, dispatch, navigate]); // <--- Ensure 'navigate' is in dependency array

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register handleSubmit called. Dispatching registerUser.'); // NEW LOG
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    dispatch(registerUser({ name, email, password }));
  };

  return (
    // ... (rest of your component's JSX, make sure it returns the form)
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#282c34', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#61dafb' }}>Register</h2>
      {message && <p style={{ color: message.includes('match') ? 'orange' : 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: 'calc(100% - 16px)', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white' }}
          />
        </div>
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
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', color: '#aaa' }}>
        Already have an account? <Link to="/login" style={{ color: '#61dafb' }}>Login</Link>
      </p>
    </div>
  );
}

export default RegisterForm;