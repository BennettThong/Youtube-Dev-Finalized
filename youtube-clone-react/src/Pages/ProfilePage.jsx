import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL; // ✅ dynamic backend URL

export default function ProfilePage() {
  const [authToken, setAuthToken] = useLocalStorage("authToken", "");
  const navigate = useNavigate();
  const [image, setImage] = useState(
    "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!authToken) navigate("/login");

    const storedUrl = localStorage.getItem("profileImage");
    if (storedUrl) {
      setImage(storedUrl);
    }
  }, [authToken, navigate]);

  const handleLogout = () => {
    setAuthToken("");
    localStorage.removeItem("profileImage");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await axios.post(`${apiUrl}/upload-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data && res.data.imageUrl) {
        setImage(res.data.imageUrl);
        localStorage.setItem("profileImage", res.data.imageUrl);
        setPreviewImage(null);
        setSelectedFile(null);
        alert("✅ Profile picture updated!");
      } else {
        throw new Error("No imageUrl returned from backend.");
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Image upload failed. Please try again.");
    }
  };

  return (
    <>
      <Container>
        <Row>
          <button onClick={handleLogout} className="btn btn-danger mt-3">
            Logout
          </button>
        </Row>
      </Container>

      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>My Profile</h2>

        <div style={{ marginBottom: "20px" }}>
          <img
            src={previewImage || image}
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";
            }}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd"
            }}
          />
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ marginBottom: "10px" }}
        />

        {previewImage && (
          <div>
            <button
              onClick={handleConfirmUpload}
              className="btn btn-primary"
              style={{ marginTop: "10px" }}
              disabled={!selectedFile}
            >
              Confirm Upload
            </button>
          </div>
        )}
      </div>

      <section
        className="w-100 px-4 py-5"
        style={{
          backgroundColor: "#9de2ff",
          borderRadius: ".5rem .5rem 0 0"
        }}
      >
        <div className="row d-flex justify-content-center">
          <div className="col col-md-9 col-lg-7 col-xl-6">
            <div className="card" style={{ borderRadius: "15px" }}>
              <div className="card-body p-4">
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <img
                      src={previewImage || image}
                      alt="Uploaded"
                      className="img-fluid"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";
                      }}
                      style={{ width: "180px", borderRadius: "10px" }}
                    />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="mb-1">Bennett Thong</h5>
                    <p className="mb-2 pb-1">Full Stack Developer</p>
                    <div className="d-flex justify-content-start rounded-3 p-2 mb-2 bg-body-tertiary">
                      <div>
                        <p className="small text-muted mb-1">Articles</p>
                        <p className="mb-0">41</p>
                      </div>
                      <div className="px-3">
                        <p className="small text-muted mb-1">Followers</p>
                        <p className="mb-0">976</p>
                      </div>
                      <div>
                        <p className="small text-muted mb-1">Rating</p>
                        <p className="mb-0">8.5</p>
                      </div>
                    </div>
                    <div className="d-flex pt-1">
                      <button className="btn btn-outline-primary me-1 flex-grow-1">
                        Chat
                      </button>
                      <button className="btn btn-primary flex-grow-1">
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
