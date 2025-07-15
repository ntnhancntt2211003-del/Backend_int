import { memo, useEffect, useRef } from "react";
import "./style.scss";
import ReactPlayer from "react-player";
import { GrFormPrevious } from "react-icons/gr";
import { MdNavigateNext } from "react-icons/md";
import hero1 from "../images/hero/hero1.jpg";
import hero2 from "../images/hero/hero2.jpg";
import hero3 from "../images/hero/hero3.jpg";
import hero4 from "../images/hero/hero4.jpg";
import hero5 from "../images/hero/hero5.jpg";
import hero6 from "../images/hero/hero6.jpg";
import sp1 from "../images/hero/sp1.jpg";
import sp2 from "../images/hero/sp2.jpg";
import sp3 from "../images/hero/sp3.jpg";
import sp4 from "../images/hero/sp4.jpg";
import sp5 from "../images/hero/sp5.jpg";
import video from "../images/hero/video.mp4";
import { Button } from "antd";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import VanillaTilt from "vanilla-tilt"; // Dùng để tạo hiệu ứng 3D nâng cao
import Typed from "typed.js";

const HomePage = () => {
  // Refs để truy cập DOM
  const carouselRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Hàm xử lý khi nhấn nút Next
  const handleNextClick = () => {
    const slide = document.getElementById("slide");
    const lists = document.querySelectorAll(".item");
    if (slide && lists.length > 0) {
      slide.prepend(lists[lists.length - 1]);
    }
  };

  // Hàm xử lý khi nhấn nút Prev
  const handlePrevClick = () => {
    const slide = document.getElementById("slide");
    const lists = document.querySelectorAll(".item");
    if (slide && lists.length > 0) {
      slide.appendChild(lists[0]);
    }
  };

  // Tự động chuyển slide
  useEffect(() => {
    const interval = setInterval(() => {
      handlePrevClick();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer
  const observerRef = useRef(null);
  useEffect(() => {
    console.log("Setting up Intersection Observer");
    const setupObserver = () => {
      const items = document.querySelectorAll(".showContainer");
      console.log("Found items:", items.length); // Debug số lượng phần tử

      if (items.length > 0) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              console.log("Intersecting:", entry.target); // Debug
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observerRef.current.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );

        items.forEach((item) => observerRef.current.observe(item));
      } else {
        console.warn("No .showContainer elements found initially");
      }
    };

    // Chờ Carousel render xong
    const timer = setTimeout(() => {
      setupObserver();
    }, 500); // Delay 500ms để đảm bảo DOM sẵn sàng

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(timer);
    };
  }, []);

  // Khởi tạo VanillaTilt cho ảnh
  useEffect(() => {
    if (typeof VanillaTilt === "undefined") {
      console.error("VanillaTilt is not loaded.");
      return;
    }

    const images = document.querySelectorAll(".categories__slider__item img");
    if (images.length > 0) {
      images.forEach((img) => {
        VanillaTilt.init(img, {
          max: 20, // Góc tilt lớn hơn để nổi bật
          speed: 400,
          glare: true, // Thêm hiệu ứng ánh sáng
          "max-glare": 0.4,
          perspective: 1000,
          scale: 1.05, // Nổi lên nhẹ khi hover
        });
      });
    } else {
      console.warn("No images found in .categories__slider__item.");
    }

    return () => {
      images.forEach((img) => {
        if (img.vanillaTilt) img.vanillaTilt.destroy();
      });
    };
  }, []);

  // Khởi tạo Typed.js
  useEffect(() => {
    const options = {
      strings: [
        "PASSIONATE SNEAKER CULTURE ADVOCATE AND COLLECTOR",
        "DEDICATED FOOTWEAR FASHION SELLER AND TRENDSETTER",
        "CREATIVE TRENDSETTING STYLE CURATOR FOR UNIQUE DESIGNS",
        "PREMIUM SHOE RETAILER SPECIALIZING IN EXCLUSIVE RELEASES",
        "URBAN FASHION DEALER CRAFTING THE ULTIMATE SNEAKER EXPERIENCE",
      ],
      typeSpeed: 50, // Giảm tốc độ gõ để mượt hơn
      backSpeed: 30, // Giảm tốc độ xóa để tránh giật
      startDelay: 500, // Đợi 500ms trước khi bắt đầu
      loop: true,
      showCursor: true,
      cursorChar: "|",
    };

    const typed = new Typed(".type", options);

    return () => {
      typed.destroy();
    };
  }, []);

  // Cấu hình responsive cho carousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3,
      partialVisibilityGutter: 0,
    },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2, slidesToSlide: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1, slidesToSlide: 1 },
  };

  return (
    <>
      <div className="container__slide">
        <div className="sile" id="slide">
          <div
            className="item"
            style={{ backgroundImage: `url(${hero1})` }}
            id="baner"
          >
            <div className="content">
              <div className="name">lifestyle</div>
              <div className="des">ed dfg dfg</div>
              <Button>see more</Button>
            </div>
          </div>
          <div
            className="item"
            id="baner"
            style={{ backgroundImage: `url(${hero2})` }}
          >
            <div className="content">
              <div className="name">football</div>
              <div className="des">ed dfg dfg</div>
              <button>see more</button>
            </div>
          </div>
          <div
            className="item"
            id="baner"
            style={{ backgroundImage: `url(${hero3})` }}
          >
            <div className="content">
              <div className="name">jordan</div>
              <div className="des">ed dfg dfg</div>
              <button>see more</button>
            </div>
          </div>
          <div
            className="item"
            id="baner"
            style={{ backgroundImage: `url(${hero4})` }}
          >
            <div className="content">
              <div className="name">running</div>
              <div className="des">ed dfg dfg</div>
              <button>see more</button>
            </div>
          </div>
          <div
            className="item"
            id="baner"
            style={{ backgroundImage: `url(${hero5})` }}
          >
            <div className="content">
              <div className="name">running</div>
              <div className="des">ed dfg dfg</div>
              <button>see more</button>
            </div>
          </div>
          <div
            className="item"
            id="baner"
            style={{ backgroundImage: `url(${hero6})` }}
          >
            <div className="content">
              <div className="name">running</div>
              <div className="des">ed dfg dfg</div>
              <Button>see more</Button>
            </div>
          </div>
          <div className="buttons">
            <button className="prev" id="prev" onClick={handlePrevClick}>
              <GrFormPrevious />
            </button>
            <button className="next" id="next" onClick={handleNextClick}>
              <MdNavigateNext />
            </button>
          </div>
        </div>
      </div>
      <div className="full-width-container">
        <div
          className="container container__categories__slider"
          ref={carouselRef}
        >
          <h2 className="text-xl font-bold">NEW SP</h2>
          <Carousel responsive={responsive} className="categories__slider">
            <div className="categories__slider__item showContainer">
              <img src={sp1} alt="Product 1" className="hover-image" />
              <p className="item-description">yyyyyyyy</p>
            </div>
            <div className="categories__slider__item showContainer">
              <img src={sp2} alt="Product 2" className="hover-image" />
              <p className="item-description">Jordan Spizike Low</p>
            </div>
            <div className="categories__slider__item showContainer">
              <img src={sp3} alt="Product 3" className="hover-image" />
              <p className="item-description">yyyyyyyyyy</p>
            </div>
            <div className="categories__slider__item showContainer">
              <img src={sp4} alt="Product 4" className="hover-image" />
              <p className="item-description">yyyyyyyyyy</p>
            </div>
            <div className="categories__slider__item showContainer">
              <img src={sp5} alt="Product 5" className="hover-image" />
              <p className="item-description">uuyyyyyyyy</p>
            </div>
          </Carousel>
        </div>
      </div>
      <div className="container__video showContainer" ref={videoContainerRef}>
        <div className="left-div showContainer" style={{ minHeight: "250px" }}>
          <h1 style={{ position: "relative", minHeight: "3.5em" }}>
            I'M A {/* Di chuyển lên trên */}
            <br /> {/* Thêm xuống dòng để tách biệt */}
            <span className="type"></span> {/* Chữ chạy bên dưới */}
          </h1>
        </div>
        <div className="right-div showContainer">
          <video
            className="responsive-video"
            width="100%"
            height="100%"
            autoPlay // Tự động phát
            loop // Lặp lại
            muted // Tắt tiếng để autoPlay hoạt động trên mọi trình duyệt
            playsInline
            controls
          >
            <source src={video} type="video/mp4" />
          </video>
        </div>
      </div>
    </>
  );
};

export default memo(HomePage);
