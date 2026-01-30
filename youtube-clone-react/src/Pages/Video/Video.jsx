import React from "react";
import PlayVideo from "../../Components/PlayVideo/PlayVideo";
import Recommended from "../../Components/Recommended/Recommended";
import './Video.css';
import { useParams } from "react-router-dom";

const Video = () => {
    const { videoId, categoryId } = useParams();


    if (!videoId) {
        return <div>Video ID not found in URL.</div>;
    }

    return (
        <div className="play-container">
            <PlayVideo videoId={videoId} />
            <Recommended categoryId={categoryId} />
        </div>
    );
};

export default Video;
