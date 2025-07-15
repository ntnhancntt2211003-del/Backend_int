import { memo } from "react";
import Header from "../header";
import Footer from "../footer";
import NavScrollExample from "pages/users/theme/header/navbar";
const MasterLayout = ({ children, ...props }) => {
  return (
    <div {...props}>
      {/* <NavScrollExample /> */}

      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default memo(MasterLayout);
