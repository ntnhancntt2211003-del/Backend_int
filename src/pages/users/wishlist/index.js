import { memo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { FiMapPin } from "react-icons/fi";
import { PiHeartBold } from "react-icons/pi";
import Breadcrumb from "../theme/breadcrumb";
import BackToTopButton from "component/ProductCard/BackToTopButton";
import "./style.scss";
import { formater } from "utils/formater";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { ROUTERS } from "utils/router";

const WishlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState({});

  // Load wishlist từ localStorage
  useEffect(() => {
    if (!user || !user.id) {
      navigate("/login");
      return;
    }

    const loadWishlist = async () => {
      try {
        setLoading(true);
        const wishlistKey = `wishlist_${user.id}`;
        const savedWishlist = JSON.parse(
          localStorage.getItem(wishlistKey) || "[]"
        );

        if (savedWishlist.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // Fetch product details
        const productsData = await Promise.all(
          savedWishlist.map((productId) =>
            axios
              .get(`http://localhost:8080/api/products/${productId}`)
              .catch(() => null)
          )
        );

        const products = productsData
          .filter((response) => response !== null)
          .map((response) => response.data.data)
          .filter((p) => p.status !== "sold" && !p.isHidden);

        setWishlistProducts(products);

        // Fetch images for each product
        const imagesMap = {};
        await Promise.all(
          products.map((product) =>
            axios
              .get(`http://localhost:8080/api/images/${product._id}`)
              .then((imagesResponse) => {
                if (imagesResponse.data?.data?.mainImageUrl) {
                  imagesMap[product._id] = imagesResponse.data.data;
                }
              })
              .catch(() => {})
          )
        );

        setProductImages(imagesMap);
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user, navigate]);

  // Remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    const wishlistKey = `wishlist_${user.id}`;
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
    const updatedWishlist = savedWishlist.filter((id) => id !== productId);
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));

    setWishlistProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  return (
    <>
      <Breadcrumb name="Danh sách yêu thích" />
      <div className="container">
        <div className="wishlist-page">
          <h1 className="wishlist-title">
            <PiHeartBold /> Sản phẩm yêu thích ({wishlistProducts.length})
          </h1>

          {wishlistProducts.length === 0 ? (
            <div className="wishlist-empty">
              <div className="empty-icon">
                <PiHeartBold />
              </div>
              <p className="empty-text">Chưa có sản phẩm yêu thích</p>
              <Link to={ROUTERS.USER.PRODUCTS} className="btn-browse">
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlistProducts.map((product) => (
                <div key={product._id} className="wishlist-item">
                  {/* Product Image */}
                  <div className="item-image">
                    <Link
                      to={`/products/chi-tiet/${product._id}`}
                      className="image-link"
                    >
                      <img
                        src={
                          productImages[product._id]?.mainImageUrl ||
                          require("../images/hero/sp1.jpg")
                        }
                        alt={product.name}
                        className="product-img"
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="item-info">
                    <div>
                      <Link
                        to={`/products/chi-tiet/${product._id}`}
                        className="product-name-link"
                      >
                        <h3 className="product-name">{product.name}</h3>
                      </Link>

                      <div className="product-location">
                        <FiMapPin />
                        <span className="location">
                          {product.address
                            ? product.address.split(",").pop().trim()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <h4 className="product-price">{formater(product.price)}</h4>
                  </div>

                  {/* Product Price & Actions */}
                  <div className="item-actions">
                    <div className="action-buttons">
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="btn-remove"
                        title="Xóa khỏi yêu thích"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default memo(WishlistPage);
