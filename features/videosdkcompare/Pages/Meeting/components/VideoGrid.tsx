import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import { colors } from "../../../theme/colors";
import { RemoteUser } from "../../../types/sdk";
import { RemoteVideoItem } from "./RemoteVideoItem";
import { sdkManager } from "../../../managers/SDKManager";
import { useFullscreen } from "../../../hooks";
import VideoPlayerContainer from "./VideoPlayerContainer";
import VideoStatsInfo from "./VideoStatsInfo";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../Redux/store";
import { updateRemoteFullScrreen } from "../../../Redux/meetingSlice";
interface VideoGridProps {
  remoteUsers: { [uid: string]: RemoteUser };
  isMainViewFullscreen?: boolean;
  showVideoStats?: boolean;
  remoteFull?: boolean; // is main view fullscreen
  onFullscreenChange: (isUseCSSMode: boolean, isFullscreen: boolean) => void; // css full screen callback
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  remoteUsers,
  isMainViewFullscreen = false,
  showVideoStats = true,
  remoteFull = false, // is main view fullscreen
  onFullscreenChange, // css full screen callback
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get video stats from Redux store
  const videoStats = useSelector((state: RootState) => {
    const remoteHasVideoUserIds = Object.keys(remoteUsers).filter((uid) => {
      return state.meeting.remoteUsers[uid].hasVideo;
    });

    const id = remoteHasVideoUserIds[0];
    return {
      ...state.meeting.remoteUserVideoTrackStats[id],
    };
  });

  const isZoomSDK = sdkManager.getCurrentSDKType() === "zoom";
  const remoteUserIds = Object.keys(remoteUsers);
  const remoteUserCount = remoteUserIds.length;

  // const [hasExitedCSSMode, setHasExitedCSSMode] = useState(false);

  const [isUseCSSMode, setIsUseCSSMode] = useState(remoteFull);

  const gridFullscreenRef = useRef<HTMLDivElement>(null);

  // Grid-level fullscreen functionality
  const {
    // elementRef: gridFullscreenRef,
    isFullscreen,
    isCSSFullscreen,
    setCSSFullscreen,
    toggleFullscreen: toggleGridFullscreen,
  } = useFullscreen({
    targetElement: gridFullscreenRef.current,
    useCSSMode: isUseCSSMode,
    onError: (error) => {
      console.error("Grid fullscreen error:", error);
    },
    onEnterFullscreen: () => {
      console.log("Grid fullscreen entered");
    },
    onExitFullscreen: () => {
      console.log("Grid fullscreen exited");

      if (isUseCSSMode) {
        setIsUseCSSMode(false);
        // onFullscreenChange(false, false);
      }
    },
  });

  const setCSSFullscreenRef = useRef(setCSSFullscreen);
  const toggleGridFullscreenRef = useRef(toggleGridFullscreen);

  setCSSFullscreenRef.current = setCSSFullscreen;
  toggleGridFullscreenRef.current = toggleGridFullscreen;

  useEffect(() => {
    console.log(
      "RemoteView: isFullscreen, isCSSFullscreen",
      isFullscreen,
      isCSSFullscreen
    );

    dispatch(
      updateRemoteFullScrreen({
        isFullScrreen: isFullscreen,
        isCSSFullscreen: isCSSFullscreen,
      })
    );
  }, [isFullscreen, isCSSFullscreen, dispatch]);

  // auto enter css full screen mode when remoteFull is true and hasn't exited CSS mode
  useEffect(() => {
    if (isUseCSSMode && !isCSSFullscreen) {
      setCSSFullscreenRef.current(true);
    }
  }, [isUseCSSMode, isCSSFullscreen]);

  // callback to parent component when css full screen state change
  useEffect(() => {
    onFullscreenChange(isUseCSSMode, isFullscreen);
  }, [isFullscreen, isUseCSSMode, onFullscreenChange]);

  // double click to exit fullscreen
  const handleGridDoubleClick = useCallback(() => {
    if (isUseCSSMode && isCSSFullscreen) {
      setCSSFullscreenRef.current(false);
      console.log("Switched to native fullscreen mode");
    } else if (!isUseCSSMode) {
      toggleGridFullscreenRef.current();
    } else {
      console.log("No action taken - conditions not met");
    }
  }, [isUseCSSMode, isCSSFullscreen]);

  const prevMainViewFullscreen = useRef(isMainViewFullscreen);

  useEffect(() => {
    console.log(
      "Manual native fullscreen control:",
      prevMainViewFullscreen.current,
      isMainViewFullscreen
    );
    if (prevMainViewFullscreen.current !== isMainViewFullscreen) {
      if (isUseCSSMode) {
        setCSSFullscreenRef.current(isMainViewFullscreen);
      } else {
        toggleGridFullscreenRef.current();
      }
      prevMainViewFullscreen.current = isMainViewFullscreen;
    }
  }, [isMainViewFullscreen, isUseCSSMode]);

  const getGridLayout = (userCount: number) => {
    if (userCount === 0) return { cols: 1, rows: 1 };
    if (userCount === 1) return { cols: 1, rows: 1 };
    if (userCount === 2) return { cols: 2, rows: 1 };
    if (userCount === 3) return { cols: 2, rows: 2 };
    if (userCount === 4) return { cols: 2, rows: 2 };
    if (userCount <= 6) return { cols: 3, rows: 2 };
    if (userCount <= 9) return { cols: 3, rows: 3 };
    return { cols: 4, rows: Math.ceil(userCount / 4) };
  };

  const layout = getGridLayout(remoteUserCount);

  return (
    <Box
      ref={gridFullscreenRef}
      data-testid="video-grid-container"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        overflow: "auto",
        // Fullscreen styles
        "&:fullscreen": {
          p: 0,
          bgcolor: colors.background.dark,
          cursor: "none",
        },
        // css mode, css fullscreen style
        ...(remoteFull &&
          isCSSFullscreen && {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            bgcolor: colors.background.dark,
            p: 0,
            cursor: "none",
          }),
      }}
      onDoubleClick={handleGridDoubleClick}
    >
      <VideoPlayerContainer>
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            gap: 2,
            minHeight: 0,
            maxHeight: "100%",
            overflow: "auto",
            backgroundColor: "#1E293B", // #1E293B
          }}
        >
          {remoteUserIds.length > 0 ? (
            remoteUserIds.map((uid) => {
              const user = remoteUsers[uid];
              return (
                <RemoteVideoItem
                  key={uid}
                  user={user}
                  isFullscreen={isFullscreen}
                  showVideoStats={showVideoStats && !isZoomSDK}
                />
              );
            })
          ) : (
            /* Empty state when no remote users */
            <Paper
              elevation={3}
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: colors.background.dark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gridColumn: "1 / -1",
                gridRow: "1 / -1",
                minHeight: 0,
                maxHeight: "100%",
                border: `1px solid ${colors.border.dark}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.text.inverse,
                }}
              >
                <Person sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ opacity: 0.7 }}>
                  Waiting for participants...
                </Typography>
              </Box>
            </Paper>
          )}

          {isZoomSDK && showVideoStats && (
            <VideoStatsInfo
              videoStats={videoStats}
              position="bottom-right"
              statsType="receive"
            />
          )}
        </Box>
      </VideoPlayerContainer>
    </Box>
  );
};
