import React, { useState } from "react";

const Ads = () => {
  const [type, setType] = useState("image");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, build FormData and POST to backend
    const payload = { type, caption };
    alert(`Submit quảng cáo: ${JSON.stringify(payload)}`);
  };

  return (
    <div>
      <div className="content-header">
        <h1>Đăng quảng cáo</h1>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>
              <input
                type="radio"
                name="type"
                value="image"
                checked={type === "image"}
                onChange={() => setType("image")}
              />{" "}
              Image Ad
            </label>
            <label style={{ marginLeft: 12 }}>
              <input
                type="radio"
                name="type"
                value="video"
                checked={type === "video"}
                onChange={() => setType("video")}
              />{" "}
              Caption + Video Ad
            </label>
          </div>

          {type === "image" && (
            <div>
              <label>Ảnh quảng cáo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <div style={{ marginTop: 8 }}>Preview: {imageFile.name}</div>
              )}
            </div>
          )}

          {type === "video" && (
            <div>
              <label>Video (kèm caption)</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <textarea
                placeholder="Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 8 }}
              />
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn-add">
              Gửi quảng cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ads;
