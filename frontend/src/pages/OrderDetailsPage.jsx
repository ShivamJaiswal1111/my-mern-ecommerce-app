import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById, resetOrderState } from '../features/order/orderSlice'; // Action to fetch order by ID
import { clearCart } from '../features/cart/cartSlice'; // Clear cart from frontend after order

function OrderDetailsPage() {
  const { id: orderId } = useParams(); // Get order ID from URL
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (!userInfo) {
      // If not logged in, redirect to login (or handle as unauthorized)
      // For now, just log
      console.log("Not logged in to view order details.");
      return;
    }

    // Fetch order details when component mounts or orderId changes
    if (orderId) {
      dispatch(getOrderById(orderId));
      dispatch(clearCart()); // Clear cart state on frontend after order is placed
    }

    // Cleanup state when component unmounts or order is viewed
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch, orderId, userInfo]);


  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading order details...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>{error}</p>
        <Link to="/myorders" style={{ color: '#61dafb' }}>Go to My Orders</Link> {/* Link to user orders list (later) */}
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
        <p>Order not found or invalid ID.</p>
        <Link to="/" style={{ color: '#61dafb' }}>Go to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '30px auto', backgroundColor: '#333', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', color: 'white' }}>
      <h2 style={{ textAlign: 'center', color: '#61dafb', marginBottom: '20px' }}>Order Details</h2>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '30px' }}>Order ID: {order._id}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Shipping Info */}
        <div>
          <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '15px' }}>Shipping</h3>
          <p><strong>Name:</strong> {order.user.name}</p> {/* Populate user name from populated order */}
          <p><strong>Email:</strong> {order.user.email}</p> {/* Populate user email from populated order */}
          <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
          {order.isDelivered ? (
            <p style={{ color: '#28a745' }}>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</p>
          ) : (
            <p style={{ color: '#ffc107' }}>Not Delivered</p>
          )}
        </div>

        {/* Payment Info */}
        <div>
          <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '15px' }}>Payment</h3>
          <p><strong>Method:</strong> {order.paymentMethod}</p>
          {order.isPaid ? (
            <p style={{ color: '#28a745' }}>Paid on {new Date(order.paidAt).toLocaleDateString()}</p>
          ) : (
            <p style={{ color: '#ffc107' }}>Not Paid</p>
          )}
          {/* Payment details would go here if paymentResult is populated */}
          {order.paymentResult && order.paymentResult.id && (
              <p style={{ fontSize: '0.9em', color: '#aaa' }}>Payment ID: {order.paymentResult.id}</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginBottom: '15px' }}>Order Items</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {order.orderItems.map((item) => (
          <div key={item.product} style={{ display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #555', borderRadius: '8px', padding: '10px', backgroundColor: '#444' }}>
            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
            <Link to={`/product/${item.product}`} style={{ flexGrow: 1, color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              {item.name}
            </Link>
            <span>{item.qty} x ₹{item.price.toFixed(2)} = ₹{(item.qty * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div style={{ borderTop: '1px solid #555', paddingTop: '20px', textAlign: 'right' }}>
        <p>Items Price: ₹{(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)}</p>
        <p>Shipping: ₹{order.shippingPrice.toFixed(2)}</p>
        <p>Tax: ₹{order.taxPrice.toFixed(2)}</p>
        <h3 style={{ color: '#61dafb', fontSize: '1.4em', marginTop: '10px' }}>Total Order: ₹{order.totalPrice.toFixed(2)}</h3>
      </div>
    </div>
  );
}

export default OrderDetailsPage;