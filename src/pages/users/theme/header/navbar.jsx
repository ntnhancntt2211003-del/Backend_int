import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { FaFacebookSquare, FaInstagramSquare, FaTwitter } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom"; // Thêm NavLink
import { FaRegUser } from "react-icons/fa6";
import { MdOutgoingMail } from "react-icons/md";
import { formater } from "utils/formater";
import { ROUTERS } from "utils/router";
import "./NavBar.scss";
import "./style.scss";
import React, { useState } from "react";

const OffcanvasExample = () => {
  const [menu, setMenu] = useState([
    { name: "TRANG CHỦ", path: ROUTERS.USER.HOME },
    { name: "CỬA HÀNG", path: ROUTERS.USER.SHOP },
    {
      name: "SẢN PHẨM",
      path: ROUTERS.USER.PRODUCTS,
      isShowSubmenu: false,
      child: [
        { name: "Toyota", path: "/products/toyota" },
        { name: "BMW", path: "/products/bmw" },
      ],
    },
    { name: "BÀI VIẾT", path: "" },
    { name: "LIÊN HỆ", path: "" },
  ]);

  return (
    <>
      <div className="header_top">
        <div className="container">
          <div className="row">
            <div className="col-6 header_top-left">
              <ul>
                <li>
                  <MdOutgoingMail /> hello@gmail.com
                </li>
                <li>Miễn phí ship từ {formater(200000)}</li>
              </ul>
            </div>
            <div className="col-6 header_top-right">
              <ul className="nav">
                <li>
                  <Link to="">
                    <FaFacebookSquare />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <FaInstagramSquare />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <FaTwitter />
                  </Link>
                </li>
                <li>
                  <Link to="">
                    <FaRegUser />
                    <span>Login</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Navbar expand="sm" className="bg-transparent">
        <Container fluid>
          <Navbar.Brand href="#">Navbar Offcanvas</Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" />
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-sm"
            aria-labelledby="offcanvasNavbarLabel-expand-sm"
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-sm">
                Offcanvas
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                {menu.map((item, menuKey) => (
                  <Nav key={menuKey}>
                    {item.child?.length > 0 ? (
                      <NavDropdown
                        title={item.name}
                        id={`nav-dropdown-${menuKey}`}
                      >
                        {item.child.map((childItem, childIndex) => (
                          <NavDropdown.Item
                            key={`${menuKey}-${childIndex}`}
                            as={NavLink}
                            to={childItem.path}
                          >
                            {childItem.name}
                          </NavDropdown.Item>
                        ))}
                      </NavDropdown>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => (isActive ? "active" : "")}
                      >
                        {item.name}
                      </NavLink>
                    )}
                  </Nav>
                ))}
              </Nav>
              <Form className="d-flex">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-primary">Tìm</Button>
              </Form>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default OffcanvasExample;
