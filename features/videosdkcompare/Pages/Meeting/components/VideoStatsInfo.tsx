import React from "react";
import { Box, Typography } from "@mui/material";
import { VideoStats } from "../../../types/sdk";

interface VideoStatsInfoProps {
  videoStats: VideoStats & { userId?: string };
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showUserId?: boolean;
  showFPS?: boolean;
  showResolution?: boolean;
  showBitrate?: boolean;
  showPacketLoss?: boolean;
  showRTT?: boolean;
  showBandwidth?: boolean;
  showSampleRate?: boolean;
  showJitter?: boolean;
  statsType?: "send" | "receive";
}

const VideoStatsInfo: React.FC<VideoStatsInfoProps> = ({
  videoStats,
  position = "top-right",
  showUserId = true,
  showFPS = true,
  showResolution = true,
  showBitrate = true,
  showPacketLoss = true,
  showRTT = true,
  showBandwidth = true,
  showSampleRate = true,
  showJitter = true,
  statsType = "receive",
}) => {
  // Calculate position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      display: "flex",
      flexDirection: "column" as const,
      zIndex: 2,
      minWidth: "100px",
      color: "red",
      fontSize: "0.6rem",
    };

    switch (position) {
      case "top-left":
        return {
          ...baseStyles,
          left: "10px",
          top: "10px",
        };
      case "bottom-left":
        return {
          ...baseStyles,
          left: "10px",
          bottom: "10px",
        };
      case "bottom-right":
        return {
          ...baseStyles,
          right: "10px",
          bottom: "10px",
        };
      case "top-right":
      default:
        return {
          ...baseStyles,
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <Box sx={getPositionStyles()}>
      {showUserId && videoStats?.userId && (
        <Typography variant="caption">UserId: {videoStats.userId}</Typography>
      )}

      {showFPS &&
        (videoStats.sendFrameRate !== undefined ||
          videoStats.receiveFrameRate !== undefined) && (
          <Typography variant="caption">
            FPS:
            {statsType === "send"
              ? videoStats?.sendFrameRate
              : videoStats?.receiveFrameRate}
          </Typography>
        )}

      {showResolution &&
        (videoStats.sendResolutionWidth !== undefined ||
          videoStats.receiveResolutionWidth !== undefined) && (
          <Typography variant="caption">
            Resolution:
            {statsType === "send"
              ? `${videoStats?.sendResolutionWidth || 0}x${
                  videoStats?.sendResolutionHeight || 0
                }`
              : `${videoStats?.receiveResolutionWidth || 0}x${
                  videoStats?.receiveResolutionHeight || 0
                }`}
          </Typography>
        )}

      {showBitrate &&
        (videoStats.sendBitrate !== undefined ||
          videoStats.receiveBitrate !== undefined) && (
          <Typography variant="caption">
            Bitrate:
            {(() => {
              const bitrate =
                statsType === "send"
                  ? videoStats?.sendBitrate
                  : videoStats?.receiveBitrate;
              return bitrate ? `${(bitrate / 1000).toFixed(1)} kbps` : "N/A";
            })()}
          </Typography>
        )}

      {showPacketLoss && videoStats?.packetLossRate !== undefined && (
        <Typography variant="caption">
          packetLoss: {videoStats.packetLossRate.toFixed(2)}%
        </Typography>
      )}

      {showRTT && videoStats?.transportDelay !== undefined && (
        <Typography variant="caption">
          RTT: {videoStats.transportDelay.toFixed(2)}
        </Typography>
      )}

      {showBandwidth && videoStats?.bandwidth !== undefined && (
        <Typography variant="caption">
          bandwidth: {(videoStats.bandwidth / 1000).toFixed(1)} kbps
        </Typography>
      )}

      {showSampleRate && videoStats?.sample_rate !== undefined && (
        <Typography variant="caption">
          sample_rate: {videoStats.sample_rate.toFixed(2)}
        </Typography>
      )}

      {showJitter && videoStats?.jitter !== undefined && (
        <Typography variant="caption">
          jitter: {videoStats.jitter.toFixed(2)}
        </Typography>
      )}
    </Box>
  );
};

export default VideoStatsInfo;
