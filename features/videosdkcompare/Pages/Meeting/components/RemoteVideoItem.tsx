import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Chip,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Fullscreen,
  FullscreenExit,
  Tune,
  Check,
} from "@mui/icons-material";
import { useSelector } from "react-redux";

import { VideoQuality as ZoomVideoQuality } from "@zoom/videosdk";

import { colors } from "../../../theme/colors";
import { RemoteUser, ZoomVideoMode, VideoStats } from "../../../types/sdk";
import { sdkManager } from "../../../managers/SDKManager";
import { useFullscreen } from "../../../hooks";
import { RootState } from "../../../Redux/store";
import VideoStatsInfo from "./VideoStatsInfo";

interface RemoteVideoItemProps {
  user: RemoteUser;
  isFullscreen: boolean;
  // onDoubleClick: () => void;
  showVideoStats?: boolean;
}

export const RemoteVideoItem: React.FC<RemoteVideoItemProps> = ({
  user,
  isFullscreen,
  // onDoubleClick,
  showVideoStats = true,
}) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoAttached, setIsVideoAttached] = useState(false);
  const attachmentInProgressRef = useRef(false);
  const [zoomVideoQuality, setZoomVideoQuality] = useState<ZoomVideoQuality>(
    ZoomVideoQuality.Video_720P
  );
  const [qualityMenuAnchor, setQualityMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  // Get video stats from Redux store
  const videoStats = useSelector((state: RootState) => {
    return {
      userId: user.uid,
      ...state.meeting.remoteUserVideoTrackStats[user.uid],
    };
  });

  // Use the fullscreen hook for individual item fullscreen
  // const {
  //   isFullscreen: isIndividualFullscreen,
  //   toggleFullscreen,
  //   elementRef: paperRef,
  // } = useFullscreen({
  //   onError: (error) => {
  //     console.error("Fullscreen error:", error);
  //   },
  // });

  // Handle video attachment/detachment based on user video state
  const attachVideo = useCallback(async () => {
    // console.log(
    //   "attachVideo called - user.hasVideo, user.uid, isVideoAttached, attachmentInProgress",
    //   user.hasVideo,
    //   user.uid,
    //   isVideoAttached,
    //   attachmentInProgressRef.current
    // );

    if (
      !videoContainerRef.current ||
      !user.hasVideo ||
      isVideoAttached ||
      attachmentInProgressRef.current
    ) {
      // console.log("attachVideo early return:", {
      //   containerExists: !!videoContainerRef.current,
      //   userHasVideo: user.hasVideo,
      //   isVideoAttached: isVideoAttached,
      //   attachmentInProgress: attachmentInProgressRef.current,
      // });
      return;
    }

    // Set lock to prevent concurrent attachments
    attachmentInProgressRef.current = true;

    try {
      const currentSDK = sdkManager.getCurrentSDK();
      const sdkType = sdkManager.getCurrentSDKType();

      if (!currentSDK || !sdkType) {
        console.warn("No SDK available for video attachment");
        return;
      }

      // Set container ID for SDK to find
      videoContainerRef.current.id = `remote-video-${user.uid}`;

      // Call SDK-specific video attachment logic
      await attachRemoteVideoForSDK(
        sdkType,
        user.uid,
        videoContainerRef.current,
        currentSDK,
        zoomVideoQuality
      );

      // Only set attached state after successful attachment
      setIsVideoAttached(true);
      console.log("attachVideo completed successfully");
    } catch (error) {
      console.error(`Failed to attach video for user ${user.uid}:`, error);
    } finally {
      // Always release the lock
      attachmentInProgressRef.current = false;
    }
  }, [user.hasVideo, user.uid, isVideoAttached, zoomVideoQuality]);

  const detachVideo = useCallback(async () => {
    console.log(
      "detachVideo called - user.hasVideo, user.uid, isVideoAttached, attachmentInProgress",
      user.hasVideo,
      user.uid,
      isVideoAttached,
      attachmentInProgressRef.current
    );

    if (
      !videoContainerRef.current ||
      user.hasVideo ||
      !isVideoAttached ||
      attachmentInProgressRef.current
    ) {
      console.log("detachVideo early return:", {
        containerExists: !!videoContainerRef.current,
        userHasVideo: user.hasVideo,
        isVideoAttached: isVideoAttached,
        attachmentInProgress: attachmentInProgressRef.current,
      });
      return;
    }

    // Set lock to prevent concurrent operations
    attachmentInProgressRef.current = true;

    console.log("detachVideo proceeding with cleanup for user:", user.uid);

    try {
      const currentSDK = sdkManager.getCurrentSDK();
      const sdkType = sdkManager.getCurrentSDKType();
      if (sdkType && currentSDK) {
        await detachRemoteVideoForSDK(
          sdkType,
          user.uid,
          videoContainerRef.current,
          currentSDK
        );
      }
      setIsVideoAttached(false);
      console.log("detachVideo completed, isVideoAttached set to false");
    } catch (error) {
      console.error(`Failed to detach video for user ${user.uid}:`, error);
    } finally {
      // Always release the lock
      attachmentInProgressRef.current = false;
    }
  }, [user.hasVideo, user.uid, isVideoAttached]);

  useEffect(() => {
    if (user.hasVideo) {
      attachVideo();
    } else {
      detachVideo();
    }

    // Cleanup on unmount
    return () => {
      if (isVideoAttached && !attachmentInProgressRef.current) {
        detachVideo();
      }
    };
  }, [user.hasVideo, attachVideo, detachVideo, isVideoAttached]);

  const qualityOptions: Array<{ label: string; value: ZoomVideoQuality }> = [
    { label: "90p", value: ZoomVideoQuality.Video_90P },
    { label: "180p", value: ZoomVideoQuality.Video_180P },
    { label: "360p", value: ZoomVideoQuality.Video_360P },
    { label: "720p", value: ZoomVideoQuality.Video_720P },
    { label: "1080p", value: ZoomVideoQuality.Video_1080P },
  ];

  const handleQualityIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setQualityMenuAnchor(event.currentTarget);
  };

  const handleQualityMenuClose = () => {
    setQualityMenuAnchor(null);
  };

  const handleZoomQualitySelect = async (nextQuality: ZoomVideoQuality) => {
    handleQualityMenuClose();
    if (nextQuality === zoomVideoQuality) {
      return;
    }

    setZoomVideoQuality(nextQuality);

    if (!videoContainerRef.current || !user.hasVideo || !isVideoAttached) {
      return;
    }

    if (attachmentInProgressRef.current) {
      return;
    }

    attachmentInProgressRef.current = true;
    try {
      const currentSDK = sdkManager.getCurrentSDK();
      const sdkType = sdkManager.getCurrentSDKType();
      if (!currentSDK || sdkType !== "zoom") {
        return;
      }

      await detachRemoteVideoForSDK(
        sdkType,
        user.uid,
        videoContainerRef.current,
        currentSDK
      );
      setIsVideoAttached(false);

      await attachRemoteVideoForSDK(
        sdkType,
        user.uid,
        videoContainerRef.current,
        currentSDK,
        nextQuality
      );
      setIsVideoAttached(true);
    } catch (error) {
      console.error(`Failed to switch quality for user ${user.uid}:`, error);
    } finally {
      attachmentInProgressRef.current = false;
    }
  };

  return (
    <Paper
      // ref={paperRef}
      elevation={3}
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: colors.background.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        maxHeight: "100%",
        border: `1px solid ${colors.border.dark}`,
        backgroundColor: "transparent",

        ...(isFullscreen && {
          border: "none",
        }),

        // Fullscreen styles
        // ...(isIndividualFullscreen && {
        //   position: "fixed",
        //   top: 0,
        //   left: 0,
        //   width: "100vw",
        //   height: "100vh",
        //   zIndex: 9999,
        //   bgcolor: colors.background.dark,
        // }),
      }}
      // onDoubleClick={onDoubleClick}
    >
      {/* Video container */}
      <Box
        ref={videoContainerRef}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& video": {
            width: "100%",
            height: "100%",
            objectFit: "contain",
          },
          "& canvas": {
            width: "100%",
            height: "100%",
            objectFit: "contain",
          },
        }}
      />

      {/* User info overlay */}
      <Box
        sx={{
          position: "absolute",
          // Center when video is off, bottom-left when video is on
          ...(user.hasVideo
            ? { bottom: 4, left: 4 }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }),
          display: isFullscreen ? "none" : "flex",
          flexDirection: "column",
          gap: 1.5,
          zIndex: 2,
        }}
      >
        {/* User info chips */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexDirection: user.hasVideo ? "row" : "column",
            alignItems: user.hasVideo ? "flex-start" : "center",
          }}
        >
          <Chip
            label={`${
              user.userName ? String(user.userName) : `User ${user.uid}`
            } (${user.uid})`}
            size="small"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: user.hasVideo ? "0.7rem" : "0.9rem",
              height: "20px",
              fontWeight: 500,
            }}
          />
          <Chip
            icon={
              user.hasVideo ? (
                <Videocam sx={{ color: colors.success.main }} />
              ) : (
                <VideocamOff sx={{ color: colors.error.main }} />
              )
            }
            label={user.hasVideo ? "Video" : "No Video"}
            size="small"
            variant="outlined"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: "0.6rem",
              height: "20px",
              borderColor: user.hasVideo
                ? colors.success.main
                : colors.error.main,
            }}
          />
          <Chip
            icon={
              user.hasAudio ? (
                <Mic sx={{ color: colors.success.main }} />
              ) : (
                <MicOff sx={{ color: colors.error.main }} />
              )
            }
            label={user.hasAudio ? "Audio" : "No Audio"}
            size="small"
            variant="outlined"
            sx={{
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              fontSize: "0.6rem",
              height: "20px",
              borderColor: user.hasAudio
                ? colors.success.main
                : colors.error.main,
            }}
          />
        </Box>
      </Box>

      {/* Video Stats overlay - only show when user has video and showVideoStats is enabled */}
      {user.hasVideo && videoStats && showVideoStats && (
        <VideoStatsInfo videoStats={videoStats} position="bottom-right" />
      )}

      {user.hasVideo && !isFullscreen && (
        <>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: colors.background.overlay,
              color: colors.text.inverse,
              width: "24px",
              height: "24px",
              zIndex: 3,
              "&:hover": { bgcolor: colors.background.overlay + "CC" },
            }}
            onClick={handleQualityIconClick}
          >
            <Tune sx={{ fontSize: "14px" }} />
          </IconButton>
          <Menu
            anchorEl={qualityMenuAnchor}
            open={Boolean(qualityMenuAnchor)}
            onClose={handleQualityMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {qualityOptions.map((option) => (
              <MenuItem
                key={option.label}
                selected={option.value === zoomVideoQuality}
                onClick={() => handleZoomQualitySelect(option.value)}
              >
                <ListItemText>{option.label}</ListItemText>
                {option.value === zoomVideoQuality && (
                  <Check sx={{ fontSize: "14px", ml: 1 }} />
                )}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {/* Fullscreen button - only show when user has video and not in any fullscreen mode */}
      {/* {user.hasVideo && !isIndividualFullscreen && !isFullscreen && (
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: colors.background.overlay,
            color: colors.text.inverse,
            width: "32px",
            height: "32px",
            "&:hover": { bgcolor: colors.background.overlay + "CC" },
          }}
          onClick={toggleFullscreen}
        >
          <Fullscreen sx={{ fontSize: "16px" }} />
        </IconButton>
      )} */}
    </Paper>
  );
};

// SDK-specific video attachment functions
async function attachRemoteVideoForSDK(
  sdkType: string,
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any,
  zoomVideoQuality: ZoomVideoQuality = ZoomVideoQuality.Video_720P
): Promise<void> {
  switch (sdkType) {
    case "agora":
      await attachAgoraRemoteVideo(userId, container, currentSDK);
      break;
    case "twilio":
      await attachTwilioRemoteVideo(userId, container, currentSDK);
      break;
    case "zoom":
      await attachZoomRemoteVideo(userId, container, currentSDK, zoomVideoQuality);
      break;
    default:
      console.warn(`Unsupported SDK type for video attachment: ${sdkType}`);
  }
}

async function detachRemoteVideoForSDK(
  sdkType: string,
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): Promise<void> {
  switch (sdkType) {
    case "agora":
      detachAgoraRemoteVideo(userId, container, currentSDK);
      break;
    case "twilio":
      detachTwilioRemoteVideo(userId, container, currentSDK);
      break;
    case "zoom":
      await detachZoomRemoteVideo(userId, container, currentSDK);
      break;
    default:
      console.warn(`Unsupported SDK type for video detachment: ${sdkType}`);
  }
}

// Agora video attachment - matches AgoraSDK.onUserPublished implementation
async function attachAgoraRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): Promise<void> {
  if (!currentSDK?.agoraClient) return;

  const remoteUsers = currentSDK.agoraClient.remoteUsers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = remoteUsers.find((u: any) => u.uid.toString() === userId);

  if (user && user.videoTrack) {
    try {
      // Remove existing video elements
      const existingVideos = container.querySelectorAll("video");
      existingVideos.forEach((video) => video.remove());

      // Use Agora's play method to attach video directly to container
      user.videoTrack.play(container.id, {
        fit: "contain",
      });

      console.log(`Agora video attached to container: ${container.id}`);
    } catch (error) {
      console.error(
        `Failed to attach Agora video to container ${container.id}:`,
        error
      );
    }
  }
}

function detachAgoraRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): void {
  // Clear video elements - Agora automatically manages track cleanup
  const videos = container.querySelectorAll("video");
  videos.forEach((video) => video.remove());
}

