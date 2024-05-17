import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import {
  updateRoomMoviePlayingStatus,
  updateRoomMovieTimeStatus,
} from "../../backend/controllers/roomController";

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, room, isRoomCreator } = props;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      player.on("dblclick", () => {
        if (!isRoomCreator) {
          player.requestFullscreen();
        }
      });

      player.on("play", () => {
        updateRoomMoviePlayingStatus(room, true)
          .then((result) => {
            console.log(result.message);
          })
          .catch(console.error);
        //updateRoomMovieTimeStatus(room, player.currentTime());
        console.log(player.currentTime());
      });

      player.on("pause", () => {
        updateRoomMoviePlayingStatus(room, false)
          .then((result) => {
            console.log(result.message);
          })
          .catch(console.error);
        //updateRoomMovieTimeStatus(room, player.currentTime());
        console.log(player.currentTime());
      });
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, room, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  React.useEffect(() => {
    const player = playerRef.current;

    if (player) {
      // Only update the source if it has changed
      const currentSource = player.currentSource();
      if (options.sources[0].src !== currentSource) {
        player.src(options.sources);
      }
    }
  }, [options.sources]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
