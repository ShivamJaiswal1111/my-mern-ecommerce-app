import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearProductError } from '../productSlice'; // Adjust path if needed
import ProductCard from './ProductCard.jsx'; // Adjust path if needed

function ProductList() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
    // Clear error when component unmounts or after a delay
    return () => {
      dispatch(clearProductError());
    };
  }, [dispatch]);

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'white' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div style={{ textAlign: 'center', color: 'white' }}>No products found. Please add some as admin.</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#282c34',
      minHeight: 'calc(100vh - 100px)' // Adjust based on header/footer
    }}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;