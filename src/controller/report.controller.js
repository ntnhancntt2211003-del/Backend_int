import Report from "../models/report.js";
import Product from "../models/products.js";

export const CreateReport = async (req, res) => {
  try {
    const { productId, userId, reason, description } = req.body;

    if (!productId || !userId || !reason || !description) {
      return res.status(400).json({ message: "Tất cả các trường là bắt buộc" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Check if user already reported this product
    const existingReport = await Report.findOne({
      productId,
      userId,
      status: { $in: ["pending", "reviewing"] },
    });

    if (existingReport) {
      return res.status(400).json({
        message: "Bạn đã báo cáo sản phẩm này. Vui lòng chờ xử lý.",
      });
    }

    const report = new Report({
      productId,
      userId,
      reason,
      description,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Báo cáo đã được gửi thành công",
      data: report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo báo cáo",
      error: error.message,
    });
  }
};

export const GetReports = async (req, res) => {
  try {
    const { status, productId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (productId) filter.productId = productId;

    const reports = await Report.find(filter)
      .populate("userId", "username email")
      .populate("productId", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách báo cáo",
      error: error.message,
    });
  }
};

export const UpdateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["pending", "reviewing", "resolved", "dismissed"].includes(status)
    ) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Báo cáo không tìm thấy" });
    }

    // Nếu cập nhật thành "resolved", ẩn sản phẩm
    if (status === "resolved") {
      const product = await Product.findByIdAndUpdate(
        report.productId,
        {
          isHidden: true,
          hiddenReason: `Báo cáo vi phạm: ${report.reason}`,
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
      }
    }

    // Nếu cập nhật từ "resolved" sang status khác, hiển thị lại sản phẩm
    if (report.status === "resolved" && status !== "resolved") {
      await Product.findByIdAndUpdate(report.productId, {
        isHidden: false,
        hiddenReason: null,
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái báo cáo thành công",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật báo cáo",
      error: error.message,
    });
  }
};
