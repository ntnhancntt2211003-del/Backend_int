import { useNavigate } from "react-router-dom";
import { useEditProduct } from "../context/EditProductContext";

export const usePostAdNavigation = () => {
  const navigate = useNavigate();
  const { isEditing } = useEditProduct();

  const navigateToPostAd = () => {
    if (isEditing) {
      alert(
        "❌ Bạn đang trong quá trình chỉnh sửa sản phẩm!\n\nVui lòng cập nhật xong sản phẩm trước khi đăng sản phẩm mới."
      );
      return false;
    }
    navigate("/users/post-ad");
    return true;
  };

  return { navigateToPostAd, isEditing };
};
