import React, { useEffect, useState } from 'react';
import './PlayVideo.css';
import like from '../../assets/like.png';
import dislike from '../../assets/dislike.png';
import share from '../../assets/share.png';
import save from '../../assets/save.png';
import { API_KEY, value_converter } from '../../data';
import moment from 'moment';

const PlayVideo = ({ videoId }) => {
    const [apiData, setApiData] = useState(null);
    const [channelData, setChannelData] = useState(null);
    const [commentData, setCommentData] = useState([]);

    const fetchVideoData = async () => {
        const videoDetails_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
        try {
            const res = await fetch(videoDetails_url);
            const data = await res.json();
            console.log("Video Data:", data);
            if (data.items && data.items.length > 0) {
                setApiData(data.items[0]);
            } else {
                console.warn("No video data found");
                setApiData(null);
            }
        } catch (err) {
            console.error("Failed to fetch video data:", err);
        }
    };

    const fetchOtherData = async () => {
        if (!apiData?.snippet?.channelId) return;

        try {
            const channelLogo_url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${apiData.snippet.channelId}&key=${API_KEY}`;
            const res1 = await fetch(channelLogo_url);
            const data1 = await res1.json();
            setChannelData(data1.items?.[0]);

            const videoComment_url = `https://www.googleapis.com/youtube/v3/commentThreads?textFormat=plainText&part=snippet&maxResults=50&key=${API_KEY}&videoId=${videoId}`;
            const res2 = await fetch(videoComment_url);
            const data2 = await res2.json();
            setCommentData(data2.items || []);
        } catch (err) {
            console.error("Failed to fetch additional data:", err);
        }
    };

    useEffect(() => {
        fetchVideoData();
        window.scrollTo(0, 0);
    }, [videoId]);

    useEffect(() => {
        if (apiData) fetchOtherData();
    }, [apiData]);

    if (!apiData) {
        return <div>Loading video...</div>;
    }

    return (
        <div className="play-video">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="YouTube Video Player"
            ></iframe>

            <h3>{apiData.snippet.title}</h3>

            <div className="play-video-info">
                <p>
                    {value_converter(apiData.statistics.viewCount)} Views &bull;{" "}
                    {moment(apiData.snippet.publishedAt).fromNow()}
                </p>
                <div>
                    <span><img src={like} alt="" />{value_converter(apiData.statistics.likeCount)}</span>
                    <span><img src={dislike} alt="" />2</span>
                    <span><img src={share} alt="" />Share</span>
                    <span><img src={save} alt="" />Save</span>
                </div>
            </div>

            <hr />

            <div className="publisher">
                <img src={channelData?.snippet?.thumbnails?.default?.url || ""} alt="" />
                <div>
                    <p>{apiData.snippet.channelTitle}</p>
                    <span>{channelData ? value_converter(channelData.statistics.subscriberCount) : "1M"} Subscribers</span>
                </div>
                <button type="button">Subscribe</button>
            </div>

            <div className="vid-description">
                <p>{apiData.snippet.description.slice(0, 250)}</p>
                <hr />
                <h4>{value_converter(apiData.statistics.commentCount)} Comments</h4>

                {commentData.map((item, index) => (
                    <div key={index} className="comment">
                        <img src={item.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="" />
                        <div>
                            <h3>
                                {item.snippet.topLevelComment.snippet.authorDisplayName}
                                <span>{moment(item.snippet.topLevelComment.snippet.publishedAt).fromNow()}</span>
                            </h3>
                            <p>{item.snippet.topLevelComment.snippet.textDisplay}</p>
                            <div className="comment-action">
                                <img src={like} alt="" />
                                <span>{item.snippet.topLevelComment.snippet.likeCount}</span>
                                <img src={dislike} alt="" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayVideo;
