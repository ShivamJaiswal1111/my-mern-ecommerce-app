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



## Contributing

We welcome contributions to this project! If you find a bug, have a feature request, or want to improve the code, please follow these steps:

1.  **Fork the repository:** Click the 'Fork' button at the top right of this GitHub page to create a copy of this repository in your own GitHub account.
2.  **Clone your forked repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/your-repo-name.git](https://github.com/YOUR_USERNAME/your-repo-name.git)
    cd your-repo-name
    ```
    *(Replace `YOUR_USERNAME` and `your-repo-name` with your actual GitHub details for your forked repository)*
3.  **Create a new branch:**
    ```bash
    git checkout -b feature/your-feature-name
    ```
    *(Use a descriptive name like `feature/add-checkout-flow` or `bugfix/fix-image-display`)*
4.  **Make your changes:** Implement your new feature or bug fix.
5.  **Commit your changes:**
    ```bash
    git commit -m "feat: Briefly describe your feature or fix"
    ```
    *(Start your commit message with `feat:` for features, `fix:` for bug fixes, `docs:` for documentation, etc.)*
6.  **Push to your branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Open a Pull Request (PR):**
    * Go to your forked repository on GitHub.
    * You should see a prompt to create a Pull Request from your new branch to the `main` branch of the original repository.
    * Provide a clear title and description for your changes.

Please ensure your code adheres to the existing project structure and conventions.



**1. Clone the Repository:**
```bash
git clone [https://github.com/ShivamJaiswal1111/my-mern-ecommerce-app.git](https://github.com/ShivamJaiswal1111/my-mern-ecommerce-app.git)
cd my-mern-ecommerce-app