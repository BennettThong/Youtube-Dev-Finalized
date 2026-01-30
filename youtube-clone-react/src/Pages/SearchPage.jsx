import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";


const SearchPage = () => {
    const { query } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_KEY = "AIzaSyCPzWrXtjiq05_bsjK0gLkYFd7hToe-7eg"; // safe for dev only

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                // 1️⃣ First, search videos
                const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
                    params: {
                        part: "snippet",
                        q: query,
                        type: "video",
                        maxResults: 12,
                        key: API_KEY,
                    },
                });

                const searchItems = res.data.items;

                // 2️⃣ Get full video details to include categoryId
                const videoIds = searchItems.map(v => v.id.videoId).join(',');
                const detailsRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
                    params: {
                        part: "snippet", // snippet has categoryId
                        id: videoIds,
                        key: API_KEY,
                    },
                });

                setVideos(detailsRes.data.items); // now each video has snippet.categoryId

            } catch (err) {
                console.error("YouTube API error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchVideos();
    }, [query]);

    if (loading) return <p>Loading videos...</p>; if (!videos.length) return <p>No videos found for "{query}"</p>;

    return (
        <div>
            <h2>Search Results for "{query}"</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {videos.map((video) => (
                    <Link
                        key={video.id}
                        to={`/home/video/${video.snippet.categoryId}/${video.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <div style={{ width: "300px", cursor: "pointer" }}>
                            <img
                                src={video.snippet.thumbnails.medium.url}
                                alt={video.snippet.title}
                                style={{ width: "100%" }}
                            />
                            <p>{video.snippet.title}</p>
                            <p style={{ color: "gray", fontSize: "14px" }}>
                                {video.snippet.channelTitle}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;
