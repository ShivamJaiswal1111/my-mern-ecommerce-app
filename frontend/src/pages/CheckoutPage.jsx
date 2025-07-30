import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder } from '../features/order/orderSlice'; // We'll create this slice next
import { getCart } from '../features/cart/cartSlice'; // To get latest cart details

// Simple step indicator component
const CheckoutSteps = ({ step1, step2, step3 }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '20px' }}>
      <div style={{ color: step1 ? '#61dafb' : '#aaa', fontWeight: step1 ? 'bold' : 'normal' }}>Shipping</div>
      <div style={{ color: step2 ? '#61dafb' : '#aaa', fontWeight: step2 ? 'bold' : 'normal' }}>Payment</div>
      <div style={{ color: step3 ? '#61dafb' : '#aaa', fontWeight: step3 ? 'bold' : 'normal' }}>Place Order</div>
    </div>
  );
};


function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, totalPrice, totalItems, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);

  // State for checkout steps
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Place Order

  // Shipping Address State (you might load from user profile later)
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery'); // Default to COD

  // Order creation state from Redux
  const { loading: orderLoading, success: orderSuccess, error: orderError, order: createdOrder } = useSelector((state) => state.order); // We'll create orderSlice next

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate('/login');
    }
    // Fetch cart details on component mount to ensure it's up to date
    if (userInfo && cartItems.length === 0 && !cartLoading) { // Only fetch if cart is empty and not already loading
       dispatch(getCart());
    }

    // After successful order creation, redirect to order confirmation/details page
    if (orderSuccess && createdOrder) {
      navigate(`/order/${createdOrder._id}`); // Redirect to order details page
    }

    // Handle cart being empty - redirect back to cart or home
    if (cartItems.length === 0 && !cartLoading && userInfo && step < 3) { // If cart becomes empty during checkout flow
        // console.log("Cart is empty, redirecting to cart page.");
        // navigate('/cart'); // Redirect back if cart is empty
    }

  }, [userInfo, navigate, orderSuccess, createdOrder, dispatch, cartItems, cartLoading, step]);

  // Handlers for each step
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (address && city && postalCode && country) {
      setStep(2); // Go to next step
    } else {
      alert('Please fill in all shipping details');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3); // Go to next step
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      navigate('/'); // Redirect to home
      return;
    }

    const orderItems = cartItems.map(item => ({
      product: item.product, // Product ID string
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
    }));

    const orderData = {
      orderItems,
      shippingAddress: { address, city, postalCode, country },
      paymentMethod,
      taxPrice: 0, // Calculate these accurately later based on cart totals
      shippingPrice: 0, // Calculate these accurately later
      totalPrice: totalPrice, // Use total from cart state
    };

    // Dispatch the createOrder async thunk
    dispatch(createOrder(orderData));
  };


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '50px auto', backgroundColor: '#333', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#61dafb', marginBottom: '30px' }}>Checkout</h2>
      <CheckoutSteps step1={step === 1} step2={step === 2} step3={step === 3} />

      {cartItems.length === 0 && !cartLoading && userInfo ? (
        <div style={{ textAlign: 'center' }}>
          <p>Your cart is empty. Please <Link to="/" style={{ color: '#61dafb' }}>continue shopping</Link>.</p>
        </div>
      ) : null}


      {/* Step 1: Shipping */}
      {step === 1 && cartItems.length > 0 && (
        <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Continue</button>
        </form>
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && cartItems.length > 0 && (
        <div>
          <h3>Select Payment Method</h3>
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="CashOnDelivery"
                checked={paymentMethod === 'CashOnDelivery'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash On Delivery
            </label>
            {/* Add other payment options later */}
            <button type="submit" style={buttonStyle}>Continue</button>
          </form>
        </div>
      )}

      {/* Step 3: Place Order */}
      {step === 3 && cartItems.length > 0 && (
        <div>
          <h3>Order Summary</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #555', padding: '10px', borderRadius: '5px' }}>
            {cartItems.map(item => (
              <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dotted #555', paddingBottom: '5px' }}>
                <span>{item.name} x {item.qty}</span>
                <span>₹{(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #555', paddingTop: '10px', marginTop: '10px', textAlign: 'right' }}>
            <p>Items: ₹{totalPrice.toFixed(2)}</p>
            <p>Shipping: ₹{0.00.toFixed(2)}</p> {/* Placeholder for now */}
            <p>Tax: ₹{0.00.toFixed(2)}</p> {/* Placeholder for now */}
            <h3 style={{ color: '#61dafb' }}>Order Total: ₹{totalPrice.toFixed(2)}</h3>
            <p style={{ marginTop: '10px' }}>Payment Method: {paymentMethod}</p>
          </div>

          {orderError && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{orderError}</p>}
          <button
            onClick={handlePlaceOrder}
            disabled={orderLoading || cartItems.length === 0}
            style={buttonStyle}
          >
            {orderLoading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}

// Basic inline styles for simplicity
const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #555',
  backgroundColor: '#444',
  color: 'white',
  fontSize: '1em',
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1.1em',
  marginTop: '10px',
  transition: 'background-color 0.3s ease'
};

export default CheckoutPage;