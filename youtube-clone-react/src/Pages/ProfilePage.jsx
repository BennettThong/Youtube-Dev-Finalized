import React, { useEffect, useState, useContext } from "react";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Components/AuthProvider";
import { getAuth, signOut, updateProfile } from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const { currentUser, authSource, setProfileImage, resetAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [image, setImage] = useState("https://ui-avatars.com/api/?name=Bennett+Thong");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Hydrate avatar from durable source (Auth.photoURL)
  useEffect(() => {
    if (!currentUser) return;
    const url = currentUser.photoURL || localStorage.getItem("profileImage");
    if (url) {
      setImage(url);
      localStorage.setItem("profileImage", url); // optional cache
    }
  }, [currentUser]);

  // Redirect to login when user becomes null
  useEffect(() => {
    if (currentUser === null) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  // Logout and reset auth context
  const handleLogout = async () => {
    if (authSource === "firebase") {
      const auth = getAuth();
      await signOut(auth);
    }
    localStorage.removeItem("profileImage");
    resetAuth();
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
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken?.();

      const res = await axios.post(`${apiUrl}/upload-profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });

      const url = res.data?.imageUrl;
      if (!url) throw new Error("No imageUrl returned from backend.");

      // Ensure Firebase Auth profile points to the new image
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
        await auth.currentUser.reload(); // get the fresh photoURL
      }

      const fresh = auth.currentUser?.photoURL || url;

      // Update UI + any app-level state
      setImage(fresh);
      setProfileImage(fresh);
      localStorage.setItem("profileImage", fresh);

      // Reset preview state
      setPreviewImage(null);
      setSelectedFile(null);

      alert("✅ Profile picture updated!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Image upload failed. Please try again.");
    }
  };

  if (currentUser === null) return null;

  const fallback =
    "https://ui-avatars.com/api/?name=Bennett+Thong";

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
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallback;
            }}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ddd",
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
          borderRadius: ".5rem .5rem 0 0",
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
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallback;
                      }}
                      style={{ width: "180px", borderRadius: "10px" }}
                    />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="mb-1">{currentUser?.displayName || "User"}</h5>
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
