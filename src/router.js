import { Routes, Route } from "react-router-dom";
import HomPage from "./pages/users/homPage/index";
import { ROUTERS } from "./utils/router";
import Login from "./pages/users/homPage/Login";
import MasterLayout from "./pages/users/theme/masterLayout";
import { Component, Profiler } from "react";
import ProfilePage from "./pages/users/profilePage";
import BasicExample from "pages/users/theme/header/navbar";
import OffcanvasExample from "pages/users/theme/header/navbar";
const renderUsersRouter = () => {
  const userRouter = [
    {
      path: ROUTERS.USER.LOGIN,
      component: <Login />,
    },
    {
      path: ROUTERS.USER.HOME,
      component: <HomPage />,
      // component: <BasicExample />,
    },
    {
      path: ROUTERS.USER.PROFILE,
      component: <ProfilePage />,
    },
    {
      path: ROUTERS.USER.TEST,
      Component: <OffcanvasExample />,
    },
  ];

  return (
    <MasterLayout>
      <Routes>
        {userRouter.map((item, key) => {
          return <Route key={key} path={item.path} element={item.component} />;
        })}
      </Routes>
    </MasterLayout>
  );
};
const RouterCustom = () => {
  return renderUsersRouter();
};
export default RouterCustom;
