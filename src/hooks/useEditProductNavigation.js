import { useEffect } from "react";
import { useEditProduct } from "../context/EditProductContext";

/**
 * Hook để block navigation khi đang cập nhật sản phẩm
 * Hiển thị thông báo xác nhận khi người dùng cố chuyển sang trang khác
 */
export const useEditProductNavigation = () => {
  const { isEditing, stopEditing } = useEditProduct();

  useEffect(() => {
    // Block page unload (F5, close tab, etc)
    const handleBeforeUnload = (e) => {
      if (isEditing) {
        e.preventDefault();
        e.returnValue =
          "Bạn đang cập nhật sản phẩm. Thay đổi của bạn có thể bị mất. Bạn có chắc chắn muốn rời đi không?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing]);

  // Block link clicks
  useEffect(() => {
    if (!isEditing) return;

    const handleLinkClick = (e) => {
      // Get the link element (might be nested inside)
      const link = e.target.closest("a");
      if (!link) return;

      // Allow internal anchors and hash links
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      // Allow "post-ad" related links (editing page itself)
      if (
        href.includes("/post-ad") ||
        href.includes("/profile") ||
        href.includes("edit=")
      ) {
        return;
      }

      // Block other navigation
      e.preventDefault();
      e.stopPropagation();

      const confirmed = window.confirm(
        "Bạn đang cập nhật sản phẩm.\n\nVui lòng hoàn tất cập nhật sản phẩm của bạn trước khi rời đi.\n\nBạn có chắc chắn muốn hủy bỏ các thay đổi không?"
      );

      if (confirmed) {
        stopEditing();
        // Navigate to the link after clearing editing state
        window.location.href = href;
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [isEditing, stopEditing]);
};
