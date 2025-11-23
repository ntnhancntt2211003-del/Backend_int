import { Routes, Route } from "react-router-dom";
import HomPage from "./pages/users/homPage/index";
import { ROUTERS } from "./utils/router";
import { LoginPage, RegisterPage } from "./pages/users/auth";
import PostAdPage from "./pages/users/postAd/index.js";
import PaymentSuccessPage from "./pages/users/paymentSuccess/index.js";
import MasterLayout from "./pages/users/theme/masterLayout";
// import { Component, Profiler } from "react";
import ProductsPage from "./pages/users/productsPage";
// import BasicExample from "pages/users/theme/header/navbar";
import OffcanvasExample from "pages/users/theme/header/navbar";
import ProductDetailPage from "./pages/users/productPage__Detail";
import ProfilePage from "pages/users/ProfilePage/ProfilePage";

// Admin imports
import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminUsers from "./admin/pages/Users";
import AdminOrders from "./admin/pages/Orders";
import AdminPosts from "./admin/pages/Posts";
import AdminAds from "./admin/pages/Ads";
import AdminRevenue from "./admin/pages/Revenue";

// const renderUsersRouter = () => {
//   const userRouter = [
//     {
//       path: ROUTERS.USER.LOGIN,
//       component: <Login />,
//     },
//     {
//       path: ROUTERS.USER.HOME,
//       component: <HomPage />,
//       // component: <BasicExample />,
//     },
//     {
//       path: ROUTERS.USER.PRODUCTS,
//       component: <ProductsPage />,
//     },
//     {
//       path: ROUTERS.USER.PRODUCT_DETAIL,
//       component: <ProductDetailPage />,
//     },
//     {
//       path: ROUTERS.USER.TEST,
//       component: <OffcanvasExample />,
//     },
//     {
//       path: ROUTERS.USER.PROFILE,
//       component: <ProfilePage />,
//     },
//   ];

//   return (
//     <MasterLayout>
//       <Routes>
//         {userRouter.map((item, key) => {
//           return <Route key={key} path={item.path} element={item.component} />;
//         })}
//       </Routes>
//     </MasterLayout>
//   );
// };
const RouterCustom = () => (
  <Routes>
    {/* Auth routes - không có header/footer */}
    <Route path={ROUTERS.USER.LOGIN} element={<LoginPage />} />
    <Route path={ROUTERS.USER.REGISTER} element={<RegisterPage />} />

    {/* Payment success route - không cần header/footer */}
    <Route
      path={ROUTERS.USER.PAYMENT_SUCCESS}
      element={<PaymentSuccessPage />}
    />

    {/* User routes bọc bởi MasterLayout */}
    <Route element={<MasterLayout />}>
      <Route path={ROUTERS.USER.HOME} element={<HomPage />} />
      <Route path={ROUTERS.USER.PRODUCTS} element={<ProductsPage />} />
      <Route path="/users/post-ad" element={<PostAdPage />} />
      <Route
        path={ROUTERS.USER.PRODUCT_DETAIL}
        element={<ProductDetailPage />}
      />
      <Route path={ROUTERS.USER.TEST} element={<OffcanvasExample />} />
      <Route path={ROUTERS.USER.PROFILE} element={<ProfilePage />} />
    </Route>

    {/* Admin routes bọc bởi AdminLayout (uses Outlet inside AdminLayout) */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="posts" element={<AdminPosts />} />
      <Route path="ads" element={<AdminAds />} />
      <Route path="revenue" element={<AdminRevenue />} />
      <Route path="settings" element={<div>Cài đặt (chưa hoàn thành)</div>} />
      <Route path="*" element={<div>Trang không tồn tại</div>} />
    </Route>
  </Routes>
);
// const RouterCustom = () => {
//   return renderUsersRouter();
// };
export default RouterCustom;
