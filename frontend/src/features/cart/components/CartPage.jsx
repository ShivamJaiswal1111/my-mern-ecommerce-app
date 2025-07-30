import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, addToCart, removeFromCart, clearCartError, clearCart } from '../cartSlice';
import { Link } from 'react-router-dom'; // Ensure Link is imported

function CartPage() {
  const dispatch = useDispatch();
  const { cartItems, totalItems, totalPrice, loading, error } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth); // To check if user is logged in

  useEffect(() => {
    if (userInfo) { // Only fetch cart if user is logged in
      dispatch(getCart());
    } else {
      // If not logged in, clear cart state in Redux
      dispatch(clearCart());
    }
    // Clear error when component unmounts or after a delay
    return () => {
      dispatch(clearCartError());
    };
  }, [dispatch, userInfo]); // Re-fetch cart if userInfo changes (e.g., login/logout)

  const handleUpdateQty = (productId, newQty) => { // productId should already be a string here
    if (!userInfo) {
      console.log("Please log in to update cart.");
      // Optionally show a message to the user
      return;
    }
    if (newQty < 1) { // If quantity goes below 1, remove the item
      handleRemoveFromCart(productId);
      return;
    }
    dispatch(addToCart({ productId, qty: newQty })); // addToCart handles updating existing qty or adding new
  };

  const handleRemoveFromCart = (productId) => { // productId should already be a string here
    if (!userInfo) {
      console.log("Please log in to remove items from cart.");
      // Optionally show a message to the user
      return;
    }
    dispatch(removeFromCart(productId));
  };

  // Display messages based on loading, error, or empty cart state
  if (!userInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white', backgroundColor: '#282c34', minHeight: '100vh' }}>
        <p>Please <Link to="/login" style={{ color: '#61dafb' }}>log in</Link> to view your cart.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading cart...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white', backgroundColor: '#282c34', minHeight: '100vh' }}>
        <h2 style={{ color: '#61dafb' }}>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" style={{ color: '#61dafb' }}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '30px auto', backgroundColor: '#333', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#61dafb', marginBottom: '30px' }}>Shopping Cart</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {cartItems.map((item) => (
          <div key={item.product} style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #555',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#444'
          }}>
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginRight: '20px' }}
            />
            <div style={{ flexGrow: 1 }}>
              <Link to={`/product/${item.product}`} style={{ fontSize: '1.1em', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
                {item.name}
              </Link>
              <p style={{ color: '#ccc' }}>₹{item.price.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => handleUpdateQty(item.product, item.qty - 1)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '1.1em' }}>{item.qty}</span>
              <button onClick={() => handleUpdateQty(item.product, item.qty + 1)} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
              <button onClick={() => handleRemoveFromCart(item.product)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '1px solid #555', paddingTop: '20px' }}>
        <h3 style={{ color: '#61dafb' }}>Total Items: {totalItems}</h3>
        <h3 style={{ color: '#61dafb' }}>Total Price: ₹{totalPrice.toFixed(2)}</h3>
        {/* Proceed to Checkout Button */}
        <Link to="/checkout" style={{ textDecoration: 'none' }}>
          <button
            disabled={cartItems.length === 0} // Disable if cart is empty
            style={{
              padding: '12px 25px',
              backgroundColor: cartItems.length === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1.1em',
              marginTop: '20px',
              transition: 'background-color 0.3s ease'
            }}
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CartPage;