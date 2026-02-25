import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Box, Alert, Menu, MenuItem } from "@mui/material";

import { RootState, AppDispatch } from "../../Redux/store";
import {
  updateRemoteUserVideoTrackStats,
  updateLocalVideoStats,
  updateSelectedPlaybackFile,
  updateCurrentCameraById,
  updateCurrentMicrophoneById,
  updateCurrentSpeakerById,
  clearMeetingState,
  setLoginInfo,
  updateIsVideoEnabled,
  updateIsAudioEnabled,
} from "../../Redux/meetingSlice";
import { sdkManager } from "../../managers/SDKManager";
import { RoutePath } from "../../Route";
import { VIDEOSDKCOMPARE_API_BASE_URL } from "../../config";

import {
  MeetingToolbar,
  ControlBar,
  DeviceMenu,
  UserList,
  StatisticsPanel,
  VideoGrid,
  SelfView,
} from "./components";

const baseURL = VIDEOSDKCOMPARE_API_BASE_URL;
const VB_STORAGE_KEY = "videosdkcompare.vb.preset";
const VB_PRESETS = [
  { id: "studio", label: "Studio", url: "/videosdkcompare-assets/vb/studio.svg" },
  { id: "office", label: "Office", url: "/videosdkcompare-assets/vb/office.svg" },
  { id: "sunset", label: "Sunset", url: "/videosdkcompare-assets/vb/sunset.svg" },
];

interface VideoStats {
  codecType?: string;
  sendFrameRate?: number;
  receiveFrameRate?: number;
  sendBitrate?: number;
  receiveBitrate?: number;
  sendResolutionWidth?: number;
  sendResolutionHeight?: number;
  receiveResolutionWidth?: number;
  receiveResolutionHeight?: number;
  transportDelay?: number;
  packetLossRate?: number;
}

