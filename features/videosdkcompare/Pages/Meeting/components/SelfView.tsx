import React, { useState, useRef, useEffect, useCallback } from "react";
import { Paper, IconButton, Chip, Box, Typography } from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { colors } from "../../../theme/colors";
import { useFullscreen } from "../../../hooks";
import { RootState, AppDispatch } from "../../../Redux/store";
// import { VideoStats } from "../../../types/sdk";
import { sdkManager } from "../../../managers/SDKManager";
import VideoPlayerContainer from "./VideoPlayerContainer";
import VideoStatsInfo from "./VideoStatsInfo";
import { updateSelfFullScrreen } from "../../../Redux/meetingSlice";

const SelfVideoPlayer: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const sdkType = sdkManager.getCurrentSDKType();

  if (sdkType === "zoom") {
    return React.createElement(
      "video-player",
      {
        id: "self-camera-video",
        style: {
          width: "100%",
          height: "100%",
        },
      },
      children
    );
  }

  // For non-Zoom SDKs, return a regular div with the same styling
  return (
    <div
      id="self-camera-video"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        //  visibility: isVideoEnabled ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
};
interface SelfViewProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  userName: string;
  userId: string;
  showVideoStats?: boolean;
  isSelfFull?: boolean;
  onSelfFullscreenChange?: (
    isUseCSSMode: boolean,
    isFullscreen: boolean
  ) => void;
}

