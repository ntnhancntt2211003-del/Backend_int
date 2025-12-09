import { memo, useEffect, useState } from "react";
import { FiMapPin, FiStar, FiMessageCircle } from "react-icons/fi";
import { PiHeartBold, PiHeartFill } from "react-icons/pi";
import Breadcrumb from "../theme/breadcrumb";

import { Link, useParams, useNavigate } from "react-router-dom";
import BackToTopButton from "component/ProductCard/BackToTopButton";
import "./style.scss";
import { formater } from "utils/formater";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [productImages, setProductImages] = useState([]);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    reason: "",
    description: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({}); // Track expanded replies
  const [replyingToReply, setReplyingToReply] = useState(null); // Track nested reply form
  const [nestedReplyContent, setNestedReplyContent] = useState({}); // Store nested reply content
  const [similarProducts, setSimilarProducts] = useState([]);

  // Refresh comments from backend
  const refreshComments = async () => {
    try {
      const commentsResponse = await axios.get(
        `http://localhost:8080/api/comments?productId=${id}`
      );
      if (commentsResponse.data?.success) {
        setComments(commentsResponse.data.data);
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Reset states
        setLoading(true);
        setProduct(null);
        setProductImages([]);
        setComments([]);
        setSimilarProducts([]);
        setActiveTab("details");
        setMainImageIndex(0);

        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );
        setProduct(response.data.data);

        // Fetch images for the product
        const imagesResponse = await axios.get(
          `http://localhost:8080/api/images/${id}`
        );
        console.log("Images response:", imagesResponse.data);
        if (imagesResponse.data?.data) {
          setProductImages(imagesResponse.data.data);
        }

        // Fetch comments
        const commentsResponse = await axios.get(
          `http://localhost:8080/api/comments?productId=${id}`
        );
        if (commentsResponse.data?.success) {
          setComments(commentsResponse.data.data);
        }

        // Fetch similar products by category
        if (response.data.data.category) {
          const similarResponse = await axios.get(
            `http://localhost:8080/api/products?category=${
              response.data.data.category._id || response.data.data.category
            }`
          );
          // Filter out current product and hidden products
          let similar = similarResponse.data.data
            .filter((p) => p._id !== id && !p.isHidden && p.status !== "sold")
            .slice(0, 10); // Limit to 10 products

          // Fetch images for each similar product
          const similarWithImages = await Promise.all(
            similar.map(async (p) => {
              try {
                const imgRes = await axios.get(
                  `http://localhost:8080/api/images/${p._id}`
                );
                return {
                  ...p,
                  mainImage: imgRes.data?.data?.mainImageUrl || null,
                };
              } catch (err) {
                return { ...p, mainImage: null };
              }
            })
          );
          setSimilarProducts(similarWithImages);
        }

        // Load wishlist from localStorage
        if (user && user.id) {
          const wishlistKey = `wishlist_${user.id}`;
          const savedWishlist = JSON.parse(
            localStorage.getItem(wishlistKey) || "[]"
          );
          setIsLiked(savedWishlist.includes(id));
        }

        // Scroll to top
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user]);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;
  }

  // Toggle like product
  const handleToggleLike = () => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để yêu thích sản phẩm");
      return;
    }

    const wishlistKey = `wishlist_${user.id}`;
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    if (isLiked) {
      // Remove from wishlist
      const updatedWishlist = savedWishlist.filter(
        (productId) => productId !== id
      );
      localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    } else {
      // Add to wishlist
      if (!savedWishlist.includes(id)) {
        savedWishlist.push(id);
        localStorage.setItem(wishlistKey, JSON.stringify(savedWishlist));
      }
    }

    setIsLiked(!isLiked);
  };

  const owner = product.IdOnwer || {};

  // Format phone number to hide middle digits
  const maskPhone = (phone) => {
    if (!phone) return "***";
    return phone.slice(0, 4) + " " + "*".repeat(4) + " " + phone.slice(-3);
  };

  // Copy phone to clipboard
  const copyPhoneToClipboard = () => {
    if (product.contactPhone) {
      navigator.clipboard.writeText(product.contactPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Handle report form change
  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit report
  const handleSubmitReport = async () => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để báo cáo bài đăng");
      return;
    }

    if (!reportFormData.reason || !reportFormData.description.trim()) {
      alert("Vui lòng chọn lý do và nhập mô tả");
      return;
    }

    setSubmittingReport(true);
    try {
      await axios.post(
        `http://localhost:8080/api/reports`,
        {
          productId: id,
          userId: user.id,
          reason: reportFormData.reason,
          description: reportFormData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Báo cáo đã được gửi. Cảm ơn bạn đã giúp cải thiện nền tảng!");
      setReportFormData({ reason: "", description: "" });
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(
        "Lỗi khi gửi báo cáo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!newComment.trim()) {
      alert("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/comments`,
        {
          productId: id,
          content: newComment,
          rating: newCommentRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setNewComment("");
        setNewCommentRating(5);
        // Refresh comments from backend to show new comment
        await refreshComments();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(
        "Lỗi khi gửi bình luận: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Handle reply to comment
  const handleSubmitReply = async (parentCommentId) => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để trả lời");
      return;
    }

    if (!replyContent.trim()) {
      alert("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/comments`,
        {
          productId: id,
          content: replyContent,
          parentCommentId: parentCommentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setReplyingTo(null);
        setReplyContent("");
        // Refresh comments from backend to show new reply
        await refreshComments();
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert(
        "Lỗi khi gửi trả lời: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Handle nested reply (reply to reply)
  const handleNestedReply = async (parentCommentId, replyId) => {
    if (!user || !user.id) {
      alert("Vui lòng đăng nhập để trả lời");
      return;
    }

    const content = nestedReplyContent[replyId];
    if (!content || !content.trim()) {
      alert("Vui lòng nhập nội dung trả lời");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/comments`,
        {
          productId: id,
          content: content,
          parentCommentId: parentCommentId,
          parentReplyId: replyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setReplyingToReply(null);
        setNestedReplyContent({
          ...nestedReplyContent,
          [replyId]: "",
        });
        // Refresh comments from backend to show new nested reply
        await refreshComments();
      }
    } catch (error) {
      console.error("Error submitting nested reply:", error);
      alert(
        "Lỗi khi gửi trả lời: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Helper function to organize flat comments into tree structure
  const organizeFlatComments = (flatComments) => {
    // Get only main comments (no parent)
    const mainComments = flatComments.filter(
      (c) => !c.parentCommentId && !c.parentReplyId
    );

    // Organize each main comment with its replies
    return mainComments.map((mainComment) => ({
      ...mainComment,
      replies: flatComments
        .filter(
          (c) => c.parentCommentId === mainComment._id && !c.parentReplyId
        )
        .map((reply) => ({
          ...reply,
          nestedReplies: flatComments.filter(
            (c) => c.parentReplyId === reply._id
          ),
        })),
    }));
  };

  // Reorganize comments when they change
  const organizedComments = organizeFlatComments(comments);

  // Get image URLs for display
  const mainImage =
    productImages?.mainImageUrl || require("../images/hero/sp1.jpg");
  return (
    <>
      <Breadcrumb name="Chi Tiết sản phẩm" />
      <div className="container">
        <div className="row">
          <div className="col-lg-5 product-detail__pic">
            <img
              src={
                mainImageIndex === 0
                  ? productImages?.mainImageUrl || mainImage
                  : productImages?.additionalImageUrls?.[mainImageIndex - 1] ||
                    mainImage
              }
              alt="product-pic"
              className="cursor-pointer hover:opacity-90 transition"
              onClick={() => setShowLightbox(true)}
            />
            <div className="main">
              {/* Main Image */}
              <img
                src={productImages?.mainImageUrl || mainImage}
                alt="product-pic"
                onClick={() => setMainImageIndex(0)}
                className="cursor-pointer hover:opacity-70 transition"
                style={{ opacity: mainImageIndex === 0 ? 1 : 0.6 }}
              />
              {/* Additional Images */}
              {productImages?.additionalImageUrls &&
              productImages.additionalImageUrls.length > 0 ? (
                productImages.additionalImageUrls.map((imgUrl, key) => (
                  <img
                    src={imgUrl}
                    alt="product-pic"
                    key={key}
                    onClick={() => setMainImageIndex(key + 1)}
                    className="cursor-pointer hover:opacity-70 transition"
                    style={{ opacity: mainImageIndex === key + 1 ? 1 : 0.6 }}
                  />
                ))
              ) : (
                <img
                  src={mainImage}
                  alt="product-pic"
                  onClick={() => setMainImageIndex(0)}
                  className="cursor-pointer hover:opacity-70 transition"
                  style={{ opacity: mainImageIndex === 0 ? 1 : 0.6 }}
                />
              )}
            </div>
          </div>
          <div className="col-lg-7 product-detail__text">
            <div className="product-detail__header">
              <h2 className="product-title">{product.name}</h2>
              <div
                className="product-actions"
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <button
                  onClick={handleToggleLike}
                  className={`btn-like ${isLiked ? "liked" : ""}`}
                  title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  {isLiked ? <PiHeartFill /> : <PiHeartBold />}
                </button>
                {/* <button
                  onClick={() => setShowReportModal(true)}
                  className="btn-report"
                  title="Báo cáo bài đăng"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.1)",
                    backgroundColor: "rgb(255 255 255 / 50%)",
                    cursor: "pointer",
                    fontSize: "22px",
                    color: "#666",
                    transition: "all 0.3s ease",
                    padding: "0",
                    minWidth: "44px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff3cd";
                    e.currentTarget.style.color = "#d0021b";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgb(255 255 255 / 50%)";
                    e.currentTarget.style.color = "#666";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <TbMessageReportFilled /> */}
                {/* </button> */}
              </div>
            </div>

            <p className="product-condition">Cũ like new</p>

            <h3 className="product-price">{formater(product.price)}</h3>

            <div className="product-quantity mt-2 mb-3">
              <p className="text-sm text-gray-700">
                <strong>Số lượng:</strong>{" "}
                <span className="text-lg font-semibold text-blue-600">
                  {product.quantity || 0}
                </span>{" "}
                sản phẩm
              </p>
            </div>

            <div className="product-address">
              <FiMapPin className="icon" />
              <span>{product.address}</span>
            </div>

            <div className="product-phone-contact mt-3">
              <p className="text-sm text-gray-700">
                <strong>Phone:</strong>{" "}
                <span
                  className="font-bold cursor-pointer text-blue-600 hover:text-blue-800 transition"
                  onClick={() => setShowFullPhone(!showFullPhone)}
                >
                  {showFullPhone ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold">
                        {product.contactPhone || "Chưa cập nhật"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPhoneToClipboard();
                        }}
                        className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                      >
                        {copiedPhone ? "✓ Đã sao chép" : "Sao chép"}
                      </button>
                    </span>
                  ) : (
                    maskPhone(product.contactPhone)
                  )}
                </span>
                {!showFullPhone && (
                  <span className="text-gray-500 text-xs ml-1">
                    (hiện khi liên hệ)
                  </span>
                )}
              </p>
            </div>

            {/* === THÔNG TIN NGƯỜI BÁN === */}
            <div className="seller-profile mt-5 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
                    {owner.avatar ? (
                      <img
                        src={owner.avatar}
                        alt={owner.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            owner.username?.charAt(0).toUpperCase() || "U";
                        }}
                      />
                    ) : (
                      owner.username?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>

                  {/* Tên + trạng thái */}
                  <div>
                    <h4 className="font-semibold text-lg">{owner.username}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Hoạt động
                    </p>
                  </div>
                </div>
                {/* Lượt bán + đánh giá */}
                <div className="text-right text-sm">
                  <p className="font-medium">-</p>
                  <p className="text-gray-500">Đã bán</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-yellow-500">
                    <FiStar className="text-xs" /> 0 đánh giá
                  </p>
                </div>
              </div>

              {/* Nút Xem trang và Chat */}
              <div className="mt-3 text-right flex gap-2 justify-end">
                <button
                  onClick={async () => {
                    if (!user) {
                      navigate("/login");
                    } else if (user.id === owner._id) {
                      alert("Không thể nhắn tin cho chính mình");
                    } else {
                      // Navigate to messages with the seller's ID
                      navigate(`/users/messages?chat=${owner._id || owner.id}`);
                    }
                  }}
                  className="btn-chat text-sm bg-yellow-400 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 transition inline-flex items-center gap-2"
                  title="Nhắn tin cho người bán"
                >
                  <FiMessageCircle size={16} />
                  Chat
                </button>
                <Link
                  to={`/users/profile/${owner._id || owner.id}`}
                  className="btn-view-shop text-sm border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition inline-block"
                >
                  Xem trang
                </Link>
              </div>
            </div>

            {/* Số điện thoại (ẩn một phần) */}
            {/* <p className="mt-3 text-sm text-gray-600">
              Phone: <strong>{maskPhone(owner.numberPhone)}</strong> (hiện khi
              liên hệ)
            </p> */}
          </div>
        </div>
        <div className="product-detail__tab mt-8">
          {/* Tab Header */}
          <div className="tab-header border-b">
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Thông tin chi tiết
            </button>
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
            <button
              className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
              onClick={() => setActiveTab("report")}
            >
              Báo cáo bài đăng
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content p-4">
            {activeTab === "details" ? (
              <div className="details-content">
                <div className="detail-item">
                  <span className="detail-key">Tiêu đề:</span>
                  <span className="detail-value">{product.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Giá:</span>
                  <span className="detail-value">
                    {formater(product.price)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Danh mục:</span>
                  <span className="detail-value">
                    {product.category?.name || "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-key">Địa chỉ:</span>
                  <span className="detail-value">{product.address}</span>
                </div>
              </div>
            ) : activeTab === "description" ? (
              <div className="description-content">
                <p className="whitespace-pre-line text-gray-700 leading-6">
                  {product.description}
                </p>
              </div>
            ) : activeTab === "report" ? (
              <div className="report-content max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Báo cáo bài đăng</h3>
                <p className="text-gray-600 mb-6">
                  Nếu bạn cho rằng bài đăng này vi phạm chính sách hoặc chứa nội
                  dung không phù hợp, vui lòng báo cáo cho chúng tôi.
                </p>

                <div className="form-group mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do báo cáo *
                  </label>
                  <select
                    name="reason"
                    value={reportFormData.reason}
                    onChange={handleReportChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn lý do --</option>
                    <option value="fake_product">Sản phẩm giả mạo</option>
                    <option value="scam">Lừa đảo/Mạo danh</option>
                    <option value="inappropriate_content">
                      Nội dung không phù hợp
                    </option>
                    <option value="spam">Spam/Quảng cáo lộn xộn</option>
                    <option value="illegal_item">Sản phẩm bị cấm</option>
                    <option value="offensive_language">Ngôn từ x冒phạm</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="form-group mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết *
                  </label>
                  <textarea
                    name="description"
                    value={reportFormData.description}
                    onChange={handleReportChange}
                    placeholder="Vui lòng mô tả lý do báo cáo chi tiết..."
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitReport}
                    disabled={submittingReport}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-medium"
                  >
                    {submittingReport ? "Đang gửi..." : "Gửi báo cáo"}
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* === COMMENTS SECTION (OUTSIDE TABS) === */}
        <div className="comments-section mt-12 max-w-4xl">
          <h3 className="text-2xl font-semibold mb-8">
            Bình luận ({comments.length})
          </h3>

          {/* Add Comment Form */}
          {user && user.id ? (
            <div className="add-comment mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewCommentRating(star)}
                      className={`text-3xl transition ${
                        star <= newCommentRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  rows="6"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base"
                />
              </div>

              <button
                onClick={handleSubmitComment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Gửi bình luận
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <Link
                  to="/auth/login"
                  className="text-blue-600 hover:underline"
                >
                  Đăng nhập
                </Link>{" "}
                để bình luận
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </p>
            ) : (
              organizeFlatComments(comments).map((comment) => (
                <div
                  key={comment._id}
                  className="mb-6 pb-6 border-b border-gray-200"
                >
                  {/* MAIN COMMENT */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {comment.userId?.username || "Ẩn danh"}
                          </h4>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${
                                  star <= comment.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <small className="text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </small>
                      </div>

                      <p className="text-gray-700 mb-3">{comment.content}</p>

                      {user && user.id && (
                        <button
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment._id ? null : comment._id
                            )
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Trả lời
                        </button>
                      )}

                      {/* Main Reply Form */}
                      {replyingTo === comment._id && user && user.id && (
                        <div className="mt-4 ml-4 p-3 bg-gray-100 rounded-lg">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết trả lời..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitReply(comment._id)}
                              className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Gửi
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                              className="text-sm px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DIRECT REPLIES & NESTED REPLIES */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 ml-4">
                          {!expandedReplies[comment._id] ? (
                            <button
                              onClick={() =>
                                setExpandedReplies({
                                  ...expandedReplies,
                                  [comment._id]: true,
                                })
                              }
                              className="text-sm text-blue-600 hover:underline font-medium"
                            >
                              Xem {comment.replies.length} trả lời
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  setExpandedReplies({
                                    ...expandedReplies,
                                    [comment._id]: false,
                                  })
                                }
                                className="text-sm text-blue-600 hover:underline font-medium mb-4"
                              >
                                Ẩn trả lời
                              </button>
                              <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id}>
                                    {/* Direct Reply */}
                                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-semibold text-sm">
                                          {reply.userId?.username || "Ẩn danh"}
                                        </h5>
                                        <small className="text-gray-500 text-xs">
                                          {new Date(
                                            reply.createdAt
                                          ).toLocaleDateString("vi-VN")}
                                        </small>
                                      </div>
                                      <p className="text-gray-700 text-sm mb-2">
                                        {reply.content}
                                      </p>
                                      {user && user.id && (
                                        <button
                                          onClick={() =>
                                            setReplyingToReply(
                                              replyingToReply === reply._id
                                                ? null
                                                : reply._id
                                            )
                                          }
                                          className="text-xs text-blue-600 hover:underline"
                                        >
                                          Trả lời
                                        </button>
                                      )}
                                    </div>

                                    {/* Nested Reply Form */}
                                    {replyingToReply === reply._id &&
                                      user &&
                                      user.id && (
                                        <div className="ml-4 p-3 bg-blue-50 rounded-lg mb-3">
                                          <textarea
                                            value={
                                              nestedReplyContent[reply._id] ||
                                              ""
                                            }
                                            onChange={(e) =>
                                              setNestedReplyContent({
                                                ...nestedReplyContent,
                                                [reply._id]: e.target.value,
                                              })
                                            }
                                            placeholder="Viết trả lời lồng..."
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2 text-sm"
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() =>
                                                handleNestedReply(
                                                  comment._id,
                                                  reply._id
                                                )
                                              }
                                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                            >
                                              Gửi
                                            </button>
                                            <button
                                              onClick={() => {
                                                setReplyingToReply(null);
                                                setNestedReplyContent({
                                                  ...nestedReplyContent,
                                                  [reply._id]: "",
                                                });
                                              }}
                                              className="text-xs px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                                            >
                                              Hủy
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                    {/* Nested Replies */}
                                    {reply.nestedReplies &&
                                      reply.nestedReplies.length > 0 && (
                                        <div className="ml-4 space-y-2 border-l-2 border-blue-200 pl-3">
                                          {reply.nestedReplies.map(
                                            (nestedReply) => (
                                              <div
                                                key={nestedReply._id}
                                                className="bg-blue-50 p-2 rounded text-sm"
                                              >
                                                <div className="flex justify-between items-start mb-1">
                                                  <h6 className="font-semibold text-xs">
                                                    {nestedReply.userId
                                                      ?.username || "Ẩn danh"}
                                                  </h6>
                                                  <small className="text-gray-500 text-xs">
                                                    {new Date(
                                                      nestedReply.createdAt
                                                    ).toLocaleDateString(
                                                      "vi-VN"
                                                    )}
                                                  </small>
                                                </div>
                                                <p className="text-gray-700">
                                                  {nestedReply.content}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/*=== SẢN PHẨM TƯƠNG TỰ === */}
        <div className="similar-products mt-16">
          <h3 className="text-2xl font-semibold mb-8">Sản phẩm tương tự</h3>
          {similarProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có sản phẩm tương tự nào
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarProducts.map((p) => (
                <Link
                  key={p._id}
                  to={`/products/chi-tiet/${p._id}`}
                  className="product-card rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition group"
                >
                  <div className="relative overflow-hidden bg-gray-100 h-40">
                    <img
                      src={p.mainImage || require("../images/hero/sp1.jpg")}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    {p.status === "sold" && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold">ĐÃ BÁN</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                      {p.name}
                    </h4>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      {formater(p.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      📍 {p.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <BackToTopButton />

      {/* === LIGHTBOX MODAL === */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex flex-col items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition z-10"
          >
            ✕
          </button>

          {/* Main image container */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                mainImageIndex === 0
                  ? productImages?.mainImageUrl || mainImage
                  : productImages?.additionalImageUrls?.[mainImageIndex - 1] ||
                    mainImage
              }
              alt="product-enlarged"
              className="max-w-full max-h-[75vh] object-contain"
            />

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const totalImages =
                  1 + (productImages?.additionalImageUrls?.length || 0);
                setMainImageIndex(
                  mainImageIndex === 0 ? totalImages - 1 : mainImageIndex - 1
                );
              }}
              className="absolute left-4 text-white text-5xl hover:text-gray-400 transition disabled:opacity-50"
            >
              ‹
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const totalImages =
                  1 + (productImages?.additionalImageUrls?.length || 0);
                setMainImageIndex(
                  mainImageIndex === totalImages - 1 ? 0 : mainImageIndex + 1
                );
              }}
              className="absolute right-4 text-white text-5xl hover:text-gray-400 transition disabled:opacity-50"
            >
              ›
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-6 text-white bg-black bg-opacity-60 px-4 py-2 rounded">
              {mainImageIndex + 1} /{" "}
              {1 + (productImages?.additionalImageUrls?.length || 0)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ProductDetailPage);
