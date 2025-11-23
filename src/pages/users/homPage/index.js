import { memo, useEffect, useRef, useState } from "react";
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
import CurvedLoop from "./CurvedLoop";
import { Button } from "antd";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import VanillaTilt from "vanilla-tilt";
import Typed from "typed.js";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three"; // added

function Model({
  desiredSize = 2,
  extraScale = 1,
  position = [0, 0, 0],
  rotation = [0, Math.PI / 2, 0], // góc đích (radian)
  appearDuration = 1.0, // thời gian (giây) animation xoay
  popDuration = 0.35, // thời gian (giây) hiệu ứng phóng to/thu nhỏ (pop)
  startOffset = [0, Math.PI / 2, 0], // OFFSET khởi tạo (mặc định: đối diện trên Y)
}) {
  const { scene } = useGLTF("/scene.gltf");
  const group = useRef();

  // lưu target scale và start scale để animation nhất quán
  const targetScaleRef = useRef(1);
  const startScaleRef = useRef(1);

  useEffect(() => {
    if (!scene || !group.current) return;
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetUniform = (desiredSize / maxDim) * extraScale;
    targetScaleRef.current = targetUniform;

    // KHỞI TẠO: để "lúc đầu to thêm xíu" đặt startScale > target (ví dụ 1.15x)
    const startScale = targetUniform * 1.15; // tăng 15% khi mới xuất hiện
    startScaleRef.current = startScale;
    group.current.scale.set(startScale, startScale, startScale);

    // đặt vị trí (centered) theo target scale (dùng target để vị trí ổn định)
    group.current.position.set(
      -center.x * targetUniform + (position[0] ?? 0),
      -center.y * targetUniform + (position[1] ?? 0),
      -center.z * targetUniform + (position[2] ?? 0)
    );

    group.current.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, desiredSize, extraScale, position]);

  // animation xoay từ startRotation (rotation + startOffset) -> rotation (target)
  const rotTarget = useRef(new THREE.Euler(...rotation));
  const startRot = useRef(
    new THREE.Euler(
      rotation[0] + (startOffset[0] || 0),
      rotation[1] + (startOffset[1] || 0),
      rotation[2] + (startOffset[2] || 0)
    )
  );
  const elapsedRef = useRef(0);

  useEffect(() => {
    // cập nhật target và start khi props rotation hoặc startOffset thay đổi
    rotTarget.current.set(...rotation);
    startRot.current.set(
      rotation[0] + (startOffset[0] || 0),
      rotation[1] + (startOffset[1] || 0),
      rotation[2] + (startOffset[2] || 0)
    );
    elapsedRef.current = 0;
    if (group.current) {
      // đặt rotation ban đầu = startRot (ví dụ: đối diện nếu startOffset.y = Math.PI)
      group.current.rotation.set(
        startRot.current.x,
        startRot.current.y,
        startRot.current.z
      );
    }
  }, [rotation, startOffset]);

  useFrame((state, delta) => {
    if (!group.current) return;
    elapsedRef.current += delta;

    // xoay mượt từ start -> target
    const tRotate = Math.min(
      1,
      elapsedRef.current / Math.max(0.001, appearDuration)
    );
    const smoothR = tRotate * tRotate * (3 - 2 * tRotate);

    const tx = THREE.MathUtils.lerp(
      startRot.current.x,
      rotTarget.current.x,
      smoothR
    );
    const ty = THREE.MathUtils.lerp(
      startRot.current.y,
      rotTarget.current.y,
      smoothR
    );
    const tz = THREE.MathUtils.lerp(
      startRot.current.z,
      rotTarget.current.z,
      smoothR
    );
    group.current.rotation.set(tx, ty, tz);

    // scale animation: từ startScaleRef -> targetScaleRef (ease out)
    const tScaleRaw = Math.min(
      1,
      elapsedRef.current / Math.max(0.001, popDuration)
    );
    const smoothS = 1 - Math.pow(1 - tScaleRaw, 3); // ease out
    const target = targetScaleRef.current || 1;
    const startS = startScaleRef.current || target;
    const currentS = THREE.MathUtils.lerp(startS, target, smoothS);
    group.current.scale.set(currentS, currentS, currentS);
  });

  return (
    <group ref={group}>{scene ? <primitive object={scene} /> : null}</group>
  );
}

const HomePage = () => {
  // Refs để truy cập DOM
  const carouselRef = useRef(null);
  const videoContainerRef = useRef(null);

  // model control states
  const [modelSize, setModelSize] = useState(2); // desiredSize
  const [modelExtraScale, setModelExtraScale] = useState(1); // fine tune
  const [modelY, setModelY] = useState(-0.6); // vertical position adjust
  const [modelRotY, setModelRotY] = useState(Math.PI / 2);

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
      const items = document.querySelectorAll(".showContainer, .show");
      console.log("Found items:", items.length); // Debug số lượng phần tử

      if (items.length > 0) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              console.log("Intersecting:", entry.target); // Debug
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                entry.target.classList.add("show");
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

    // Thêm delay để đảm bảo DOM được render hoàn thành
    const initTilt = () => {
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
        // Retry sau 100ms nếu chưa tìm thấy images
        setTimeout(initTilt, 100);
      }
    };

    // Delay ngắn để đợi DOM render
    const timer = setTimeout(initTilt, 50);

    return () => {
      clearTimeout(timer);
      const images = document.querySelectorAll(".categories__slider__item img");
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
      <div className="container__video" ref={videoContainerRef}>
        <div className="left-div showContainer" style={{ minHeight: "250px" }}>
          <h1 style={{ position: "relative", minHeight: "3.5em" }}>
            I'M A {/* Di chuyển lên trên */}
            <br /> {/* Thêm xuống dòng để tách biệt */}
            <span className="type"></span> {/* Chữ chạy bên dưới */}
          </h1>
        </div>
        <div className="right-div ">
          <video
            className="responsive-video show showcontainer"
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

      <div className="container__3d">
        <div className="container__3d__item">
          <div className="container__text">
            <CurvedLoop marqueeText="Step Into Style With Shoes ✦" />
          </div>
          <div className="container__3d__left">
            <div className="grid-3d">
              <div className="grid-item big">
                <img
                  src={require("../images/hero/shoes_running.jpg")}
                  alt="item1"
                />
              </div>
              <div className="grid-item small">
                <img
                  src={require("../images/hero/shoes_women.jpg")}
                  alt="item2"
                />
              </div>
              <div className="grid-item small">
                <img
                  src={require("../images/hero/shoes_men.jpg")}
                  alt="item3"
                />
              </div>
            </div>
          </div>
          <div className="container__3d__right">
            <Canvas
              className="canvas"
              camera={{ position: [0, 0, 5], fov: 50 }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              {/* Phóng to model: tăng desiredSize hoặc extraScale */}
              <Model
                desiredSize={3}
                extraScale={1.6}
                // position={[0, 0, 0]}
                position={[0, modelY, 0]}
                rotation={[0, 0, 0]}
                startOffset={[0, Math.PI / 4, 0]}
              />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                enableDamping={true}
                dampingFactor={0.08}
                zoomSpeed={0.8}
                minDistance={1.5}
                maxDistance={18}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(HomePage);
