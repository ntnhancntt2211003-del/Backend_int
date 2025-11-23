// Example: How to use API with JWT Token

// 1. LOGIN - Get token
const loginResponse = await fetch("http://localhost:8080/api/login", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
email: "admin@example.com",
password: "password123",
}),
});

const loginData = await loginResponse.json();
const token = loginData.token; // Save this token

// 2. USE TOKEN IN REQUESTS - Add to Authorization header
const adminResponse = await fetch("http://localhost:8080/api/get-users", {
method: "GET",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`, // Add token here
},
});

// 3. CREATE ADMIN USER (for testing)
// Run this in MongoDB or use a script:
// db.users.insertOne({
// username: "Admin User",
// email: "admin@example.com",
// password: "password123", // Will be hashed automatically on login
// numberPhone: "0912345678",
// role: "admin",
// createdAt: new Date()
// })

// 4. MIDDLEWARE FLOW
// - verifyToken: Checks if token is valid and not expired
// - isAdmin: Checks if user.role === "admin"

// 5. PROTECTED ROUTES (require admin):
// POST /api/categories - Create category (admin only)
// DELETE /api/categories/:id - Delete category (admin only)
// POST /api/products - Create product (admin only)
// DELETE /api/products/:id - Delete product (admin only)
// POST /api/images/:id - Upload images (admin only)
// PUT /api/posting-fee - Update posting fee (admin only)

// 6. PROTECTED ROUTES (require auth, any user):
// GET /api/get-users - Get all users
// GET /api/user/:id - Get user by ID
// POST /api/payment/create - Create payment
// POST /api/payment/confirm - Confirm payment
