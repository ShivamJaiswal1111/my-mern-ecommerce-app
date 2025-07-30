import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './features/auth/components/LoginForm';
import RegisterForm from './features/auth/components/RegisterForm';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './features/auth/authSlice';
import './App.css';
import React, { useState, useEffect } from 'react';

import ProductList from './features/products/components/ProductList.jsx';
import ProductDetails from './features/products/components/ProductDetails.jsx';
import CartPage from './features/cart/components/CartPage.jsx'; // Ensure this import is here
import CheckoutPage from './pages/CheckoutPage.jsx'; // Ensure this import is here
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'; // Ensure this import is here

// HomePage component
function HomePage() {
  const { userInfo } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart); // totalItems for cart count
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    // Optionally clear cart state on frontend when user logs out
    // dispatch(clearCart()); // Uncomment if you want to clear cart on logout
  };

  // Fetch cart details on HomePage load if user is logged in
  useEffect(() => {
    if (userInfo) {
      // dispatch(getCart()); // Uncomment if you want cart to be fetched on every Home page load
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
                Cart ({totalItems}) {/* Display total items in cart */}
              </Link></li>
              {/* Logout button with aligned styling */}
              <li style={{ color: '#61dafb', textDecoration: 'none' }}> {/* Apply link color to li */}
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit', // Inherit color from parent li
                    cursor: 'pointer',
                    fontSize: '1em', // Ensure font size matches links
                    textDecoration: 'underline',
                    padding: 0, // Remove default button padding
                    margin: 0, // Remove default button margin
                    lineHeight: 'inherit', // Ensure line height matches links
                    verticalAlign: 'baseline' // Align text baseline
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
        Backend is running on http://localhost:5001/
      </p>
    </div>
  );
}

// ProfilePage component (remains unchanged)
function ProfilePage() {
  const { userInfo } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('--- PROFILE FETCH INITIATED ---');
      if (!userInfo || !userInfo.token) {
        setProfileError('Not logged in. Please login to view profile.');
        console.log('Profile fetch aborted: No user info or token.');
        return;
      }

      setLoadingProfile(true);
      setProfileError(null);
      try {
        console.log('Fetching profile for user:', userInfo.email);
        console.log('Using token:', userInfo.token.substring(0, 30) + '...');

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json',
          },
        };
        const response = await fetch('http://localhost:5001/api/users/profile', config);

        console.log('Profile fetch response status:', response.status);
        console.log('Profile fetch response headers:', [...response.headers.entries()]);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Profile fetch non-OK response text:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || 'Failed to fetch profile (JSON error)');
          } catch (parseError) {
            throw new Error(`Failed to fetch profile: ${response.status} - ${errorText.substring(0, 100)}... (Not JSON)`);
          }
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const rawResponseText = await response.text();
          console.error('Profile fetch: Expected JSON, got:', contentType, 'Raw response:', rawResponseText.substring(0, 100));
          throw new Error(`Expected JSON response for profile, but got ${contentType}. Raw: ${rawResponseText.substring(0, 50)}...`);
        }

        const data = await response.json();
        setProfileData(data);
        console.log('Profile data fetched successfully:', data);

      } catch (error) {
        console.error("Profile fetch caught error:", error);
        setProfileError(error.message || 'Error fetching profile');
      } finally {
        setLoadingProfile(false);
        console.log('--- PROFILE FETCH COMPLETED ---');
      }
    };

    fetchProfile();
  }, [userInfo]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#282c34', color: 'white' }}>
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
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#61dafb', textDecoration: 'none' }}>Go to Home</Link>
      </p>
    </div>
  );
}

// App component (remains unchanged)
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
        {/* Add more routes here as your app grows */}
      </Routes>
    </Router>
  );
}

export default App;