# MERN E-Commerce Website

This is a full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a dynamic and user-friendly online shopping experience with core functionalities for product browsing, cart management, user authentication, and order processing.

## Features

-   **User Authentication:** Secure user registration, login, logout, and profile management with JWT-based authentication and role-based access (Admin/User).
-   **Product Catalog:** Comprehensive product listing, individual product detail pages, and image display with Rupee (₹) currency symbol.
-   **Product Management (Backend):** Full CRUD (Create, Read, Update, Delete) operations for products, accessible via RESTful APIs (admin-only for create/update/delete).
-   **Image Uploads:** Backend support for local image uploads and serving product images.
-   **Shopping Cart:** Add items to cart, view cart contents, update quantities, and remove items.
-   **Checkout Flow:** Multi-step checkout process including shipping address, payment method selection (e.g., Cash on Delivery), and order summary.
-   **Order Management (Backend):** APIs to create new orders, fetch user-specific orders, fetch all orders (admin-only), and update order statuses (e.g., paid, delivered).
-   **Order Details:** Dedicated page to view comprehensive details of a placed order.

## Technologies Used

**Frontend:**
-   React.js (Library for UI)
-   Vite (Build Tool)
-   React Router DOM (for navigation)
-   Redux Toolkit & React Redux (for state management)
-   Axios (for API requests)
-   Basic Inline Styling (for rapid prototyping)

**Backend:**
-   Node.js (Runtime Environment)
-   Express.js (Web Framework)
-   MongoDB (Database)
-   Mongoose (ODM for MongoDB)
-   JWT (JSON Web Tokens for authentication)
-   Bcrypt.js (for password hashing)
-   Multer (for file uploads)
-   CORS (Cross-Origin Resource Sharing)
-   Dotenv (for environment variables)

## Setup and Running Locally

**Prerequisites:**
-   Node.js (v18+) & npm
-   MongoDB Community Server (running locally on port 27017)
-   Git

**1. Clone the Repository:**
```bash
git clone [https://github.com/ShivamJaiswal1111/my-mern-ecommerce-app.git](https://github.com/ShivamJaiswal1111/my-mern-ecommerce-app.git)
cd my-mern-ecommerce-app