// src/components/BackToTopButton.jsx
import { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";
import "./BackToTopButton.scss";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi scroll
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Xử lý click
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={`back-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
    >
      <FiArrowUp size={20} />
    </button>
  );
};

export default BackToTopButton;
