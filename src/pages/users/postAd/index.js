import React, { useState, useEffect } from "react";
import axios from "axios";
import { useEditProduct } from "../../../context/EditProductContext";
import "./style.scss";

const PostAdPage = () => {
  const { startEditing, stopEditing } = useEditProduct();

  // Vietnam provinces and cities - same as SellersPage
  const locations = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Cần Thơ",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP. Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    condition: "new",
    location: "",
    contactName: "",
    contactPhone: "",
    coverImage: null,
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    province: "",
    district: "",
    ward: "",
    specificAddress: "",
  });

  useEffect(() => {
    // DEBUG: Log immediately on mount
    console.log("🚀 PostAdPage useEffect mounted");

    fetchCategories();

    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      console.log("📝 Editing product:", editId);
      loadProductForEditing(editId);
    } else {
      // Check for pending payment completion
      const orderId = urlParams.get("orderId");
      const resultCode = urlParams.get("resultCode");

      console.log("=== Payment Redirect Check ===");
      console.log("Full URL:", window.location.href);
      console.log("URL Search Params:", window.location.search);
      console.log("Extracted orderId:", orderId);
      console.log("Result Code:", resultCode);

      if (orderId && resultCode === "0") {
        // Payment completed successfully (resultCode=0 means success)
        console.log("✅ Payment successful! Processing...");
        handlePaymentSuccess(orderId);

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else if (orderId) {
        console.log(
          "⚠️ Payment redirected but resultCode is not 0, actual resultCode:",
          resultCode
        );
      } else {
        console.log("ℹ️ No payment data found in URL");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProductForEditing = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/products/${productId}`
      );
      const product = response.data?.data || response.data;

      console.log("=== Loading Product for Edit ===");
      console.log("Full product response:", response.data);
      console.log("Product data:", product);
      console.log("Product contactName:", product?.contactName);
      console.log("Product contactPhone:", product?.contactPhone);

      setEditingProductId(productId);
      startEditing(productId); // Set editing status in context

      const formDataToSet = {
        title: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        category: product.category?._id || product.category || "",
        condition: product.condition || "new",
        location: product.address || "",
        contactName: product.contactName || "",
        contactPhone: product.contactPhone || "",
        coverImage: null,
        images: [],
      };

      console.log("Form data to set:", formDataToSet);
      setFormData(formDataToSet);

      // Load existing images
      try {
        const imagesResponse = await axios.get(
          `http://localhost:8080/api/images/${productId}`
        );
        const imagesData = imagesResponse.data?.data;

        console.log("=== Images Data from API ===");
        console.log("Full images response:", imagesData);

        if (imagesData) {
          // Handle main image
          if (imagesData.mainImageUrl) {
            setCoverImagePreview(imagesData.mainImageUrl);
            console.log("✅ Set main image:", imagesData.mainImageUrl);
          }

          // Handle additional images
          if (
            imagesData.additionalImageUrls &&
            Array.isArray(imagesData.additionalImageUrls)
          ) {
            const urlsToShow = imagesData.additionalImageUrls.filter(
              (url) => url
            ); // Filter out null/empty
            if (urlsToShow.length > 0) {
              setImagePreview(urlsToShow);
              console.log("✅ Set additional images:", urlsToShow);
            }
          }

          setExistingImages(imagesData);
        }
      } catch (err) {
        console.log("⚠️ No images found or error loading images:", err);
      }
    } catch (error) {
      console.error("Error loading product for editing:", error);
      alert("Lỗi tải sản phẩm để chỉnh sửa");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/categories");
      const data = response?.data?.data || response?.data || [];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      console.log("=== handlePaymentSuccess called ===");
      console.log("orderId:", orderId);

      // Step 1: Confirm payment completion to backend
      console.log("Step 1: Confirming payment with backend...");
      try {
        const token = localStorage.getItem("token");

        const confirmResponse = await axios.post(
          "http://localhost:8080/api/payment/confirm",
          { orderId, resultCode: "0" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("✅ Payment confirmed:", confirmResponse.data);
      } catch (confirmError) {
        console.error("❌ Failed to confirm payment:", confirmError.message);
        alert(
          "Có lỗi xác nhận thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ."
        );
        return;
      }

      // Step 2: Create product with images
      console.log("Step 2: Creating product after payment confirmation...");
      const savedData = JSON.parse(localStorage.getItem("pendingPostAd"));
      console.log("Saved data:", savedData);

      if (savedData && savedData.orderId === orderId) {
        console.log("✅ Order IDs match - proceeding with product creation...");
        await createProductAfterPayment(orderId);
      } else {
        console.log("❌ Order ID mismatch or no saved data");
        console.log("Expected orderId:", orderId);
        console.log("Saved orderId:", savedData?.orderId);
        alert("Có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng liên hệ hỗ trợ.");
      }
    } catch (error) {
      console.error("Error handling payment success:", error);
      alert("Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate price and quantity
    if (name === "price" || name === "quantity") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        return;
      }

      const numValue = Number(value);
      if (numValue <= 0) {
        return; // Don't update if value is <= 0
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + formData.images.length > 3) {
      alert("Bạn chỉ có thể tải lên tối đa 3 hình ảnh phụ");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
    }));
    setCoverImagePreview(null);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Address modal functions
  const openAddressModal = () => {
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
  };

  const saveAddress = () => {
    const { province, district, ward, specificAddress } = addressDetails;

    if (!province || !district || !ward || !specificAddress) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    const fullAddress = `${specificAddress}, ${ward}, ${district}, ${province}`;
    setFormData((prev) => ({
      ...prev,
      location: fullAddress,
    }));

    setShowAddressModal(false);
  };

  const clearAddress = () => {
    setAddressDetails({
      province: "",
      district: "",
      ward: "",
      specificAddress: "",
    });
    setFormData((prev) => ({
      ...prev,
      location: "",
    }));
  };

  // Main submit function with payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.quantity ||
      !formData.category
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const priceValue = parseInt(formData.price, 10);
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    const quantityValue = parseInt(formData.quantity, 10);
    if (isNaN(quantityValue) || quantityValue < 1) {
      alert("Vui lòng nhập số lượng hợp lệ (tối thiểu 1)");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      if (editingProductId) {
        // Update existing product
        console.log("📝 Updating product:", editingProductId);

        const updateData = {
          name: formData.title,
          description: formData.description,
          price: priceValue,
          quantity: quantityValue,
          category: formData.category,
          address: formData.location || "Cần Thơ",
          condition: formData.condition,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
        };

        await axios.patch(
          `http://localhost:8080/api/products/${editingProductId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Upload images (backend will keep existing images if no new ones provided)
        console.log("📸 Processing images...");
        const imageData = new FormData();

        if (formData.coverImage) {
          imageData.append("mainImage", formData.coverImage);
          console.log("Added main image:", formData.coverImage.name);
        }

        if (formData.images.length > 0) {
          formData.images.forEach((image) => {
            imageData.append("additionalImages", image);
            console.log("Added additional image:", image.name);
          });
        }

        try {
          const uploadResponse = await axios.post(
            `http://localhost:8080/api/images/${editingProductId}/upload`,
            imageData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("✅ Images processed successfully:", uploadResponse.data);
        } catch (imgErr) {
          console.error("❌ Failed to process images:", imgErr);
          alert("Cảnh báo: Sản phẩm đã cập nhật nhưng có lỗi khi xử lý ảnh.");
        }

        alert("Cập nhật sản phẩm thành công!");
        setEditingProductId(null);
        stopEditing(); // Clear editing status in context
        window.history.back();
      } else {
        // Create new product - show payment confirmation
        const confirmed = window.confirm(
          "Để đăng tin, bạn cần thanh toán phí đăng tin qua MoMo. Bạn có muốn tiếp tục không?"
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        // Convert files to base64 for localStorage storage
        const convertFilesToBase64 = async (files) => {
          const results = [];
          for (const file of files) {
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
            results.push({
              base64,
              name: file.name,
              type: file.type,
              size: file.size,
            });
          }
          return results;
        };

        // Prepare form data with base64 images
        let formDataForStorage = { ...formData };

        if (formData.coverImage) {
          console.log("Converting cover image to base64...");
          const base64Images = await convertFilesToBase64([
            formData.coverImage,
          ]);
          formDataForStorage.coverImageBase64 = base64Images[0];
          delete formDataForStorage.coverImage; // Remove File object
        }

        if (formData.images && formData.images.length > 0) {
          console.log("Converting additional images to base64...");
          const base64Images = await convertFilesToBase64(formData.images);
          formDataForStorage.imagesBase64 = base64Images;
          delete formDataForStorage.images; // Remove File objects
        }

        // Create payment
        console.log("Creating payment...");

        const paymentResponse = await axios.post(
          "http://localhost:8080/api/payment/create",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!paymentResponse.data.success) {
          throw new Error(paymentResponse.data.message);
        }

        const { orderId, paymentUrl } = paymentResponse.data.data;
        console.log("Payment created:", orderId);

        // Save form data with base64 images temporarily
        const tempData = {
          formData: formDataForStorage,
          orderId,
          timestamp: Date.now(),
        };
        localStorage.setItem("pendingPostAd", JSON.stringify(tempData));

        // Redirect to MoMo payment
        alert(
          "Bạn sẽ được chuyển đến trang thanh toán MoMo. Sau khi thanh toán thành công, tin đăng sẽ được tạo tự động."
        );

        // Redirect to payment page
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        alert(`Lỗi: ${error.response.data.message || "Có lỗi xảy ra"}`);
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create product after successful payment - VERSION 3
  // Force webpack rebuild: 2025-11-23 23:45 Image upload debugging
  // Ensure new code is loaded and browser cache cleared
  const createProductAfterPayment = async (orderId) => {
    try {
      const savedData = JSON.parse(localStorage.getItem("pendingPostAd"));

      if (!savedData || savedData.orderId !== orderId) {
        throw new Error("Không tìm thấy dữ liệu đăng tin");
      }

      const { formData: savedFormData } = savedData;

      console.log("=== PAYMENT CALLBACK DEBUG ===");
      console.log("Saved form data from localStorage:", savedFormData);
      console.log("Location value:", savedFormData.location);
      console.log(
        "Cover image base64 exists:",
        !!savedFormData.coverImageBase64
      );
      console.log(
        "Additional images base64 exists:",
        !!savedFormData.imagesBase64
      );
      console.log(
        "Additional images count:",
        savedFormData.imagesBase64?.length || 0
      );

      if (savedFormData.coverImageBase64) {
        console.log("Cover image details:", {
          name: savedFormData.coverImageBase64.name,
          type: savedFormData.coverImageBase64.type,
          base64Length: savedFormData.coverImageBase64.base64?.length || 0,
        });
      }

      if (savedFormData.imagesBase64?.length > 0) {
        savedFormData.imagesBase64.forEach((img, index) => {
          console.log(`Additional image ${index + 1}:`, {
            name: img.name,
            type: img.type,
            base64Length: img.base64?.length || 0,
          });
        });
      }

      // Create the product
      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id;

      const productData = {
        name: savedFormData.title,
        description: savedFormData.description,
        price: parseInt(savedFormData.price, 10),
        quantity: parseInt(savedFormData.quantity, 10),
        category: savedFormData.category,
        address: savedFormData.location || "Cần Thơ", // Default address nếu rỗng
        IdOnwer: userId,
      };

      console.log("Creating product with data:", productData);

      // Get token from localStorage
      const token = localStorage.getItem("token");

      const productResponse = await axios.post(
        "http://localhost:8080/api/products",
        productData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const productId = productResponse.data.productId;
      console.log("Product created with ID:", productId);

      // Debug: Check what's in savedFormData
      console.log("=== savedFormData Debug ===");
      console.log("coverImageBase64 exists:", !!savedFormData.coverImageBase64);
      console.log("imagesBase64 exists:", !!savedFormData.imagesBase64);
      console.log(
        "imagesBase64 length:",
        savedFormData.imagesBase64?.length || 0
      );
      console.log("Full savedFormData keys:", Object.keys(savedFormData));

      // Convert base64 back to File objects for upload
      const base64ToFile = (base64Data, filename, mimeType) => {
        console.log("Converting base64 to file:", {
          filename,
          mimeType,
          base64Length: base64Data.length,
          base64Prefix: base64Data.substring(0, 30),
        });

        // Check if base64Data includes the data URI prefix (data:image/...;base64,)
        let base64String = base64Data;
        if (base64Data.includes(",")) {
          base64String = base64Data.split(",")[1];
        }

        console.log("Extracted base64 length:", base64String.length);

        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new File([byteArray], filename, { type: mimeType });
        console.log("File created:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        return file;
      };

      // Check if we should upload images
      const shouldUpload =
        savedFormData.coverImageBase64 ||
        (savedFormData.imagesBase64 && savedFormData.imagesBase64.length > 0);
      console.log("Should upload images:", shouldUpload);

      // Upload images if any
      if (shouldUpload) {
        console.log("=== Starting Image Upload Process ===");
        const imageData = new FormData();

        if (savedFormData.coverImageBase64) {
          console.log("Converting cover image from base64...");
          try {
            const coverImageFile = base64ToFile(
              savedFormData.coverImageBase64.base64,
              savedFormData.coverImageBase64.name,
              savedFormData.coverImageBase64.type
            );
            imageData.append("mainImage", coverImageFile);
            console.log("Main image appended to FormData");
          } catch (coverError) {
            console.error("Error converting cover image:", coverError);
          }
        }

        if (
          savedFormData.imagesBase64 &&
          savedFormData.imagesBase64.length > 0
        ) {
          console.log("Converting additional images from base64...");
          try {
            savedFormData.imagesBase64.forEach((imageBase64, index) => {
              console.log(
                `Processing additional image ${index + 1}:`,
                imageBase64.name
              );
              const imageFile = base64ToFile(
                imageBase64.base64,
                imageBase64.name,
                imageBase64.type
              );
              imageData.append("additionalImages", imageFile);
            });
            console.log(
              `${savedFormData.imagesBase64.length} additional images appended to FormData`
            );
          } catch (additionalError) {
            console.error(
              "Error converting additional images:",
              additionalError
            );
          }
        }

        // Log FormData contents
        console.log("=== FormData Contents ===");
        for (let pair of imageData.entries()) {
          console.log(
            pair[0] +
              ": " +
              (pair[1] instanceof File
                ? `File: ${pair[1].name}, Size: ${pair[1].size}`
                : pair[1])
          );
        }

        console.log(
          "Uploading images to:",
          `http://localhost:8080/api/images/${productId}/upload`
        );

        try {
          const token = localStorage.getItem("token");

          const uploadResponse = await axios.post(
            `http://localhost:8080/api/images/${productId}/upload`,
            imageData,
            {
              timeout: 30000,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("=== Upload Response ===");
          console.log("Status:", uploadResponse.status);
          console.log("Success:", uploadResponse.data.success);
          console.log("Message:", uploadResponse.data.message);
          console.log("Data:", uploadResponse.data.data);

          console.log("Images uploaded successfully");
        } catch (uploadError) {
          console.error("=== Image Upload Error ===");
          console.error("Error:", uploadError);
          console.error("Response data:", uploadError.response?.data);
          console.error(
            "Request headers:",
            uploadError.response?.config?.headers
          );
          // Don't throw - let product creation continue even if image upload fails
        }
      } else {
        console.log("No images to upload - checking savedFormData:", {
          coverImageBase64: !!savedFormData.coverImageBase64,
          imagesBase64: savedFormData.imagesBase64?.length || 0,
          allKeys: Object.keys(savedFormData),
        });
      }

      // Try to link product to payment (optional - don't fail if this fails)
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          "http://localhost:8080/api/payment/link-product",
          {
            orderId,
            productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Product linked to payment successfully");
      } catch (linkError) {
        console.warn(
          "Failed to link product to payment (non-critical):",
          linkError.response?.data?.message || linkError.message
        );
        // Continue execution - this is not critical for the user experience
      }

      // Clear temporary data
      localStorage.removeItem("pendingPostAd");

      alert("Thanh toán thành công! Tin đăng của bạn đã được tạo.");

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        condition: "new",
        location: "",
        contactName: "",
        contactPhone: "",
        coverImage: null,
        images: [],
      });
      setImagePreview([]);
      setCoverImagePreview(null);
    } catch (error) {
      console.error("Error creating product after payment:", error);
      alert(
        "Thanh toán thành công nhưng có lỗi khi tạo tin đăng. Vui lòng liên hệ hỗ trợ."
      );
    }
  };

  return (
    <div className="post-ad-page">
      <div className="container">
        <div className="post-ad-header">
          <h1>
            {editingProductId ? "Chỉnh sửa sản phẩm" : "Đăng tin miễn phí"}
          </h1>
          <p>
            {editingProductId
              ? "Cập nhật thông tin sản phẩm"
              : "Tăng cơ hội bán hàng với việc đăng tin hiệu quả"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="post-ad-form">
          <div className="form-section">
            <h2>Ảnh bìa sản phẩm</h2>
            <div className="cover-image-section">
              <input
                type="file"
                id="cover-image-upload"
                accept="image/*"
                onChange={handleCoverImageUpload}
                style={{ display: "none" }}
              />

              {!coverImagePreview ? (
                <label
                  htmlFor="cover-image-upload"
                  className="cover-upload-label"
                >
                  <i className="fas fa-image"></i>
                  <span>Thêm ảnh bìa</span>
                  <small>Ảnh đại diện cho sản phẩm</small>
                </label>
              ) : (
                <div className="cover-image-preview">
                  <img src={coverImagePreview} alt="Cover Preview" />
                  <button
                    type="button"
                    className="remove-cover-image"
                    onClick={removeCoverImage}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="cover-overlay">
                    <label
                      htmlFor="cover-image-upload"
                      className="change-cover-btn"
                    >
                      <i className="fas fa-camera"></i>
                      Thay đổi
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Hình ảnh sản phẩm</h2>
            <div className="image-upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <i className="fas fa-camera"></i>
                  <span>Thêm ảnh</span>
                  <small>Tối đa 3 ảnh phụ</small>
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Thông tin chi tiết</h2>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="title">Tiêu đề tin đăng *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Điện thoại iPhone 13 mới 99%"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Danh mục *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="price">Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) <= 0) {
                      setFormData((prev) => ({
                        ...prev,
                        price: "",
                      }));
                    }
                  }}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Số lượng *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (!e.target.value || Number(e.target.value) <= 0) {
                      setFormData((prev) => ({
                        ...prev,
                        quantity: "",
                      }));
                    }
                  }}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Mô tả chi tiết *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  rows="5"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="condition">Tình trạng</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  <option value="new">Mới</option>
                  <option value="like-new">Như mới</option>
                  <option value="used">Đã sử dụng</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">Địa chỉ</label>
                <div className="location-input">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ..."
                    onClick={openAddressModal}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={clearAddress}
                    className="clear-address"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName">Tên liên hệ</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Tên người liên hệ"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">Số điện thoại</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại liên hệ"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            {/* <button type="button" className="btn-preview">
              Xem trước
            </button> */}
            <button type="submit" className="btn-submit" disabled={loading}>
              {editingProductId
                ? loading
                  ? "Đang cập nhật..."
                  : "Cập nhật sản phẩm"
                : loading
                ? "Đang xử lý..."
                : "Đăng tin"}
            </button>
          </div>
        </form>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="address-modal-overlay" onClick={closeAddressModal}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Địa chỉ</h3>
              <button className="modal-close" onClick={closeAddressModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="address-form">
                <div className="form-group">
                  <label>Tỉnh, thành phố *</label>
                  <select
                    className="address-field"
                    value={addressDetails.province}
                    onChange={(e) =>
                      setAddressDetails({
                        ...addressDetails,
                        province: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn tỉnh, thành phố --</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận, huyện, thị xã *</label>
                  <input
                    type="text"
                    className="address-field"
                    value={addressDetails.district}
                    onChange={(e) =>
                      setAddressDetails({
                        ...addressDetails,
                        district: e.target.value,
                      })
                    }
                    placeholder="Quận Ba Đình"
                  />
                </div>

                <div className="form-group">
                  <label>Phường, xã, thị trấn *</label>
                  <input
                    type="text"
                    className="address-field"
                    value={addressDetails.ward}
                    onChange={(e) =>
                      setAddressDetails({
                        ...addressDetails,
                        ward: e.target.value,
                      })
                    }
                    placeholder="Phường Cống Vị"
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ cụ thể *</label>
                  <input
                    type="text"
                    className="address-field"
                    value={addressDetails.specificAddress}
                    onChange={(e) =>
                      setAddressDetails({
                        ...addressDetails,
                        specificAddress: e.target.value,
                      })
                    }
                    placeholder="123 Đường ABC"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeAddressModal}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={saveAddress}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAdPage;
