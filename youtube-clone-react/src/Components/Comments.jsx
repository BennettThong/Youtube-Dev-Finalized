import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "./AuthProvider";
import { getAuth } from "firebase/auth";
import "./comments.css";

const apiUrl = import.meta.env.VITE_API_URL;

export default function Comments({ videoId }) {
    const { currentUser, profileImage } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");

    const canPost = !!currentUser;
    const myUid = currentUser?.uid || null;

    const smallAvatar = useMemo(
        () =>
            currentUser?.photoURL ||
            profileImage ||
            "https://ui-avatars.com/api/?name=Bennett+Thong",
        [currentUser, profileImage]
    );

    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${apiUrl}/api/videos/${videoId}/comments?sort=newest&limit=20`
            );
            setComments(data.comments || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    const postComment = async () => {
        if (!text.trim()) return;
        try {
            const auth = getAuth();
            const idToken = await auth.currentUser?.getIdToken();
            const { data } = await axios.post(
                `${apiUrl}/api/videos/${videoId}/comments`,
                { body: text },
                { headers: idToken ? { Authorization: `Bearer ${idToken}` } : {} }
            );
            setText("");
            setComments((prev) => [data.comment, ...prev]); // optimistic insert
        } catch (e) {
            console.error(e);
            alert("Failed to comment.");
        }
    };

    const toggleLike = async (commentId) => {
        try {
            const auth = getAuth();
            const idToken = await auth.currentUser?.getIdToken();
            const { data } = await axios.post(
                `${apiUrl}/api/comments/${commentId}/like`,
                {},
                { headers: idToken ? { Authorization: `Bearer ${idToken}` } : {} }
            );
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, like_count: c.like_count + (data.liked ? 1 : -1) }
                        : c
                )
            );
        } catch (e) {
            console.error(e);
        }
    };

    const loadReplies = async (commentId) => {
        try {
            const { data } = await axios.get(`${apiUrl}/api/comments/${commentId}/replies`);
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? { ...c, _replies: data.comments } : c))
            );
        } catch (e) {
            console.error(e);
        }
    };

    // --- NEW: delete (works for top-level and replies) ---
    const deleteComment = async (commentId, parentId = null) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            const auth = getAuth();
            const idToken = await auth.currentUser?.getIdToken();
            await axios.delete(`${apiUrl}/api/comments/${commentId}`, {
                headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
            });

            if (!parentId) {
                // top-level comment: remove whole thread
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            } else {
                // reply: remove from parent's replies and decrement visible count
                setComments((prev) =>
                    prev.map((c) => {
                        if (c.id !== parentId) return c;
                        const updatedReplies = (c._replies || []).filter((r) => r.id !== commentId);
                        return {
                            ...c,
                            _replies: updatedReplies,
                            reply_count: Math.max((c.reply_count || 0) - 1, 0),
                        };
                    })
                );
            }
        } catch (e) {
            console.error("DELETE /comments failed:", e?.response?.status, e?.response?.data);
            alert("Failed to delete comment.");
        }
    };

    return (
        <div style={{ marginTop: 24 }}>
            <h3>{loading ? "Loading comments..." : `${comments.length} Comments`}</h3>

            {/* Create comment */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 12 }}>
                <img
                    src={smallAvatar}
                    alt="me"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ flex: 1 }}>
                    <textarea
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={canPost ? "Add a comment..." : "Sign in to comment"}
                        disabled={!canPost}
                        style={{ width: "100%", padding: 8 }}
                    />
                    <div style={{ textAlign: "right", marginTop: 8 }}>
                        <button className="btn btn-primary" disabled={!canPost || !text.trim()} onClick={postComment}>
                            Comment
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div style={{ marginTop: 16 }}>
                {comments.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <img
                            src={c.author_avatar || "https://ui-avatars.com/api/?name=" + (c.author_name || "User")}
                            alt={c.author_name || "User"}
                            width={40}
                            height={40}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ fontWeight: 600 }}>
                                    {c.author_name || "User"}{" "}
                                    <span style={{ color: "#777", fontWeight: 400 }}>
                                        • {new Date(c.created_at).toLocaleString()}
                                    </span>
                                </div>

                                {/* Show delete if it's my top-level comment */}
                                {myUid && c.author_uid === myUid && (
                                    <button
                                        className="btn btn-link btn-sm text-danger"
                                        onClick={() => deleteComment(c.id /* parentId null */)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <div style={{ whiteSpace: "pre-wrap" }}>{c.body}</div>

                            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                                <button
                                    className={`like-btn ${c.likedByMe ? "liked" : ""}`}
                                    onClick={() => toggleLike(c.id)}
                                    type="button"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="like-icon">
                                        <path d="M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                                    </svg>
                                    <span className="like-count">{c.like_count}</span>

                                </button>
                                <button className="btn btn-light btn-sm" onClick={() => loadReplies(c.id)}>
                                    {c.reply_count} replies
                                </button>
                            </div>

                            {Array.isArray(c._replies) && c._replies.length > 0 && (
                                <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: "2px solid #eee" }}>
                                    {c._replies.map((r) => (
                                        <div key={r.id} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                                            <img
                                                src={r.author_avatar || "https://ui-avatars.com/api/?name=" + (r.author_name || "User")}
                                                alt={r.author_name || "User"}
                                                width={32}
                                                height={32}
                                                style={{ borderRadius: "50%", objectFit: "cover" }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {r.author_name || "User"}{" "}
                                                        <span style={{ color: "#777", fontWeight: 400 }}>
                                                            • {new Date(r.created_at).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Show delete if it's my reply */}
                                                    {myUid && r.author_uid === myUid && (
                                                        <button
                                                            className="btn btn-link btn-sm text-danger"
                                                            onClick={() => deleteComment(r.id, r.parent_id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ whiteSpace: "pre-wrap" }}>{r.body}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
