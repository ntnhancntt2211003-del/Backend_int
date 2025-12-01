import { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "../header";
import Footer from "../footer";
import { useEditProductNavigation } from "../../../../hooks/useEditProductNavigation";

import NavScrollExample from "pages/users/theme/header/navbar";

const MasterLayout = (props) => {
  // Block navigation when editing product
  useEditProductNavigation();

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
