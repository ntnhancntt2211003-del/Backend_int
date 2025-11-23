import { memo } from "react";
import Breadcrumb from "../theme/breadcrumb";
import { generatePath, Link } from "react-router-dom";
import "./style.scss";
import { categories } from "../../../constants/categories.js";
import { ROUTERS } from "utils/router";
import BackToTopButton from "../../../component/ProductCard/BackToTopButton.js";
const ProductsPage = () => {
  const sorts = [
    "Giá: Thấp đến cao",
    "Giá: Cao đến thấp",
    "Mới nhất",
    "Cũ nhất",
  ];
  const products = [
    {
      id: 1,
      name: "Nike Air Force 1",
      price: "2,500,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 2,
      name: "Nike Air Max 97",
      price: "3,200,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 3,
      name: "Nike Air Jordan 1",
      price: "4,000,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 4,
      name: "Nike Dunk Low",
      price: "2,800,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 5,
      name: "Nike Blazer Mid",
      price: "2,600,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 6,
      name: "Nike Air Zoom Pegasus",
      price: "2,900,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 7,
      name: "Nike React Infinity Run",
      price: "3,100,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 8,
      name: "Nike Air VaporMax",
      price: "4,200,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 9,
      name: "Nike SB Dunk High",
      price: "3,500,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 10,
      name: "Nike Air Huarache",
      price: "2,700,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 11,
      name: "Nike Air Max Plus",
      price: "3,300,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 12,
      name: "Nike Air Monarch",
      price: "2,200,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 13,
      name: "Nike Free RN",
      price: "2,400,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 14,
      name: "Nike Court Vision",
      price: "2,100,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
    {
      id: 15,
      name: "Nike Air Max 270",
      price: "3,000,000₫",
      img: require("../images/hero/sp1.jpg"),
    },
  ];

  return (
    <>
      <Breadcrumb name="Danh sách sản phẩm" />;
      <div className="container">
        <div className="page-content-wrapper">
          <div className="sidebar">
            <div className="sidebar__item">
              <h2>Tìm kiếm</h2>
              <input type="text" />
            </div>
            <div className="sidebar__item">
              <div className="price-range-wrap">
                <h2>Khoảng giá</h2>
                <div>
                  <p>Từ</p>
                  <input type="number" min={0} />
                </div>
                <div>
                  <p>Đến</p>
                  <input type="number" min={0} />
                </div>
              </div>
            </div>
            <div className="sidebar__item">
              <h2>Sắp Xếp</h2>
              <div className="tags">
                {sorts.map((item, key) => (
                  <div className={`tag ${key === 0 ? "active" : ""}`} key={key}>
                    {" "}
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar__item">
              <h2>Danh mục</h2>
              <ul>
                {categories.map((name, key) => (
                  <li key={key}>
                    <Link to={ROUTERS.USER.PRODUCTS}>{name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="products-content">
            <div className="row">
              {products.map((product) => (
                <div className="col-lg-4 col-md-6 mb-4" key={product.id}>
                  <Link
                    to={generatePath(ROUTERS.USER.PRODUCT_DETAIL, { id: 1 })}
                    className="product-card-link"
                  >
                    <div className="product-card">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="product-img"
                      />
                      <div className="product-name">{product.name}</div>
                      <div className="product-price">{product.price}</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default memo(ProductsPage);
