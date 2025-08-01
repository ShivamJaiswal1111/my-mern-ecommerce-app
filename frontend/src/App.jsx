import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './features/auth/components/LoginForm';
import RegisterForm from './features/auth/components/RegisterForm';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './features/auth/authSlice';
import { getCart, clearCart } from './features/cart/cartSlice.js';
import './App.css';
import React, { useState, useEffect } from 'react';
import ProductList from './features/products/components/ProductList.jsx';
import ProductDetails from './features/products/components/ProductDetails.jsx';
import CartPage from './features/cart/components/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderDetailsPage from './pages/OrderDetailsPage.jsx';

function HomePage() {
  const { userInfo } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
  };

  useEffect(() => {
    if (userInfo) {
      dispatch(getCart());
    } else {
      dispatch(clearCart());
    }
  }, [dispatch, userInfo]);

  return (
    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34', color: 'white', minHeight: '100vh' }}>
      <h1>Welcome to My E-commerce App!</h1>
      <p>This is the home page.</p>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <li><Link to="/" style={{ color: '#61dafb', textDecoration: 'none' }}>Home</Link></li>
          {!userInfo ? (
            <>
              <li><Link to="/login" style={{ color: '#61dafb', textDecoration: 'none' }}>Login</Link></li>
              <li><Link to="/register" style={{ color: '#61dafb', textDecoration: 'none' }}>Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/profile" style={{ color: '#61dafb', textDecoration: 'none' }}>Profile</Link></li>
              <li><Link to="/cart" style={{ color: '#61dafb', textDecoration: 'none' }}>
                Cart ({totalItems})
              </Link></li>
              <li style={{ color: '#61dafb', textDecoration: 'none' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '1em',
                    textDecoration: 'underline',
                    padding: 0,
                    margin: 0,
                    lineHeight: 'inherit',
                    verticalAlign: 'baseline'
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {userInfo && (
        <div style={{ marginTop: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', display: 'inline-block', backgroundColor: '#333' }}>
          <h3>Logged In User:</h3>
          <p>Name: {userInfo.name}</p>
          <p>Email: {userInfo.email}</p>
          <p>Admin: {userInfo.isAdmin ? 'Yes' : 'No'}</p>
          <p>Token: {userInfo.token ? 'Present (check local storage)' : 'Missing'}</p>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ color: '#61dafb' }}>Our Products</h2>
        <ProductList />
      </div>

      <p style={{ marginTop: '50px', fontSize: '0.8em', color: '#aaa' }}>
        Backend is running on https://my-mern-ecommerce-app.onrender.com/
      </p>
    </div>
  );
}

function ProfilePage() {
  const { userInfo } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo || !userInfo.token) {
        setProfileError('Not logged in. Please login to view profile.');
        return;
      }
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const response = await fetch('https://my-mern-ecommerce-app.onrender.com/api/users/profile', config);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`);
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        setProfileError(error.message || 'Error fetching profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [userInfo]);
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto', backgroundColor: '#282c34', color: 'white' }}>
      <h2>User Profile</h2>
      {loadingProfile && <p>Loading profile...</p>}
      {profileError && <p style={{ color: 'red' }}>{profileError}</p>}
      {profileData ? (
        <div>
          <p><strong>Name:</strong> {profileData.name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Admin:</strong> {profileData.isAdmin ? 'Yes' : 'No'}</p>
          <p>This data was fetched from the backend using your token!</p>
        </div>
      ) : (
        !loadingProfile && !profileError && <p>No profile data available. Please login.</p>
      )}
      <p><Link to="/" style={{ color: '#61dafb' }}>Go to Home</Link></p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;