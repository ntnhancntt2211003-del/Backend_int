import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../header";
import Footer from "../footer";

import NavScrollExample from "pages/users/theme/header/navbar";

const MasterLayout = (props) => {
  return (
    <div {...props}>
      {/* <NavScrollExample /> */}

      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default memo(MasterLayout);