// Twilio video attachment - matches TwilioSDK.onTrackSubscribed implementation
async function attachTwilioRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): Promise<void> {
  if (!currentSDK?.room) return;

  const participant = Array.from(currentSDK.room.participants.values()).find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.identity === userId
  );

  if (participant) {
    // Use proper type assertion for Twilio participant
    const twilioParticipant = participant as {
      videoTracks: Map<
        string,
        { isSubscribed: boolean; track?: { attach: () => HTMLVideoElement } }
      >;
    };

    const videoTrack = Array.from(twilioParticipant.videoTracks.values()).find(
      (track) => track.isSubscribed
    )?.track;

    if (videoTrack) {
      try {
        // Remove existing video elements
        const existingVideos = container.querySelectorAll("video");
        existingVideos.forEach((video) => video.remove());

        // Use Twilio's attach method to create video element
        const videoElement = videoTrack.attach();

        // Apply styles to ensure video fits container
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "contain";

        // Add to container
        container.appendChild(videoElement);

        console.log(`Twilio video attached to container: ${container.id}`);
      } catch (error) {
        console.error(
          `Failed to attach Twilio video to container ${container.id}:`,
          error
        );
      }
    }
  }
}

function detachTwilioRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): void {
  // Twilio automatically manages track cleanup, just clear the container
  const videos = container.querySelectorAll("video");
  videos.forEach((video) => video.remove());
}

