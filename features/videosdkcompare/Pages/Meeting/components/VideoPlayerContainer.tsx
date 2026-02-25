import React from "react";
import { sdkManager } from "../../../managers/SDKManager";

interface VideoPlayerContainerProps {
  children: React.ReactNode;
}

const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  children,
}) => {
  const sdkType = sdkManager.getCurrentSDKType();

  if (sdkType === "zoom") {
    return React.createElement(
      "video-player-container",
      {
        style: {
          flex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        },
      },
      children
    );
  }

  // For non-Zoom SDKs, return a regular div with the same styling
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

export default VideoPlayerContainer;