const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginInfo = useSelector((state: RootState) => state.meeting.loginInfo);
  const currentUser = useSelector(
    (state: RootState) => state.meeting.currentUser
  );
  const remoteUsers = useSelector(
    (state: RootState) => state.meeting.remoteUsers
  );
  const deviceList = useSelector(
    (state: RootState) => state.meeting.deviceList
  );
  const networkLevel = useSelector(
    (state: RootState) => state.meeting.networkLevel
  );
  const connectionState = useSelector(
    (state: RootState) => state.meeting.connectionState
  );
  const autoJoinConfig = useSelector(
    (state: RootState) => state.meeting.autoJoinConfig
  );

  const remoteUserIds = Object.keys(remoteUsers);
  const remoteUserCount = remoteUserIds.length;

  // State management
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [deviceMenuAnchor, setDeviceMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [userListAnchor, setUserListAnchor] = useState<null | HTMLElement>(
    null
  );
  const [localStats, setLocalStats] = useState<VideoStats | null>(null);
  const [remoteStats, setRemoteStats] = useState<{ [uid: string]: VideoStats }>(
    {}
  );
  const [networkQuality, setNetworkQuality] = useState({
    uplink: 0,
    downlink: 0,
  });

  const [error, setError] = useState<string>("");

  // Statistics panel related state
  const [statsTabIndex, setStatsTabIndex] = useState(1);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  // Main view fullscreen state
  const [isMainViewFullscreen, setIsMainViewFullscreen] = useState(false);

  // Self view fullscreen state
  const [isSelfFull, setIsSelfFull] = useState(false);

  // Video stats display state
  const [showVideoStats, setShowVideoStats] = useState(false);

  // Add useRef for autoJoinConfig to avoid dependency loop
  const autoJoinConfigRef = useRef(autoJoinConfig);

  // Ref to track if auto-enable media has been attempted
  const autoEnableAttemptedRef = useRef(false);

  // State to track if joinAudio has completed (required before startAudio for Zoom SDK)
  const [isAudioJoined, setIsAudioJoined] = useState(false);
  const [isVirtualBackgroundSupported, setIsVirtualBackgroundSupported] =
    useState(false);
  const [isVirtualBackgroundEnabled, setIsVirtualBackgroundEnabled] =
    useState(false);
  const [isVirtualBackgroundLoading, setIsVirtualBackgroundLoading] =
    useState(false);
  const [vbPresetAnchorEl, setVbPresetAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const vbFileInputRef = useRef<HTMLInputElement>(null);
  const currentVirtualBackgroundUrlRef = useRef<string | null>(null);
  const autoAppliedPresetRef = useRef(false);

  const isZoomSDK = useMemo(
    () => sdkManager.getCurrentSDKType() === "zoom",
    []
  );

  const updateStats = useCallback(async () => {
    const localVideoStats = await sdkManager.getLocalVideoStats();
    const remoteVideoStats = await sdkManager.getRemoteVideoStats();

    if (localVideoStats) {
      setLocalStats(localVideoStats);
      dispatch(updateLocalVideoStats(localVideoStats));
    }

    if (remoteVideoStats) {
      setRemoteStats(remoteVideoStats);
      dispatch(updateRemoteUserVideoTrackStats(remoteVideoStats));
    }
  }, [dispatch]);

  // Upgrade callbacks with UI handling
  useLayoutEffect(() => {
    if (!sdkManager.isInitialized()) {
      navigate(RoutePath.Login);
      return;
    }

    // Upgrade callbacks with full UI handling
    sdkManager.setExtendedCallbacks(dispatch, {
      setError,
      setNetworkQuality,
    });

    // Cleanup function to clear callbacks when component unmounts
    return () => {
      sdkManager.clearCallbacks();
    };
  }, [dispatch, navigate]);

  // Track if joinAudio has been executed
  const hasJoinedAudioRef = useRef(false);

  const getPlaybackUrl = useCallback(() => {
    return deviceList.selectedPlaybackFile
      ? `${baseURL}/zoom-assets/${deviceList.selectedPlaybackFile}`
      : "";
  }, [deviceList.selectedPlaybackFile]);

  // Join audio for Zoom SDK (required before startAudio) - runs only once
  useEffect(() => {
    if (hasJoinedAudioRef.current) return;

    const joinAudioForZoom = async () => {
      if (isZoomSDK) {
        hasJoinedAudioRef.current = true;
        try {
          console.log("Joining audio for Zoom SDK...");

          const playbackUrl = getPlaybackUrl();

          const deviceId = playbackUrl ? playbackUrl : "";
          await sdkManager.joinAudio(deviceId);

          if (deviceId) {
            await sdkManager.setDevice("playback", deviceId);
          }

          setIsAudioJoined(true);
          console.log("Audio joined successfully");
        } catch (error) {
          console.error("Failed to join audio:", error);
          setIsAudioJoined(false);
        }
      } else {
        // For non-Zoom SDKs, no joinAudio required
        hasJoinedAudioRef.current = true;
        setIsAudioJoined(false);
      }
    };

    joinAudioForZoom();
  }, [deviceList.selectedPlaybackFile, getPlaybackUrl, isZoomSDK]);

  useEffect(() => {
    let isMounted = true;
    const detectVirtualBackgroundSupport = async () => {
      if (!isZoomSDK || !sdkManager.isInitialized()) {
        if (isMounted) {
          setIsVirtualBackgroundSupported(false);
          setIsVirtualBackgroundEnabled(false);
        }
        return;
      }

      const supported = await sdkManager.isVirtualBackgroundSupported();
      if (isMounted) {
        setIsVirtualBackgroundSupported(supported);
      }
    };

    detectVirtualBackgroundSupport();
    return () => {
      isMounted = false;
    };
  }, [isZoomSDK]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPreset = window.localStorage.getItem(VB_STORAGE_KEY);
    if (savedPreset) {
      setSelectedPresetId(savedPreset);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (currentVirtualBackgroundUrlRef.current) {
        URL.revokeObjectURL(currentVirtualBackgroundUrlRef.current);
        currentVirtualBackgroundUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const autoApplyPreset = async () => {
      if (
        autoAppliedPresetRef.current ||
        !selectedPresetId ||
        !isZoomSDK ||
        !isVirtualBackgroundSupported ||
        !isVideoEnabled
      ) {
        return;
      }

      const preset = VB_PRESETS.find((item) => item.id === selectedPresetId);
      if (!preset) {
        return;
      }

      autoAppliedPresetRef.current = true;
      try {
        setIsVirtualBackgroundLoading(true);
        await sdkManager.applyVirtualBackground(preset.url);
        setIsVirtualBackgroundEnabled(true);
      } catch (error) {
        console.warn("Auto-apply virtual background failed:", error);
      } finally {
        setIsVirtualBackgroundLoading(false);
      }
    };

    autoApplyPreset();
  }, [selectedPresetId, isZoomSDK, isVirtualBackgroundSupported, isVideoEnabled]);

  useEffect(() => {
    console.log(
      "self: isVideoEnabled, isAudioEnabled",
      isVideoEnabled,
      isAudioEnabled
    );

    dispatch(updateIsVideoEnabled(isVideoEnabled));
    dispatch(updateIsAudioEnabled(isAudioEnabled));
  }, [isVideoEnabled, isAudioEnabled, dispatch]);

  // Update ref when autoJoinConfig changes
  useEffect(() => {
    console.log("autoJoinConfig", autoJoinConfig);
    autoJoinConfigRef.current = autoJoinConfig;
  }, [autoJoinConfig]);

  // Auto-enable media when devices are ready (explicit condition checking)
  useEffect(() => {
    // Skip if not auto join or already attempted
    if (!autoJoinConfig.isAutoJoin || autoEnableAttemptedRef.current) {
      return;
    }

    const currentCamera = deviceList.camera.current;
    // const currentMicrophone = deviceList.microphone.current;

    // Check if required devices are ready based on what needs to be enabled
    const needCamera = autoJoinConfig.enableVideo;
    const needMicrophone = autoJoinConfig.enableAudio;

    if (needCamera && !currentCamera.deviceId) {
      console.log("Auto-enable: Waiting for camera device to be ready...");
      return;
    }

    // if (needMicrophone && !currentMicrophone.deviceId) {
    //   console.log("Auto-enable: Waiting for microphone device to be ready...");
    //   return;
    // }

    // Wait for joinAudio to complete before startAudio (required for Zoom SDK)
    if (needMicrophone && !isAudioJoined) {
      console.log("Auto-enable: Waiting for audio to be joined...");
      return;
    }

    // If neither video nor audio is enabled, still proceed for other settings (like selfFull)
    // But ensure at least one device is ready to confirm initialization is complete
    if (!needCamera && !needMicrophone && !currentCamera.deviceId) {
      return;
    }

    // Mark as attempted to prevent multiple executions
    autoEnableAttemptedRef.current = true;

    // Use mounted flag to prevent setState on unmounted component
    let isMounted = true;

    const enableMedia = async () => {
      try {
        console.log("Auto-enable: Starting media initialization...");

        const playbackUrl = getPlaybackUrl();

        // Enable video if configured
        const videoFlag = !!autoJoinConfig.enableVideo;
        if (videoFlag) {
          const deviceId = currentCamera.deviceId;

          console.log(
            "Auto-enable: Starting video with camera deviceId",
            deviceId
          );

          // videoSDK has bug, if set device id in login presetDevice function, sdk throw  "Cannot find cameraDeviceId in camera devices list." error
          // so here shold pass deviceId to startVideo function
          await sdkManager.startVideo(
            true,
            playbackUrl ? playbackUrl : deviceId
          );
          if (isMounted) {
            setIsVideoEnabled(true);
            console.log("Auto-enable: Video enabled");
          }
        }

        // Enable audio if configured (joinAudio already completed)
        const audioFlag = !!autoJoinConfig.enableAudio;
        await sdkManager.startAudio(audioFlag);
        if (isMounted) {
          setIsAudioEnabled(audioFlag);
          console.log("Auto-enable: Audio", audioFlag ? "enabled" : "disabled");
        }

        // Set self fullscreen state if configured
        if (isMounted && autoJoinConfig.selfFull) {
          setIsSelfFull(true);
          console.log("Auto-enable: Self fullscreen enabled");
        }

        console.log("Auto-enable: Media initialization completed");
      } catch (error) {
        console.warn("Auto-enable: Failed to enable media:", error);
      }
    };

    enableMedia();

    // Cleanup: mark as unmounted to prevent setState after unmount
    return () => {
      isMounted = false;
    };
  }, [autoJoinConfig, deviceList.camera, isAudioJoined, getPlaybackUrl]);

  useEffect(() => {
    if (!sdkManager.isInitialized()) {
      navigate(RoutePath.Login);
      return;
    }

    // Start stats update interval
    const statsInterval = setInterval(updateStats, 1000);

    return () => {
      clearInterval(statsInterval);
    };
  }, [navigate, updateStats]);

  // Event handlers
  const handleToggleVideo = async () => {
    try {
      const newState = !isVideoEnabled;

      console.log("handleToggleVideo newState:", newState);

      if (newState) {
        const currentCamera = deviceList.camera.current;

        const deviceId = deviceList.selectedPlaybackFile
          ? getPlaybackUrl()
          : currentCamera.deviceId;

        console.log("handleToggleVideo: ", deviceId);

        await sdkManager.startVideo(true, deviceId);
        setIsVideoEnabled(true);
      } else {
        await sdkManager.startVideo(false);
        setIsVideoEnabled(false);
      }
    } catch (error) {
      console.error("Failed to toggle video:", error);
      setError("Failed to toggle video");
    }
  };

  const handleToggleAudio = async () => {
    try {
      // Ensure joinAudio has completed before startAudio (required for Zoom SDK)
      if (!isAudioJoined && isZoomSDK) {
        console.warn("Audio not yet joined, please wait...");
        setError("Audio is still initializing, please try again");
        return;
      }

      const newState = !isAudioEnabled;

      console.log("handleToggleAudio newState:", newState);
      if (newState) {
        const currentMicrophone = deviceList.microphone.current;
        const deviceId = deviceList.selectedPlaybackFile
          ? getPlaybackUrl()
          : currentMicrophone.deviceId;

        console.log("current microphone: ", deviceId);

        await sdkManager.startAudio(true, deviceId);
        setIsAudioEnabled(true);
      } else {
        await sdkManager.startAudio(false);
        setIsAudioEnabled(false);
      }
    } catch (error) {
      console.error("Failed to toggle audio:", error);
      setError("Failed to toggle audio");
    }
  };

  const handleLeave = async () => {
    try {
      console.error("<=== handleLeave =====>");
      await sdkManager.leave();
      if (currentVirtualBackgroundUrlRef.current) {
        URL.revokeObjectURL(currentVirtualBackgroundUrlRef.current);
        currentVirtualBackgroundUrlRef.current = null;
      }
      // 清理Redux缓存的状态信息
      dispatch(setLoginInfo({ sabMode: "no-sab" }));
      dispatch(clearMeetingState());
      navigate(RoutePath.Login);
    } catch (error) {
      console.error("Failed to leave meeting:", error);
      setError("Failed to leave meeting");
    }
  };
  // to auto test easily
  window.VideoCompare.leaveMeeting = handleLeave;

  const handleDeviceChange = async (
    type: "camera" | "microphone" | "speaker" | "playback",
    deviceId: string
  ) => {
    console.log("handleDeviceChange type:", type, "deviceId:", deviceId);
    try {
      console.log(`Changing ${type} device to: ${deviceId}`);

      if (type === "playback") {
        dispatch(updateCurrentCameraById(""));
        dispatch(updateSelectedPlaybackFile(deviceId));

        const playbackUrl = `${baseURL}/zoom-assets/${deviceId}`;
        await sdkManager.setDevice("playback", playbackUrl);
      } else {
        const switchConsistent = deviceList.selectedPlaybackFile ? true : false;
        dispatch(updateSelectedPlaybackFile(null));

        await sdkManager.setDevice(type, deviceId);
        if (type === "camera") {
          dispatch(updateCurrentCameraById(deviceId));
          if (switchConsistent) {
            await sdkManager.setDevice(
              "microphone",
              deviceList.microphone.current.deviceId
            );
          }
        } else if (type === "microphone") {
          dispatch(updateCurrentMicrophoneById(deviceId));
        } else if (type === "speaker") {
          dispatch(updateCurrentSpeakerById(deviceId));
        }
      }

      setDeviceMenuAnchor(null);
    } catch (error) {
      console.error(`Failed to change ${type}:`, error);
      setError(`Failed to change ${type}`);
    }
  };

  const handleDeviceMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setDeviceMenuAnchor(event.currentTarget);
  };

  const handleUserListClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserListAnchor(event.currentTarget);
  };

  const handleStatsClick = () => {
    setIsStatsExpanded(!isStatsExpanded);
  };

  const handleVideoStatsToggle = () => {
    setShowVideoStats(!showVideoStats);
  };

  const handleMainViewFullscreenToggle = () => {
    setIsMainViewFullscreen(!isMainViewFullscreen);
  };

  const handleVirtualBackgroundSelect = () => {
    vbFileInputRef.current?.click();
  };

  const handleVirtualBackgroundFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file for virtual background");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    try {
      setIsVirtualBackgroundLoading(true);
      await sdkManager.applyVirtualBackground(imageUrl);
      if (currentVirtualBackgroundUrlRef.current) {
        URL.revokeObjectURL(currentVirtualBackgroundUrlRef.current);
      }
      currentVirtualBackgroundUrlRef.current = imageUrl;
      setIsVirtualBackgroundEnabled(true);
      setSelectedPresetId(null);
      autoAppliedPresetRef.current = true;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(VB_STORAGE_KEY);
      }
    } catch (error) {
      URL.revokeObjectURL(imageUrl);
      console.error("Failed to apply virtual background:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to apply virtual background"
      );
    } finally {
      setIsVirtualBackgroundLoading(false);
    }
  };

  const handleVirtualBackgroundClear = async () => {
    try {
      setIsVirtualBackgroundLoading(true);
      await sdkManager.clearVirtualBackground();
      setIsVirtualBackgroundEnabled(false);
      setSelectedPresetId(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(VB_STORAGE_KEY);
      }
      autoAppliedPresetRef.current = false;
      if (currentVirtualBackgroundUrlRef.current) {
        URL.revokeObjectURL(currentVirtualBackgroundUrlRef.current);
        currentVirtualBackgroundUrlRef.current = null;
      }
    } catch (error) {
      console.error("Failed to clear virtual background:", error);
      setError("Failed to clear virtual background");
    } finally {
      setIsVirtualBackgroundLoading(false);
    }
  };

  const handleVirtualBackgroundPresetClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setVbPresetAnchorEl(event.currentTarget);
  };

  const handleVirtualBackgroundPresetApply = async (presetId: string) => {
    const preset = VB_PRESETS.find((item) => item.id === presetId);
    setVbPresetAnchorEl(null);
    if (!preset) return;

    try {
      setIsVirtualBackgroundLoading(true);
      await sdkManager.applyVirtualBackground(preset.url);
      setIsVirtualBackgroundEnabled(true);
      setSelectedPresetId(preset.id);
      autoAppliedPresetRef.current = true;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(VB_STORAGE_KEY, preset.id);
      }
    } catch (error) {
      console.error("Failed to apply preset virtual background:", error);
      setError("Failed to apply preset virtual background");
    } finally {
      setIsVirtualBackgroundLoading(false);
    }
  };

  // handle css fullscreen state change
  const handleRemoteFullscreenChange = useCallback(
    (isUseCSSMode: boolean, isFullscreen: boolean) => {
      console.log(
        "handleRemoteFullscreenChange:",
        isUseCSSMode,
        isFullscreen,
        autoJoinConfig.remoteFull
      );
    },
    [autoJoinConfig.remoteFull]
  );

  const handleSelfFullscreenChange = useCallback(
    (isUseCSSMode: boolean, isFullscreen: boolean) => {
      console.log(
        "handleSelfFullscreenChange: ",
        isUseCSSMode,
        isFullscreen,
        autoJoinConfig.selfFull
      );
    },

    [autoJoinConfig.selfFull]
  );

  if (!loginInfo) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          No login information found. Please login first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <MeetingToolbar
        sessionName={loginInfo.sessionName || "Meeting"}
        sdkType={loginInfo.sdk || "Unknown"}
        userName={currentUser?.userName || String(loginInfo.userName) || "User"}
        userId={currentUser?.uid || "local"}
        remoteUserCount={remoteUserCount}
        onUserListClick={handleUserListClick}
        onStatsClick={handleStatsClick}
        onVideoStatsToggle={handleVideoStatsToggle}
        showVideoStats={showVideoStats}
        videoMode={loginInfo.videoMode}
        audioMode={loginInfo.audioMode}
      />

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {/* Video grid */}
        <VideoGrid
          remoteUsers={remoteUsers}
          isMainViewFullscreen={isMainViewFullscreen}
          showVideoStats={showVideoStats}
          remoteFull={autoJoinConfig.remoteFull} // main view fullscreen state
          onFullscreenChange={handleRemoteFullscreenChange}
        />

        {/* Control bar */}
        <ControlBar
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isAudioJoined={isAudioJoined}
          onToggleVideo={handleToggleVideo}
          onToggleAudio={handleToggleAudio}
          onLeave={handleLeave}
          onDeviceMenuClick={handleDeviceMenuClick}
          onMainViewFullscreenToggle={handleMainViewFullscreenToggle}
          isVirtualBackgroundSupported={isVirtualBackgroundSupported}
          isVirtualBackgroundEnabled={isVirtualBackgroundEnabled}
          isVirtualBackgroundLoading={isVirtualBackgroundLoading}
          onVirtualBackgroundSelect={handleVirtualBackgroundSelect}
          onVirtualBackgroundClear={handleVirtualBackgroundClear}
          onVirtualBackgroundPresetClick={handleVirtualBackgroundPresetClick}
        />
      </Box>

      {/* Self view - independent draggable component */}
      <SelfView
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        userName={currentUser?.userName || String(loginInfo.userName) || "User"}
        userId={currentUser?.uid || "local"}
        showVideoStats={showVideoStats}
        isSelfFull={isSelfFull}
        onSelfFullscreenChange={handleSelfFullscreenChange}
      />

      {/* Statistics panel */}
      {isStatsExpanded && (
        <StatisticsPanel
          isExpanded={isStatsExpanded}
          onToggleExpand={() => setIsStatsExpanded(false)}
          tabIndex={statsTabIndex}
          onTabChange={setStatsTabIndex}
          localStats={localStats}
          remoteStats={remoteStats}
          remoteUsers={remoteUsers}
          networkQuality={networkQuality}
          networkLevel={networkLevel}
          connectionState={connectionState}
        />
      )}

      {/* Device menu */}
      <DeviceMenu
        anchorEl={deviceMenuAnchor}
        onClose={() => setDeviceMenuAnchor(null)}
        cameras={deviceList.camera.list}
        microphones={deviceList.microphone.list}
        speakers={deviceList.speaker.list}
        selectedPlaybackFile={deviceList.selectedPlaybackFile}
        currentCamera={deviceList.camera.current}
        currentMicrophone={deviceList.microphone.current}
        currentSpeaker={deviceList.speaker.current}
        onCameraSelect={(deviceId) => handleDeviceChange("camera", deviceId)}
        onMicrophoneSelect={(deviceId) =>
          handleDeviceChange("microphone", deviceId)
        }
        onSpeakerSelect={(deviceId) => handleDeviceChange("speaker", deviceId)}
        enablePlaybackFile={loginInfo.enablePlaybackFile}
        onPlaybackSelect={(filename) =>
          handleDeviceChange("playback", filename)
        }
      />

      {/* User list */}
      <UserList
        anchorEl={userListAnchor}
        onClose={() => setUserListAnchor(null)}
        currentUser={
          currentUser || {
            uid: "local",
            userName: String(loginInfo.userName),
            hasAudio: isAudioEnabled,
            hasVideo: isVideoEnabled,
          }
        }
        remoteUsers={remoteUsers}
      />

      <input
        ref={vbFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleVirtualBackgroundFileChange}
        style={{ display: "none" }}
      />

      <Menu
        anchorEl={vbPresetAnchorEl}
        open={Boolean(vbPresetAnchorEl)}
        onClose={() => setVbPresetAnchorEl(null)}
      >
        {VB_PRESETS.map((preset) => (
          <MenuItem
            key={preset.id}
            selected={selectedPresetId === preset.id}
            onClick={() => handleVirtualBackgroundPresetApply(preset.id)}
          >
            {preset.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default Meeting;
