import { createContext, useContext, useState, useEffect } from "react";

const EditProductContext = createContext();

export const EditProductProvider = ({ children }) => {
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = (productId) => {
    setEditingProductId(productId);
    setIsEditing(true);
    // Lưu vào sessionStorage để không bị mất khi refresh
    sessionStorage.setItem("editingProductId", productId);
  };

  const stopEditing = () => {
    setEditingProductId(null);
    setIsEditing(false);
    sessionStorage.removeItem("editingProductId");
  };

  // Kiểm tra khi app khởi động
  useEffect(() => {
    const savedEditingId = sessionStorage.getItem("editingProductId");
    if (savedEditingId) {
      setEditingProductId(savedEditingId);
      setIsEditing(true);
    }
  }, []);

  return (
    <EditProductContext.Provider
      value={{
        editingProductId,
        isEditing,
        startEditing,
        stopEditing,
      }}
    >
      {children}
    </EditProductContext.Provider>
  );
};

export const useEditProduct = () => {
  const context = useContext(EditProductContext);
  if (!context) {
    throw new Error("useEditProduct must be used within EditProductProvider");
  }
  return context;
};
