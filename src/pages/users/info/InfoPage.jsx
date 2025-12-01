import { useParams } from "react-router-dom";
import "./style.scss";

const infoContent = {
  "tro-giup": {
    title: "Trợ Giúp",
    description: "Các câu hỏi thường gặp và hướng dẫn sử dụng",
    content: [
      {
        heading: "Làm cách nào để tạo tài khoản?",
        text: "Click vào nút 'Đăng ký' ở trang chủ, nhập email, mật khẩu và thông tin cá nhân. Sau đó, xác nhận email của bạn để hoàn tất quá trình đăng ký.",
      },
      {
        heading: "Tôi quên mật khẩu, làm sao?",
        text: "Click 'Quên mật khẩu' ở trang đăng nhập, nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.",
      },
      {
        heading: "Làm cách nào để liên hệ hỗ trợ?",
        text: "Bạn có thể liên hệ qua email: hello@gmail.com hoặc gọi điện: 0706679352 trong giờ làm việc 8:00 - 20:00 hàng ngày.",
      },
      {
        heading: "Chính sách hoàn trả là gì?",
        text: "Chúng tôi chấp nhận hoàn trả trong vòng 30 ngày kể từ ngày mua hàng nếu sản phẩm không được sử dụng và còn nguyên vẹn.",
      },
    ],
  },
  "huong-dan-mua-hang": {
    title: "Hướng Dẫn Mua Hàng",
    description: "Các bước đơn giản để mua sắm tại HKT Market",
    content: [
      {
        heading: "Bước 1: Duyệt sản phẩm",
        text: "Vào danh mục sản phẩm hoặc tìm kiếm sản phẩm bạn muốn. Bạn có thể lọc theo danh mục, giá cả, hoặc đánh giá.",
      },
      {
        heading: "Bước 2: Xem chi tiết sản phẩm",
        text: "Click vào sản phẩm để xem mô tả chi tiết, hình ảnh, giá cả, và đánh giá từ những khách hàng khác.",
      },
      {
        heading: "Bước 3: Thêm vào giỏ hàng",
        text: "Chọn số lượng và click nút 'Thêm vào giỏ hàng'. Bạn có thể tiếp tục mua sắm hoặc đi đến giỏ hàng.",
      },
      {
        heading: "Bước 4: Thanh toán",
        text: "Xem lại đơn hàng, nhập địa chỉ giao hàng, chọn phương thức thanh toán và hoàn tất đơn hàng.",
      },
      {
        heading: "Bước 5: Theo dõi đơn hàng",
        text: "Sau khi đặt hàng, bạn có thể theo dõi tình trạng giao hàng trong mục 'Đơn hàng của tôi'.",
      },
    ],
  },
  "huong-dan-thanh-toan": {
    title: "Hướng Dẫn Thanh Toán",
    description: "Các phương thức thanh toán và hướng dẫn sử dụng",
    content: [
      {
        heading: "Thanh toán khi nhận hàng (COD)",
        text: "Bạn thanh toán trực tiếp cho người giao hàng khi nhận sản phẩm. Đây là phương thức an toàn và không yêu cầu số thẻ ngân hàng.",
      },
      {
        heading: "Thanh toán qua ngân hàng",
        text: "Chuyển khoản trước vào tài khoản ngân hàng của HKT Market. Chúng tôi sẽ xác nhận thanh toán và chuẩn bị giao hàng.",
      },
      {
        heading: "Thanh toán qua ví điện tử",
        text: "HKT Market hỗ trợ thanh toán qua các ví điện tử phổ biến như MoMo, ZaloPay, AirPay.",
      },
      {
        heading: "Thanh toán qua thẻ tín dụng",
        text: "Bạn có thể sử dụng thẻ tín dụng Visa, Mastercard để thanh toán an toàn qua cổng thanh toán bảo mật của chúng tôi.",
      },
      {
        heading: "Chính sách hoàn tiền",
        text: "Nếu hủy đơn hàng, tiền thanh toán sẽ được hoàn lại trong vòng 3-5 ngày làm việc.",
      },
    ],
  },
  "chinh-sach-bao-mat": {
    title: "Chính Sách Bảo Mật",
    description: "Cách chúng tôi bảo vệ thông tin cá nhân của bạn",
    content: [
      {
        heading: "Bảo mật dữ liệu",
        text: "HKT Market sử dụng mã hóa SSL 256-bit để bảo vệ tất cả các giao dịch và thông tin cá nhân của bạn.",
      },
      {
        heading: "Quyền riêng tư",
        text: "Chúng tôi không bao giờ chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý của bạn.",
      },
      {
        heading: "Cookies",
        text: "Website sử dụng cookies để cải thiện trải nghiệm người dùng. Bạn có thể tắt cookies trong cài đặt trình duyệt.",
      },
      {
        heading: "Quản lý tài khoản",
        text: "Bạn có thể xem, chỉnh sửa, hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào trong mục 'Thông tin cá nhân'.",
      },
      {
        heading: "Liên hệ về bảo mật",
        text: "Nếu bạn có lo ngại về bảo mật, vui lòng liên hệ: hello@gmail.com",
      },
    ],
  },
  "gioi-thieu": {
    title: "Giới Thiệu",
    description: "Tìm hiểu về HKT Market",
    content: [
      {
        heading: "Về HKT Market",
        text: "HKT Market là nền tảng thương mại điện tử uy tín, được thành lập với mục tiêu cung cấp các sản phẩm chất lượng cao với giá cả hợp lý.",
      },
      {
        heading: "Sứ mệnh của chúng tôi",
        text: "Kết nối các người bán và người mua, tạo ra một cộng đồng mua sắm an toàn, tiện lợi và đáng tin cậy.",
      },
      {
        heading: "Tầm nhìn",
        text: "Trở thành nền tảng thương mại điện tử hàng đầu ở Việt Nam, nơi mọi người có thể tìm thấy những gì họ muốn với dịch vụ tuyệt vời.",
      },
      {
        heading: "Giá trị cốt lõi",
        text: "Chúng tôi cam kết với sự trung thực, chất lượng, an toàn, và sự hài lòng của khách hàng.",
      },
      {
        heading: "Đội ngũ",
        text: "HKT Market được xây dựng bởi một đội ngũ những chuyên gia trong lĩnh vực thương mại điện tử, công nghệ thông tin và dịch vụ khách hàng.",
      },
    ],
  },
  "tuyen-dung": {
    title: "Tuyển Dụng",
    description: "Cơ hội nghề nghiệp tại HKT Market",
    content: [
      {
        heading: "Tại sao làm việc với HKT Market?",
        text: "Môi trường làm việc năng động, cơ hội học tập và phát triển, lương thưởng cạnh tranh, chế độ phúc lợi tốt.",
      },
      {
        heading: "Các vị trí đang tuyển dụng",
        text: "Chúng tôi luôn tìm kiếm những tài năng để tham gia đội ngũ. Các vị trí bao gồm: Lập trình viên, Thiết kế UX/UI, Chuyên viên Marketing, Nhân viên Hỗ trợ khách hàng.",
      },
      {
        heading: "Yêu cầu ứng viên",
        text: "Có kinh nghiệm liên quan (tuỳ theo vị trí), tinh thần học hỏi, trách nhiệm cao, làm việc tốt trong đội nhóm.",
      },
      {
        heading: "Quy trình tuyển dụng",
        text: "Gửi CV → Phỏng vấn sơ bộ → Phỏng vấn kỹ thuật/chuyên môn → Phỏng vấn cuối cùng → Offer.",
      },
      {
        heading: "Liên hệ",
        text: "Gửi CV của bạn đến: careers@hktmarket.com với tiêu đề email là [Vị trí ứng tuyển] - [Tên của bạn]",
      },
    ],
  },
};

const InfoPage = () => {
  const { page } = useParams();
  const info = infoContent[page];

  if (!info) {
    return (
      <div className="info__page">
        <div className="info__container">
          <h1>Trang không tìm thấy</h1>
          <p>Xin lỗi, trang bạn đang tìm không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="info__page">
      {/* Hero Section */}
      <div className="info__hero">
        <div className="hero__content">
          <h1>{info.title}</h1>
          <p>{info.description}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="info__container">
        <div className="info__content">
          {info.content.map((section, index) => (
            <div key={index} className="info__section">
              <h2>{section.heading}</h2>
              <p>{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
