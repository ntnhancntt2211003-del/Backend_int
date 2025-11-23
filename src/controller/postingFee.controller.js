import {
  getPostingFee,
  updatePostingFee,
  createPostingFee,
} from "../service/postingFee.service.js";

export const GetPostingFee = async (req, res) => {
  try {
    const fee = await getPostingFee();
    return res.status(200).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    console.error("GetPostingFee error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const UpdatePostingFee = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Giá phải là số dương",
      });
    }

    const fee = await updatePostingFee(parseInt(amount), description);

    return res.status(200).json({
      success: true,
      data: fee,
      message: "Cập nhật phí đăng tin thành công",
    });
  } catch (error) {
    console.error("UpdatePostingFee error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
