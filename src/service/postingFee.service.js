import PostingFee from "../models/postingFee.js";

export const getPostingFee = async () => {
  try {
    let fee = await PostingFee.findOne({ isActive: true });

    // Nếu chưa có fee nào, tạo mặc định
    if (!fee) {
      fee = new PostingFee({
        name: "Phí đăng tin",
        amount: 10000,
        description: "Phí đăng tin sản phẩm",
      });
      await fee.save();
    }

    return fee;
  } catch (error) {
    throw new Error("Error fetching posting fee: " + error.message);
  }
};

export const updatePostingFee = async (amount, description = null) => {
  try {
    let fee = await PostingFee.findOne({ isActive: true });

    if (!fee) {
      fee = new PostingFee({
        name: "Phí đăng tin",
        amount: amount,
        description: description || "Phí đăng tin sản phẩm",
      });
    } else {
      fee.amount = amount;
      if (description) {
        fee.description = description;
      }
      fee.updatedAt = new Date();
    }

    await fee.save();
    return fee;
  } catch (error) {
    throw new Error("Error updating posting fee: " + error.message);
  }
};

export const createPostingFee = async (feeData) => {
  try {
    // Deactivate old fees
    await PostingFee.updateMany({}, { isActive: false });

    // Create new active fee
    const fee = new PostingFee({
      ...feeData,
      isActive: true,
    });

    await fee.save();
    return fee;
  } catch (error) {
    throw new Error("Error creating posting fee: " + error.message);
  }
};
