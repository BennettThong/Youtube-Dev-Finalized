import React, { useEffect, useState } from "react";
import "./PlayVideo.css";
import like from "../../assets/like.png";
import dislike from "../../assets/dislike.png";
import share from "../../assets/share.png";
import save from "../../assets/save.png";
import { API_KEY, value_converter } from "../../data";
import moment from "moment";
import Comments from "../Comments"; 

const PlayVideo = ({ videoId }) => {
  const [apiData, setApiData] = useState(null);
  const [channelData, setChannelData] = useState(null);

  // --- YouTube comments state ---
  const [ytComments, setYtComments] = useState([]);
  const [ytNextPageToken, setYtNextPageToken] = useState(null);
  const [ytLoading, setYtLoading] = useState(false);

  // ---------------- YouTube video + channel ----------------
  const fetchVideoData = async () => {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setApiData(data.items?.[0] || null);
    } catch (err) {
      console.error("Failed to fetch video data:", err);
      setApiData(null);
    }
  };

  const fetchChannelData = async () => {
    if (!apiData?.snippet?.channelId) return;
    try {
      const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setChannelData(data.items?.[0] || null);
    } catch (err) {
      console.error("Failed to fetch channel data:", err);
      setChannelData(null);
    }
  };

  useEffect(() => {
    fetchVideoData();
    // reset YT comments when switching video
    setYtComments([]);
    setYtNextPageToken(null);
    window.scrollTo(0, 0);
  }, [videoId]);

  useEffect(() => {
    if (apiData) fetchChannelData();
  }, [apiData]);

  // ---------------- YouTube commentThreads ----------------
  const fetchYtComments = async (pageToken) => {
    if (!videoId) return;
    setYtLoading(true);
    try {
      const params = new URLSearchParams({
        part: "snippet,replies", // 'replies' gives first batch of replies inline
        videoId,
        maxResults: "20",
        order: "time", // or 'relevance'
        key: API_KEY,
      });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?${params.toString()}`
      );
      const data = await res.json();

      setYtComments((prev) =>
        pageToken ? [...prev, ...(data.items || [])] : data.items || []
      );
      setYtNextPageToken(data.nextPageToken || null);
    } catch (e) {
      console.error("YT commentThreads error:", e);
    } finally {
      setYtLoading(false);
    }
  };

  useEffect(() => {
    fetchYtComments(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (!apiData) return <div>Loading video...</div>;

  return (
    <div className="play-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="YouTube Video Player"
      />

      <h3>{apiData.snippet.title}</h3>

      <div className="play-video-info">
        <p>
          {value_converter(apiData.statistics.viewCount)} Views &bull;{" "}
          {moment(apiData.snippet.publishedAt).fromNow()}
        </p>
        <div>
          <span>
            <img src={like} alt="" />
            {value_converter(apiData.statistics.likeCount)}
          </span>
          <span>
            <img src={dislike} alt="" />2
          </span>
          <span>
            <img src={share} alt="" />
            Share
          </span>
          <span>
            <img src={save} alt="" />
            Save
          </span>
        </div>
      </div>

      <hr />

      <div className="publisher">
        <img src={channelData?.snippet?.thumbnails?.default?.url || ""} alt="" />
        <div>
          <p>{apiData.snippet.channelTitle}</p>
          <span>
            {channelData
              ? value_converter(channelData.statistics.subscriberCount)
              : "1M"}{" "}
            Subscribers
          </span>
        </div>
        <button type="button">Subscribe</button>
      </div>

      <div className="vid-description">
        <p>{apiData.snippet.description.slice(0, 250)}</p>
      </div>

      <hr />

      {/* ======= Community Comments (your backend) ======= */}
      <div className="vid-description">
        <h4>Community Comments</h4>
        <Comments videoId={videoId} />
      </div>

      <hr />

      {/* ======= YouTube Comments (commentThreads) ======= */}
      <div className="vid-description">
        <h4>
          YouTube Comments{" "}
          {apiData?.statistics?.commentCount
            ? `(${value_converter(apiData.statistics.commentCount)})`
            : ""}
        </h4>

        {ytComments.map((thread) => {
          const tlc = thread?.snippet?.topLevelComment;
          if (!tlc) return null;

          const author = tlc.snippet.authorDisplayName;
          const avatar = tlc.snippet.authorProfileImageUrl;
          const textHtml = tlc.snippet.textDisplay; // includes basic HTML (links/emojis)
          const published = tlc.snippet.publishedAt;
          const likeCount = tlc.snippet.likeCount;
          const replies = thread.replies?.comments || [];

          return (
            <div key={thread.id} className="comment">
              <img src={avatar} alt={author} />
              <div>
                <h3>
                  {author} <span>{moment(published).fromNow()}</span>
                </h3>
                <p dangerouslySetInnerHTML={{ __html: textHtml }} />
                <div className="comment-action">
                  <img src={like} alt="" />
                  <span>{likeCount}</span>
                  <img src={dislike} alt="" />
                </div>

                {/* Inline replies provided by commentThreads */}
                {replies.length > 0 && (
                  <div className="replies">
                    {replies.map((r) => (
                      <div key={r.id} className="reply">
                        <img
                          src={r.snippet.authorProfileImageUrl}
                          alt={r.snippet.authorDisplayName}
                        />
                        <div>
                          <h4>
                            {r.snippet.authorDisplayName}{" "}
                            <span>{moment(r.snippet.publishedAt).fromNow()}</span>
                          </h4>
                          <p
                            dangerouslySetInnerHTML={{
                              __html: r.snippet.textDisplay,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {ytNextPageToken && (
          <div style={{ marginTop: 12 }}>
            <button
              className="btn btn-outline-secondary"
              disabled={ytLoading}
              onClick={() => fetchYtComments(ytNextPageToken)}
            >
              {ytLoading ? "Loading..." : "Load more YouTube comments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayVideo;