// Zoom video attachment - matches ZoomSDK.attachRemoteVideo implementation
async function attachZoomRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any,
  zoomVideoQuality: ZoomVideoQuality
): Promise<void> {
  if (!currentSDK?.mediaStream) return;

  try {
    // Always clear existing video/canvas elements before attaching new ones
    // const existingElements = container.querySelectorAll("video, canvas");
    // existingElements.forEach((element) => element.remove());
    // console.log(
    //   `Cleared ${existingElements.length} existing elements from container`
    // );

    const videoElement = await currentSDK.mediaStream.attachVideo(
      parseInt(userId, 10),
      zoomVideoQuality
    );

    console.log("Zoom video attached to videoElement", videoElement);

    if (
      videoElement &&
      typeof videoElement === "object" &&
      "tagName" in videoElement
    ) {
      // Apply styling exactly as in ZoomSDK
      (videoElement as HTMLElement).style.width = "100%";
      (videoElement as HTMLElement).style.height = "100%";

      // for VideoSDK old version testing: old version video-player should add width and height
      // (videoElement as HTMLElement).style.width = "100%";
      // (videoElement as HTMLElement).style.aspectRatio = "16/9";

      container.appendChild(videoElement as HTMLElement);

      console.log(`Zoom video attached to container: ${container.id}`);
    }
  } catch (error) {
    console.error(`Failed to attach Zoom video for user ${userId}:`, error);
  }
}

async function detachZoomRemoteVideo(
  userId: string,
  container: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSDK: any
): Promise<void> {
  // For Zoom, we need to use the SDK's detachVideo method if available
  if (currentSDK?.mediaStream) {
    try {
      // Use Zoom's detachVideo API to properly clean up
      // Convert userId to number for Zoom SDK
      const elements = await currentSDK.mediaStream.detachVideo(
        parseInt(userId, 10)
      );

      console.log("detachZoomRemoteVideo elements", elements);

      // Remove elements returned by Zoom SDK
      if (Array.isArray(elements)) {
        elements.forEach((e) => e.remove());
      } else if (elements && typeof elements.remove === "function") {
        elements.remove();
      }
    } catch (error) {
      console.warn(`Failed to detach Zoom video for user ${userId}:`, error);
    }
  }

  // Also manually clear any remaining video/canvas elements from the container
  // This is a fallback to ensure clean state
  const remainingElements = container.querySelectorAll("video, canvas");
  remainingElements.forEach((element) => element.remove());

  console.log(`Zoom video detached for user ${userId}, container cleared`);
}
