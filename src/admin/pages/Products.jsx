// src/admin/pages/Products.jsx
import { FaTrash, FaEye, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [productImages, setProductImages] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/categories");
      console.log("Categories response:", response.data);

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        setCategories(response.data.data);
        console.log("Categories set:", response.data.data);
      } else {
        console.error("Invalid categories response:", response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // Set empty array on error
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/products");

      // Handle both response formats
      const productData = response.data?.data || response.data || [];

      // Ensure it's always an array
      const productsArray = Array.isArray(productData) ? productData : [];

      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Lỗi khi tải danh sách sản phẩm");
      // Set empty arrays on error to prevent .map() error
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:8080/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove product from state
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        // Remove images from state
        setProductImages((prev) => {
          const newImages = { ...prev };
          delete newImages[productId];
          return newImages;
        });

        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        alert("Lỗi khi xóa sản phẩm: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(
        "Lỗi khi xóa sản phẩm: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setDeleting(false);
    }
  };

  // Confirm delete
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Filter and search functions
  const filterProducts = () => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category && product.category._id === selectedCategory
      );
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.createdAt);

        switch (dateFilter) {
          case "today":
            return productDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return productDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return productDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle date filter change
  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setDateFilter("all");
    setFilteredProducts(products);
  };

  // View product details and fetch images
  const viewProductDetails = async (product) => {
    try {
      console.log("=== Opening product details ===");
      console.log("Product:", product.name, "ID:", product._id);

      setSelectedProduct(product);
      setShowDetailModal(true);

      // Fetch images for this product if not already loaded
      if (!productImages[product._id]) {
        console.log("Fetching images for product:", product._id);
        await fetchProductImages(product._id);
      } else {
        console.log("Images already loaded for product:", product._id);
      }
    } catch (error) {
      console.error("Error opening product details:", error);
    }
  };

  // Fetch product images
  const fetchProductImages = async (productId) => {
    try {
      console.log("=== Fetching images for product ===");
      console.log("Product ID:", productId);

      const response = await axios.get(
        `http://localhost:8080/api/images/${productId}`
      );
      console.log("=== Images API Response ===");
      console.log("Status:", response.status);
      console.log("Success:", response.data.success);
      console.log("Full response:", response.data);

      if (response.data.success && response.data.data) {
        const imageData = response.data.data;
        console.log("=== Image Data Details ===");
        console.log("Main image URL:", imageData.mainImageUrl);
        console.log("Additional image URLs:", imageData.additionalImageUrls);
        console.log("Main image file ID:", imageData.mainImageFileId);
        console.log("Additional file IDs:", imageData.additionalImageFileIds);

        setProductImages((prev) => ({
          ...prev,
          [productId]: imageData,
        }));

        console.log("Images set in state for product:", productId);
      } else {
        console.log("No images found for product:", productId);
        setProductImages((prev) => ({
          ...prev,
          [productId]: {
            mainImageUrl: null,
            additionalImageUrls: [],
            mainImageFileId: null,
            additionalImageFileIds: [],
          },
        }));
      }
    } catch (error) {
      console.error("=== Error fetching images ===");
      console.error("Product ID:", productId);
      console.error("Error:", error);
      console.error("Response data:", error.response?.data);

      setProductImages((prev) => ({
        ...prev,
        [productId]: null,
      }));
    }
  };

  // Format price to Vietnamese currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, dateFilter, products]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <>
      <div className="content-header">
        <h1>Quản lý sản phẩm</h1>
        <div className="header-stats">
          <span className="stat-item">
            Tổng số sản phẩm: <strong>{products.length}</strong>
          </span>
          <span className="stat-item">
            Đang hiển thị: <strong>{filteredProducts.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={handleCategoryFilter}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>

          <select
            value={dateFilter}
            onChange={handleDateFilter}
            className="filter-select"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Danh sách sản phẩm</h3>
          <button className="btn-refresh" onClick={fetchProducts}>
            🔄 Làm mới
          </button>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Địa chỉ</th>
                <th>Chủ sở hữu</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    {products.length === 0
                      ? "Không có sản phẩm nào"
                      : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc"}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td className="product-name">
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <p className="product-desc">
                          {product.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {product.category?.name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="price">{formatPrice(product.price)}</td>
                    <td>{product.address}</td>
                    <td>
                      <span className="owner-badge">
                        {product.IdOnwer?.username || "N/A"}
                      </span>
                    </td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="btn-action btn-view"
                        onClick={() => viewProductDetails(product)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        title="Xóa"
                        onClick={() => confirmDelete(product)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết sản phẩm</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="product-detail">
                <div className="product-images">
                  <h3>Hình ảnh sản phẩm</h3>
                  {console.log(
                    "=== Rendering images for product ===",
                    selectedProduct._id
                  )}
                  {console.log("Product images state:", productImages)}
                  {console.log(
                    "Images for this product:",
                    productImages[selectedProduct._id]
                  )}

                  <div className="image-gallery">
                    {productImages[selectedProduct._id] ? (
                      <>
                        {console.log("Images found, rendering...")}
                        {productImages[selectedProduct._id].mainImageUrl && (
                          <div className="main-image">
                            {console.log(
                              "Rendering main image:",
                              productImages[selectedProduct._id].mainImageUrl
                            )}
                            <img
                              src={
                                productImages[selectedProduct._id].mainImageUrl
                              }
                              alt="Ảnh chính"
                              className="product-image"
                              onError={(e) => {
                                console.error(
                                  "Image load error:",
                                  e.target.src
                                );
                                e.target.style.display = "none";
                              }}
                              onLoad={() => {
                                console.log(
                                  "Image loaded successfully:",
                                  productImages[selectedProduct._id]
                                    .mainImageUrl
                                );
                              }}
                            />
                            <span className="image-label">Ảnh chính</span>
                          </div>
                        )}
                        {productImages[
                          selectedProduct._id
                        ].additionalImageUrls?.map((url, index) => (
                          <div key={index} className="additional-image">
                            {console.log(
                              `Rendering additional image ${index + 1}:`,
                              url
                            )}
                            <img
                              src={url}
                              alt={`Ảnh phụ ${index + 1}`}
                              className="product-image"
                              onError={(e) => {
                                console.error(
                                  "Additional image load error:",
                                  e.target.src
                                );
                                e.target.style.display = "none";
                              }}
                              onLoad={() => {
                                console.log(
                                  "Additional image loaded successfully:",
                                  url
                                );
                              }}
                            />
                            <span className="image-label">
                              Ảnh phụ {index + 1}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="no-images">
                        {console.log("No images found, showing placeholder")}
                        <p>Không có hình ảnh</p>
                        <button
                          className="btn-fetch-images"
                          onClick={() =>
                            fetchProductImages(selectedProduct._id)
                          }
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "10px",
                          }}
                        >
                          Thử tải lại ảnh
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-info-detail">
                  <div className="info-row">
                    <strong>ID:</strong> <span>{selectedProduct._id}</span>
                  </div>
                  <div className="info-row">
                    <strong>Tên sản phẩm:</strong>{" "}
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="info-row">
                    <strong>Mô tả:</strong>
                    <div className="description">
                      {selectedProduct.description}
                    </div>
                  </div>
                  <div className="info-row">
                    <strong>Danh mục:</strong>
                    <span className="category-badge">
                      {selectedProduct.category?.name || "Chưa phân loại"}
                    </span>
                  </div>
                  <div className="info-row">
                    <strong>Giá:</strong>
                    <span className="price-large">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  <div className="info-row">
                    <strong>Số lượng:</strong>{" "}
                    <span>{selectedProduct.quantity || 0}</span>
                  </div>
                  <div className="info-row">
                    <strong>Địa chỉ:</strong>{" "}
                    <span>{selectedProduct.address}</span>
                  </div>
                  <div className="info-row">
                    <strong>Chủ sở hữu:</strong>{" "}
                    <span>{selectedProduct.IdOnwer?.username || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <strong>Email chủ sở hữu:</strong>{" "}
                    <span>{selectedProduct.IdOnwer?.email || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <strong>Số điện thoại:</strong>{" "}
                    <span>{selectedProduct.IdOnwer?.numberPhone || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <strong>Ngày tạo:</strong>{" "}
                    <span>{formatDate(selectedProduct.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button className="btn-primary">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div
          className="modal-overlay"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Xác nhận xóa sản phẩm</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <h3>Bạn có chắc chắn muốn xóa sản phẩm này?</h3>
                  <p>
                    <strong>Tên sản phẩm:</strong> {productToDelete.name}
                  </p>
                  <p>
                    <strong>Giá:</strong> {formatPrice(productToDelete.price)}
                  </p>
                  <div className="warning-note">
                    <strong>Lưu ý:</strong> Hành động này sẽ xóa vĩnh viễn sản
                    phẩm và tất cả hình ảnh liên quan. Không thể hoàn tác!
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                className="btn-danger"
                onClick={() => deleteProduct(productToDelete._id)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner"></span>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa sản phẩm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
