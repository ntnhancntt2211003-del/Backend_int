import { memo } from "react";
import React, { useState } from "react";
import "./style.scss"; // Import the SCSS file for styling
// import "../../../../style/pages/style.css"; // Import the SCSS file for styling
import { FaFacebookSquare, FaInstagramSquare, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { MdOutgoingMail } from "react-icons/md";
import { formater } from "utils/formater";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { ROUTERS } from "utils/router";
import { Input, Space } from "antd";
import { AudioOutlined } from "@ant-design/icons";

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 14,
      color: "#1677ff",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "#010101",
    }}
  />
);

const NavBar = () => {
  const [menu, setMenu] = useState([
    { name: "TRANG CHỦ ", path: ROUTERS.USER.HOME },
    { name: "CỬA HÀNG ", path: ROUTERS.USER.SHOP },
    {
      name: "SẢN PHẨM",
      path: ROUTERS.USER.PRODUCTS,
      isShowSubmenu: false,
      child: [
        { name: "toyota", path: "" },
        { name: "bmw", path: "" },
      ],
    },

    {
      name: "BÀI VIẾT",
      path: "",
    },
    {
      name: "LIÊN HỆ",
      path: "",
    },
  ]);
  return (
    <>
      <div className="header">
        {/* <div className="header_top">
          <div className="container">
            <div className="row">
              <div className="col-6 header_top-left ">
                <ul className="">
                  <li>
                    {" "}
                    <MdOutgoingMail />
                    hello@gmail.com
                  </li>
                  <li>mien phi ship tu {formater(200000)}</li>
                </ul>
              </div>
              <div className="col-6 header_top-right">
                <ul className="nav ">
                  <li>
                    <Link to={""}>
                      <FaFacebookSquare />
                    </Link>
                  </li>
                  <li>
                    <Link to={""}>
                      <FaInstagramSquare />
                    </Link>
                  </li>
                  <li>
                    <Link to={""}>
                      <FaTwitter />
                    </Link>
                  </li>
                  <li>
                    <Link to={""}>
                      <FaRegUser />
                    </Link>
                    <span>Login</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div> */}
        <div className="container container__header">
          <div className="row">
            <div className="col-lg-3 container__header__logo">
              <div className="header__logo">
                <h1>HKT SHOP</h1>
              </div>
            </div>
            <div className="col-xl-6">
              <nav className="header__menu">
                <ul>
                  {menu?.map((menu, menuKey) => (
                    <li key={menuKey} className={menuKey === 0 ? "active" : ""}>
                      <Link to={menu?.path}>{menu?.name}</Link>
                      {menu.child && (
                        <ul className="header__menu__dropdown">
                          {menu.child.map((childItem, childKey) => (
                            <li key={`${menuKey}-${childKey}`}>
                              <Link to={childItem.path}>{childItem.name}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                  <li></li>
                </ul>
              </nav>
            </div>
            <div className="col-xl-3">
              <div className="header__cart">
                <div className="header__cart__search">
                  <Space direction="vertical" size="small">
                    <Search
                      placeholder="input search text"
                      allowClear
                      enterButton="Search"
                      size="small"
                      onSearch={(value) => console.log(value)}
                    />
                  </Space>
                </div>
                <div className="header__cart__price">
                  <span>{formater(11111111)}</span>
                </div>
                <ul>
                  <li>
                    <Link to="#">
                      <AiOutlineShoppingCart />
                      <span>3</span>{" "}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(NavBar);
