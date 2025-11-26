import { memo, useState, useEffect } from "react";
import Breadcrumb from "../theme/breadcrumb";
import { generatePath, Link } from "react-router-dom";
import "./style.scss";
import { categories } from "../../../constants/categories.js";
import { ROUTERS } from "utils/router";
import BackToTopButton from "../../../component/ProductCard/BackToTopButton.js";
import axios from "axios";
import { formater } from "utils/formater";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import { useAuth } from "../../../context/AuthContext";

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [productImages, setProductImages] = useState({});
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const sorts = [
    { label: "Giá: Thấp đến cao", value: "price_asc" },
    { label: "Giá: Cao đến thấp", value: "price_desc" },
    { label: "Mới nhất", value: "newest" },
    { label: "Cũ nhất", value: "oldest" },
  ];

  // Load wishlist from localStorage
  useEffect(() => {
    if (user && user.id) {
      const wishlistKey = `wishlist_${user.id}`;
      const savedWishlist = JSON.parse(
        localStorage.getItem(wishlistKey) || "[]"
      );
      setWishlist(savedWishlist);
    } else {
      // Clear wishlist when user logs out
      setWishlist([]);
    }
  }, [user, user?.id]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/products");

        // Handle both response formats
        const productsList = response.data?.data || response.data || [];

        // Ensure it's always an array and filter by status (only active products)
        const productsArray = Array.isArray(productsList)
          ? productsList.filter((p) => p.status !== "sold")
          : [];

        console.log("Products fetched:", productsArray);
        setProducts(productsArray);
        setFilteredProducts(productsArray);

        // Extract unique locations (cities) from products
        // Get city name from address (last part after comma)
        const uniqueLocations = [
          ...new Set(
            productsArray
              .map((p) => {
                if (!p.address) return null;
                // Split by comma and get the last part (city)
                const parts = p.address.split(",");
                return parts[parts.length - 1]?.trim() || null;
              })
              .filter((city) => city && city.length > 0)
          ),
        ].sort();
        setLocations(uniqueLocations);

        // Fetch images for each product
        for (const product of productsArray) {
          try {
            const imagesResponse = await axios.get(
              `http://localhost:8080/api/images/${product._id}`
            );
            console.log(
              `Images for product ${product._id}:`,
              imagesResponse.data
            );
            if (imagesResponse.data?.data?.mainImageUrl) {
              setProductImages((prev) => ({
                ...prev,
                [product._id]: imagesResponse.data.data,
              }));
            }
          } catch (error) {
            console.warn(
              `Failed to fetch images for product ${product._id}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Set empty arrays on error
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle wishlist
  const handleToggleLike = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    const wishlistKey = `wishlist_${user.id}`;
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
    const isLiked = savedWishlist.includes(productId);

    let updatedWishlist;
    if (isLiked) {
      updatedWishlist = savedWishlist.filter((id) => id !== productId);
    } else {
      updatedWishlist = [...savedWishlist, productId];
    }

    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?._id === selectedCategory);
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter((p) => {
        if (!p.address) return false;
        const parts = p.address.split(",");
        const city = parts[parts.length - 1]?.trim() || "";
        return city === selectedLocation;
      });
    }

    // Filter by price range
    if (priceFrom) {
      filtered = filtered.filter((p) => p.price >= parseInt(priceFrom));
    }
    if (priceTo) {
      filtered = filtered.filter((p) => p.price <= parseInt(priceTo));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [
    products,
    selectedCategory,
    sortBy,
    priceFrom,
    priceTo,
    searchTerm,
    selectedLocation,
  ]);

  return (
    <>
      <Breadcrumb name="Danh sách sản phẩm" />
      <div className="container">
        <div className="page-content-wrapper">
          <div className="sidebar">
            {/* NÚT XÓA BỘ LỌC - PHÍA TRÊN */}
            {(searchTerm ||
              selectedCategory ||
              selectedLocation ||
              priceFrom ||
              priceTo ||
              sortBy !== "newest") && (
              <div className="sidebar__item">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedLocation("");
                    setPriceFrom("");
                    setPriceTo("");
                    setSortBy("newest");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  ✕ Xóa bộ lọc ({" "}
                  {[
                    searchTerm ? 1 : 0,
                    selectedCategory ? 1 : 0,
                    selectedLocation ? 1 : 0,
                    priceFrom ? 1 : 0,
                    priceTo ? 1 : 0,
                    sortBy !== "newest" ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}{" "}
                  )
                </button>
              </div>
            )}
            <div className="sidebar__item">
              <h2>Tìm kiếm</h2>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>
            <div className="sidebar__item">
              <h2>Địa điểm</h2>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="sidebar__item">
              <div className="price-range-wrap">
                <h2>Khoảng giá</h2>
                <div>
                  <p>Từ</p>
                  <input
                    type="number"
                    min={0}
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <p>Đến</p>
                  <input
                    type="number"
                    min={0}
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    placeholder="100,000,000"
                  />
                </div>
              </div>
            </div>
            <div className="sidebar__item">
              <h2>Sắp Xếp</h2>
              <div className="tags">
                {sorts.map((item) => (
                  <div
                    className={`tag ${sortBy === item.value ? "active" : ""}`}
                    key={item.value}
                    onClick={() => setSortBy(item.value)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar__item">
              <h2>Danh mục</h2>
              <ul>
                <li key="all">
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory("");
                    }}
                    style={{
                      fontWeight: selectedCategory === "" ? "bold" : "normal",
                    }}
                  >
                    Tất cả
                  </Link>
                </li>
                {categories.map((name) => (
                  <li key={name}>
                    <button
                      onClick={() => setSelectedCategory(name)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight:
                          selectedCategory === name ? "bold" : "normal",
                      }}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="products-content">
            {loading ? (
              <div className="text-center py-10">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10">Không tìm thấy sản phẩm</div>
            ) : (
              <div className="row">
                {filteredProducts.map((product) => (
                  <div className="col-lg-4 col-md-6 mb-4" key={product._id}>
                    <Link
                      to={generatePath(ROUTERS.USER.PRODUCT_DETAIL, {
                        id: product._id,
                      })}
                      className="product-card-link"
                    >
                      <div className="product-card">
                        <div className="product-image-wrapper">
                          <img
                            src={
                              productImages[product._id]?.mainImageUrl ||
                              require("../images/hero/sp1.jpg")
                            }
                            alt={product.name}
                            className="product-img"
                          />
                          <button
                            onClick={(e) => handleToggleLike(e, product._id)}
                            className={`btn-like ${
                              wishlist.includes(product._id) ? "liked" : ""
                            }`}
                            title="Thêm vào yêu thích"
                          >
                            {wishlist.includes(product._id) ? (
                              <PiHeartFill />
                            ) : (
                              <PiHeartBold />
                            )}
                          </button>
                        </div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">
                          {formater(product.price)}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BackToTopButton />
    </>
  );
};

export default memo(ProductsPage);
