export const ROUTERS = {
  USER: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    SELLER_PROFILE: "/users/profile/:id",
    CART: "/cart",
    PRODUCTS: "/products",
    PRODUCT_DETAIL: "/products/chi-tiet/:id",
    POST_AD: "/users/post-ad",
    PAYMENT_SUCCESS: "/payment/success",
    TEST: "/test",
  },
  ADMIN: {
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    USERS: "/admin/users",
    ORDERS: "/admin/orders",
  },
};