export const SelfView: React.FC<SelfViewProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  userName,
  userId,
  showVideoStats = true,
  isSelfFull = false,
  onSelfFullscreenChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: window.innerWidth - 216,
    y: 80,
  });

  // Get local video stats from Redux store
  const localVideoStats = useSelector(
    (state: RootState) => state.meeting.localVideoStats
  );

  // Self view fullscreen state management
  const [isUseCSSMode, setIsUseCSSMode] = useState(isSelfFull);
  const [hasExitedCSSMode, setHasExitedCSSMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the fullscreen hook
  const {
    isFullscreen,
    isCSSFullscreen,
    setCSSFullscreen,
    toggleFullscreen,
    elementRef: selfViewRef,
  } = useFullscreen({
    useCSSMode: isUseCSSMode,
    onError: (error) => {
      console.error("SelfView fullscreen error:", error);
    },
    onExitFullscreen: () => {
      console.log("SelfView fullscreen exited");
      // Only update state if we're still in CSS mode to prevent infinite loops
      if (isUseCSSMode && !hasExitedCSSMode) {
        setIsUseCSSMode(false);
        setHasExitedCSSMode(true);
      }
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selfViewRef.current) return;

    const rect = selfViewRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selfViewRef.current) return;

    const touch = e.touches[0];
    const rect = selfViewRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (clientX: number, clientY: number) => {
        const newX = clientX - dragOffset.x;
        const newY = clientY - dragOffset.y;

        // Calculate position relative to viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const elementWidth = 200;
        const elementHeight = 150;

        // Constrain to viewport bounds
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - elementWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - elementHeight)
        );

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      };

      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleGlobalMove(e.clientX, e.clientY);
      };

      const handleGlobalTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        handleGlobalMove(touch.clientX, touch.clientY);
      };

      const handleGlobalEnd = () => {
        setIsDragging(false);
      };

      // Mouse events
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalEnd);

      // Touch events
      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalEnd);
      document.addEventListener("touchcancel", handleGlobalEnd);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalEnd);
        document.removeEventListener("touchmove", handleGlobalTouchMove);
        document.removeEventListener("touchend", handleGlobalEnd);
        document.removeEventListener("touchcancel", handleGlobalEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // Auto enter CSS fullscreen mode when isSelfFull is true and hasn't exited CSS mode
  useEffect(() => {
    if (isSelfFull && !hasExitedCSSMode && !isCSSFullscreen && !isInitialized) {
      console.log("SelfView: Auto entering CSS fullscreen mode");
      setCSSFullscreen(true);
      setIsInitialized(true);
    }
  }, [
    isSelfFull,
    hasExitedCSSMode,
    isCSSFullscreen,
    setCSSFullscreen,
    isInitialized,
  ]);

  // Callback to parent component when fullscreen state changes
  useEffect(() => {
    onSelfFullscreenChange?.(isUseCSSMode, isFullscreen);
  }, [isFullscreen, isUseCSSMode, onSelfFullscreenChange]);

  // Sync isUseCSSMode with isSelfFull when it changes
  useEffect(() => {
    if (isSelfFull && !hasExitedCSSMode) {
      console.log("SelfView: Setting CSS mode to true");
      setIsUseCSSMode(true);
    } else if (!isSelfFull) {
      console.log("SelfView: Resetting CSS mode state");
      setIsUseCSSMode(false);
      setHasExitedCSSMode(false);
      setIsInitialized(false);
    }
  }, [isSelfFull, hasExitedCSSMode]);

  useEffect(() => {
    console.log(
      "SelfView: isFullscreen, isCSSFullscreen",
      isFullscreen,
      isCSSFullscreen
    );

    dispatch(
      updateSelfFullScrreen({
        isFullScrreen: isFullscreen,
        isCSSFullscreen: isCSSFullscreen,
      })
    );
  }, [isFullscreen, isCSSFullscreen, dispatch]);

  // Double click to handle fullscreen mode switching
  const handleSelfViewDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isUseCSSMode && isCSSFullscreen) {
        setCSSFullscreen(false);
        setIsUseCSSMode(false);
        setHasExitedCSSMode(true);
        console.log("Switched to native fullscreen mode");
      } else if (!isUseCSSMode) {
        toggleFullscreen();
      } else {
        console.log("No action taken - conditions not met");
      }
    },
    [isUseCSSMode, isCSSFullscreen, setCSSFullscreen, toggleFullscreen]
  );

  // Container is always rendered, visibility controlled by CSS

  return (
    <Paper
      ref={selfViewRef}
      data-testid="self-view-container"
      elevation={8}
      sx={{
        position: "fixed",
        width: 270,
        height: 200,
        left: position.x,
        top: position.y,
        zIndex: 1000,
        cursor: isDragging ? "grabbing" : "grab",
        overflow: "hidden",
        bgcolor: colors.background.dark,
        display: isVideoEnabled ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        border: `1px solid ${colors.border.dark}`, // cannot add
        // Fullscreen styles
        "&:fullscreen": {
          position: "static",
          width: "100vw",
          height: "100vh",
          left: "auto",
          top: "auto",
          cursor: "none",

          border: "none",
        },
        // CSS mode fullscreen styles
        ...(isSelfFull &&
          isCSSFullscreen && {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            cursor: "none",

            border: "none",
          }),
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleSelfViewDoubleClick}
    >
      <VideoPlayerContainer>
        <SelfVideoPlayer />
        {/* User info overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            left: 4,
            display:
              isFullscreen || (isSelfFull && isCSSFullscreen) ? "none" : "flex",
            gap: 0.5,
          }}
        >
          <Chip
            label={`${userName} (${userId})`}
            size="small"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: "0.6rem",
              height: "20px",
            }}
          />
          <Chip
            icon={
              isVideoEnabled ? (
                <Videocam sx={{ color: colors.success.main }} />
              ) : (
                <VideocamOff sx={{ color: colors.error.main }} />
              )
            }
            label={isVideoEnabled ? "Video" : "No Video"}
            size="small"
            variant="outlined"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: "0.6rem",
              height: "20px",
              borderColor: isVideoEnabled
                ? colors.success.main
                : colors.error.main,
            }}
          />
          <Chip
            icon={
              isAudioEnabled ? (
                <Mic sx={{ color: colors.success.main }} />
              ) : (
                <MicOff sx={{ color: colors.error.main }} />
              )
            }
            label={isAudioEnabled ? "Audio" : "No Audio"}
            size="small"
            variant="outlined"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: "0.6rem",
              height: "20px",
              borderColor: isAudioEnabled
                ? colors.success.main
                : colors.error.main,
            }}
          />
        </Box>

        {/* Video Stats overlay - only show when video is enabled and showVideoStats is enabled */}
        {isVideoEnabled && localVideoStats && showVideoStats && (
          <VideoStatsInfo
            videoStats={localVideoStats}
            position="bottom-right"
            statsType="send"
          />
        )}

        {/* Fullscreen button */}

        {!isFullscreen && (
          <IconButton
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              width: "24px",
              height: "24px",
              "&:hover": { bgcolor: colors.background.overlay + "CC" },
              display: "flex",
            }}
            onClick={() => {
              // all manually click is run native fullscreen logic
              toggleFullscreen();
            }}
          >
            <Fullscreen sx={{ fontSize: "16px" }} />
          </IconButton>
        )}
      </VideoPlayerContainer>
    </Paper>
  );
};
