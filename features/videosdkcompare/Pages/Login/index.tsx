import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { RoutePath } from "../../Route";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  VideoCall as VideoCallIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import type { RootState, AppDispatch } from "../../Redux/store";
import {
  updateSelectedPlaybackFile,
  setLoginInfo,
  setAutoJoinConfig,
  updateCameraList,
  updateMicrophoneList,
  updateSpeakerList,
  updateCurrentCameraById,
  updateCurrentMicrophoneById,
  updateCurrentSpeakerById,
} from "../../Redux/meetingSlice";

import { sdkManager } from "../../managers/SDKManager";
import {
  SDKType,
  AgoraVideoCodec,
  AgoraAudioCodec,
  TwilioVideoCodec,
  TwilioAudioCodec,
  ZoomVideoCodec,
  ZoomAudioCodec,
  ZoomVideoMode,
  ZoomAudioMode,
} from "../../types/sdk";
import { colors } from "../../theme/colors";
import { getSDKVersion } from "../../utils/versionInfo";

// Codec configuration for each SDK
const CODEC_CONFIG = {
  agora: {
    video: [
      { value: "h264" as AgoraVideoCodec, label: "H.264" },
      { value: "vp8" as AgoraVideoCodec, label: "VP8" },
      { value: "vp9" as AgoraVideoCodec, label: "VP9" },
      { value: "h265" as AgoraVideoCodec, label: "H.265" },
    ],
    audio: [
      { value: "opus" as AgoraAudioCodec, label: "Opus" },
      { value: "aac" as AgoraAudioCodec, label: "AAC" },
      { value: "g711" as AgoraAudioCodec, label: "G.711" },
    ],
  },
  twilio: {
    video: [
      { value: "H264" as TwilioVideoCodec, label: "H.264" },
      { value: "VP8" as TwilioVideoCodec, label: "VP8" },
      { value: "VP9" as TwilioVideoCodec, label: "VP9" },
    ],
    audio: [
      { value: "opus" as TwilioAudioCodec, label: "Opus" },
      { value: "isac" as TwilioAudioCodec, label: "iSAC" },
      { value: "PCMA" as TwilioAudioCodec, label: "PCMA (G.711 A-law)" },
      { value: "PCMU" as TwilioAudioCodec, label: "PCMU (G.711 μ-law)" },
    ],
  },
  zoom: {
    video: [
      { value: "" as ZoomVideoCodec, label: "H.264" },
      { value: "" as ZoomVideoCodec, label: "VP8" },
      { value: "" as ZoomVideoCodec, label: "VP9" },
    ],
    audio: [
      { value: "" as ZoomAudioCodec, label: "Opus" },
      { value: "" as ZoomAudioCodec, label: "AAC" },
    ],
    videoMode: [
      { value: "webrtc" as ZoomVideoMode, label: "WebRTC" },
      { value: "wasm" as ZoomVideoMode, label: "WASM" },
    ],
    audioMode: [
      { value: "webrtc" as ZoomAudioMode, label: "WebRTC" },
      { value: "wasm" as ZoomAudioMode, label: "WASM" },
    ],
  },
} as const;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginInfo = useSelector((state: RootState) => state.meeting.loginInfo);
  const autoJoinConfig = useSelector(
    (state: RootState) => state.meeting.autoJoinConfig
  );
  const isAutoJoin = autoJoinConfig.isAutoJoin;

  // Form state
  const [formData, setFormData] = useState(() => {
    const sdk = loginInfo.sdk || "agora";
    const sdkConfig = CODEC_CONFIG[sdk as keyof typeof CODEC_CONFIG];

    return {
      sdk,
      sdkKey: loginInfo.sdkKey,
      sdkSecret: loginInfo.sdkSecret,
      userName: loginInfo.userName,
      sessionName: loginInfo.sessionName,
      role: loginInfo.role,
      videoCodec: loginInfo.videoCodec || sdkConfig?.video[0].value || "h264",
      audioCodec: loginInfo.audioCodec || sdkConfig?.audio[0].value || "opus",
      sdkMode: loginInfo.sdkMode || "rtc",
      enableDualStream: loginInfo.enableDualStream,
      enableAudioDenoiser: loginInfo.enableAudioDenoiser,
      enableBuiltInDenoiser: loginInfo.enableBuiltInDenoiser,
      // Zoom-specific modes
      videoMode: loginInfo.videoMode || (sdk === "zoom" ? "webrtc" : undefined),
      audioMode: loginInfo.audioMode || (sdk === "zoom" ? "webrtc" : undefined),
      // Zoom MediaSDK Hash
      mediaSdkHash: loginInfo.mediaSdkHash || "",
      // Zoom Playback File
      enablePlaybackFile: loginInfo.enablePlaybackFile || false,
    };
  });

  // Use ref to track current formData without causing dependency issues
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [advancedConfigExpanded, setAdvancedConfigExpanded] = useState(true);

  useEffect(() => {
    window.VideoCompare = {};
    // clean disableNS from localStorage
    localStorage.removeItem("disableNS");

    // Clean up previous session if SDK was initialized
    const cleanup = async () => {
      if (sdkManager.isInitialized()) {
        try {
          await sdkManager.leave();
          console.log("Previous session cleaned up");
        } catch (error) {
          console.warn("Failed to clean up previous session:", error);
        }
      }
    };

    cleanup();
  }, []);

  // Parse URL parameters and set form data
  useLayoutEffect(() => {
    const parseUrlParams = () => {
      try {
        // Get the current URL
        const currentUrl = window.location.href;

        // Check if URL contains encoded parameters
        if (currentUrl.includes("?")) {
          let urlToParse = currentUrl;

          // If URL is encoded, decode it first
          // if (currentUrl.includes("%3F")) {
          urlToParse = decodeURI(currentUrl);
          // }

          console.log("decodeURIComponent currentUrl", urlToParse);

          const url = new URL(urlToParse);
          const params = new URLSearchParams(url.search);

          console.log("params", params, params.entries());

          // Only apply parameters if SDK is zoom
          if (formDataRef.current.sdk === "zoom") {
            const role = params.get("role") === "1" ? "host" : "audience";

            const autoJoinConfig = {
              isAutoJoin: true,
              sdkKey: params.get("sdkKey") || "",
              sdkSecret: params.get("sdkSecret") || "",

              sessionName: params.get("topic") || "",
              userName: params.get("userName") || "",
              role: role,
              videoMode: params.get("videoMode") || "webrtc",
              audioMode: params.get("audioMode") || "webrtc",

              cameraName: params.get("cameraName") || "",
              microphoneName: params.get("microphoneName") || "",
              speakerName: params.get("speakerName") || "",

              selfFull: params.get("selfFull") === "true",
              remoteFull: params.get("remoteFull") === "true",
              enableVideo: params.get("enableVideo") === "true",
              enableAudio: params.get("enableAudio") === "true",

              mediaSdkHash: params.get("mediaSdkHash") || "",

              enablePlaybackFile: params.get("enablePlaybackFile") === "true",

              enableAudioDenoiser: params.get("enableAudioDenoiser") === "true",
              enableBuiltInDenoiser:
                params.get("enableBuiltInDenoiser") === "true",
            };

            console.log("login autoJoinConfig", autoJoinConfig);

            dispatch(setAutoJoinConfig(autoJoinConfig));

            const newFormData = {
              ...formDataRef.current,

              sdkKey: params.get("sdkKey") || "",
              sdkSecret: params.get("sdkSecret") || "",
              sessionName: params.get("topic") || "",
              userName: params.get("userName") || "",
              role: role,
              videoMode: (params.get("videoMode") || "webrtc") as ZoomVideoMode,
              audioMode: (params.get("audioMode") || "webrtc") as ZoomAudioMode,
              mediaSdkHash: params.get("mediaSdkHash") || "",
              enablePlaybackFile: params.get("enablePlaybackFile") === "true",
              enableAudioDenoiser: params.get("enableAudioDenoiser") === "true",
              enableBuiltInDenoiser:
                params.get("enableBuiltInDenoiser") === "true",
            };

            // Update form data (visible fields)
            setFormData(newFormData);
          }
        }
      } catch (error) {
        console.error("Failed to parse URL parameters:", error);
      }
    };

    // Parse URL parameters when component mounts
    parseUrlParams();
  }, [dispatch]); // Only re-run when SDK changes

  const validateForm = useCallback((): boolean => {
    if (!formData.userName) {
      setError("Please enter username");
      return false;
    }
    if (!formData.sessionName || formData.sessionName.trim() === "") {
      setError("Please enter Topic");
      return false;
    }
    if (formData.sdk === "zoom") {
      if (!String(formData.sdkKey || "").trim()) {
        setError("Please enter Zoom SDK Key");
        return false;
      }
      if (!String(formData.sdkSecret || "").trim()) {
        setError("Please enter Zoom SDK Secret");
        return false;
      }
    }
    // if (formData.sdk === "agora" && !formData.appId && !formData.token) {
    //   setError("Agora SDK requires App ID or Token");
    //   return false;
    // }

    // if (formData.sdk === "twilio" && !formData.token) {
    //   setError("Twilio SDK requires Access Token");
    //   return false;
    // }
    return true;
  }, [formData.userName, formData.sessionName, formData.sdk, formData.sdkKey, formData.sdkSecret]);

  const presetDevice = useCallback(async () => {
    // Get device list from SDK manager
    const deviceList = await sdkManager.getDeviceList();
    console.log("presetDevice deviceList ==>", deviceList);

    // Update Redux with device lists
    dispatch(updateCameraList(deviceList.cameras));
    dispatch(updateMicrophoneList(deviceList.microphones));
    dispatch(updateSpeakerList(deviceList.speakers));

    // Helper function to find device with priority:
    // 1. Auto join config device name (if configured)
    // 2. Device with "default" in label
    // 3. First device in list
    const findDeviceId = (
      devices: { deviceId: string; label: string }[],
      autoJoinName?: string
    ): string => {
      if (autoJoinConfig.isAutoJoin && autoJoinName) {
        const autoJoinDevice = devices.find((d) =>
          d.label.toLowerCase().includes(autoJoinName.toLowerCase())
        );
        if (autoJoinDevice) return autoJoinDevice.deviceId;
      }

      const defaultDevice = devices.find((d) =>
        d.label.toLowerCase().includes("default")
      );
      return defaultDevice?.deviceId || devices[0]?.deviceId || "";
    };

    // Find current devices with priority logic
    const currentCameraId = findDeviceId(
      deviceList.cameras,
      autoJoinConfig.cameraName
    );
    const currentMicrophoneId = findDeviceId(
      deviceList.microphones,
      autoJoinConfig.microphoneName
    );
    const currentSpeakerId = findDeviceId(
      deviceList.speakers,
      autoJoinConfig.speakerName
    );

    console.log("presetDevice selected devices ==>", {
      isAutoJoin: autoJoinConfig.isAutoJoin,
      camera: currentCameraId,
      microphone: currentMicrophoneId,
      speaker: currentSpeakerId,
    });

    // Dispatch current device selections to Redux
    dispatch(updateCurrentCameraById(currentCameraId));
    dispatch(updateCurrentMicrophoneById(currentMicrophoneId));
    dispatch(updateCurrentSpeakerById(currentSpeakerId));

    // For Zoom SDK, set microphone and speaker devices
    if (sdkManager.getCurrentSDKType() === "zoom") {
      await sdkManager.setDevice("microphone", currentMicrophoneId);
      await sdkManager.setDevice("speaker", currentSpeakerId);
      // await sdkManager.setDevice("camera", currentCameraId);
    }

    console.log("presetDevice completed");
  }, [dispatch, autoJoinConfig]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Update Redux state with configuration
      dispatch(setLoginInfo(formData));
      // Set default playback file if enabled (first file in list)
      dispatch(
        updateSelectedPlaybackFile(
          formData.enablePlaybackFile ? "playback-video-file.mp4" : null
        )
      );

      // set disableNS to localStorage
      // if (formData.enableBuiltInDenoiser) {
      localStorage.setItem(
        "disableNS",
        (!formData.enableBuiltInDenoiser).toString()
      );
      // }

      // Set basic callbacks before SDK initialization to prevent event loss
      sdkManager.setBasicCallbacks(dispatch);

      console.log("------------- Login initializeSDK begin --------------");

      // Initialize SDK
      await sdkManager.initializeSDK(formData.sdk as SDKType, {
        sdkKey: formData.sdkKey,
        sdkSecret: formData.sdkSecret,
        channelName: formData.sessionName,
        userName: formData.userName.toString(),
        role: formData.role.toString(),
        videoCodec: formData.videoCodec.toString(),
        audioCodec: formData.audioCodec.toString(),
        sdkMode: formData.sdkMode.toString(),
        enableDualStream: formData.enableDualStream,
        enableAudioDenoiser: formData.enableAudioDenoiser,
        videoMode: formData.videoMode,
        audioMode: formData.audioMode,
        mediaSdkHash: formData.mediaSdkHash,
      });

      console.log("------------ Initialize device list -----------");

      // Initialize device list (default + auto config device logic)
      await presetDevice();

      console.log("------------ Navigate to meeting page -----------");

      // Navigate to meeting page
      navigate("/meeting");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Login failed, please check configuration"
      );
    } finally {
      setLoading(false);
    }
  }, [formData, dispatch, navigate, validateForm, presetDevice]);

  useEffect(() => {
    if (isAutoJoin) {
      handleLogin();
    }
  }, [isAutoJoin, handleLogin]);

  // Get SDK reminder message
  const getSDKReminder = (
    sdk: SDKType
  ): { message: string; severity: "warning" | "info" | "error" } => {
    switch (sdk) {
      // case "agora":
      //   return {
      //     message:
      //       "⚠️ Agora service is currently unavailable. Please try other SDKs.",
      //     severity: "error",
      //   };

      // case "twilio":
      //   return {
      //     message:
      //       "ℹ️ Twilio SDK requires valid Access Token from Twilio Console.",
      //     severity: "info",
      //   };
      // case "zoom":
      //   return {
      //     message:
      //       "ℹ️ Zoom VideoSDK requires proper authentication and MediaSDK Hash (optional).",
      //     severity: "info",
      //   };
      default:
        return {
          message: "",
          severity: "info",
        };
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset codec options when SDK changes
      if (field === "sdk") {
        const sdk = value as SDKType;
        const sdkConfig = CODEC_CONFIG[sdk as keyof typeof CODEC_CONFIG];
        if (sdkConfig) {
          newData.videoCodec = sdkConfig.video[0].value;
          newData.audioCodec = sdkConfig.audio[0].value;
          newData.sdkMode = "rtc";
          // Only Agora supports dual stream
          newData.enableDualStream = sdk === "agora";

          // Set Zoom-specific modes
          if (sdk === "zoom") {
            newData.videoMode = "webrtc";
            newData.audioMode = "webrtc";
            newData.mediaSdkHash = "";
          } else {
            newData.videoMode = undefined;
            newData.audioMode = undefined;
            newData.mediaSdkHash = "";
          }

          // newData.enableAudioDenoiser = false;
          // newData.enableBuiltInDenoiser = false;
        }
      }

      return newData;
    });
    setError(""); // Clear error message
  };

  const handleEnableAudioDenoiser = (value: boolean) => {
    const data = value
      ? {
          enableAudioDenoiser: true,
          enableBuiltInDenoiser: false,
        }
      : {
          enableAudioDenoiser: false,
        };

    setFormData((prev) => {
      return {
        ...prev,
        ...data,
      };
    });
  };

  const handleDisableNSChange = (value: boolean) => {
    const data = value
      ? {
          enableBuiltInDenoiser: true,
          enableAudioDenoiser: false,
        }
      : { enableBuiltInDenoiser: false };

    setFormData((prev) => {
      return {
        ...prev,
        ...data,
      };
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2, backgroundColor: colors.background.paper }}
      >
        <Box textAlign="center" mb={4}>
          <VideoCallIcon
            sx={{ fontSize: 48, color: colors.primary.main, mb: 2 }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: colors.text.primary }}
          >
            SDK Comparison Tool
          </Typography>
          <Typography variant="body1" sx={{ color: colors.text.secondary }}>
            Select and configure your video SDK
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: colors.error.light,
              color: colors.error.dark,
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" noValidate>
          {/* SDK Selection */}
          <Card
            sx={{
              mb: 3,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: colors.text.primary,
                }}
              >
                <SettingsIcon sx={{ mr: 1, color: colors.primary.main }} />
                SDK Selection
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                {(["agora", "twilio", "zoom"] as SDKType[]).map((sdk) => (
                  <Card
                    key={sdk}
                    sx={{
                      flex: 1,
                      cursor: "pointer",
                      border: formData.sdk === sdk ? 2 : 1,
                      borderColor:
                        formData.sdk === sdk
                          ? colors.primary.main
                          : colors.border.light,
                      backgroundColor: colors.background.paper,
                      "&:hover": {
                        borderColor: colors.primary.main,
                        boxShadow: colors.shadow.medium,
                      },
                    }}
                    onClick={() => handleInputChange("sdk", sdk)}
                  >
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textTransform: "capitalize",
                          color: colors.text.primary,
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {sdk}
                      </Typography>
                      {/* SDK version display */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "red",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                        }}
                      >
                        {getSDKVersion(sdk)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {/* SDK Reminder Alert */}
              {(() => {
                const reminder = getSDKReminder(formData.sdk as SDKType);
                return reminder.message ? (
                  <Alert
                    severity={reminder.severity}
                    sx={{
                      mt: 2,
                      backgroundColor:
                        reminder.severity === "warning"
                          ? colors.warning.light
                          : reminder.severity === "error"
                          ? colors.error.light
                          : colors.info.light,
                      color:
                        reminder.severity === "warning"
                          ? colors.warning.dark
                          : reminder.severity === "error"
                          ? colors.error.dark
                          : colors.info.dark,
                      border: `1px solid ${
                        reminder.severity === "warning"
                          ? colors.warning.main
                          : reminder.severity === "error"
                          ? colors.error.main
                          : colors.info.main
                      }`,
                    }}
                  >
                    {reminder.message}
                  </Alert>
                ) : null;
              })()}
            </CardContent>
          </Card>

          {/* Basic Configuration */}
          <Card
            sx={{
              mb: 3,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: colors.text.primary }}
              >
                Basic Configuration
              </Typography>

              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.userName}
                    onChange={(e) =>
                      handleInputChange("userName", e.target.value)
                    }
                    placeholder="Enter username"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: colors.border.light },
                        "&:hover fieldset": {
                          borderColor: colors.border.medium,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary.main,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Topic"
                    value={formData.sessionName}
                    onChange={(e) =>
                      handleInputChange("sessionName", e.target.value)
                    }
                    placeholder="Enter Topic"
                    required
                    error={!formData.sessionName && error.includes("Topic")}
                    helperText={
                      !formData.sessionName && error.includes("Topic")
                        ? "Topic is required"
                        : ""
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor:
                            !formData.sessionName && error.includes("Topic")
                              ? colors.error.main
                              : colors.border.light,
                        },
                        "&:hover fieldset": {
                          borderColor:
                            !formData.sessionName && error.includes("Topic")
                              ? colors.error.main
                              : colors.border.medium,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor:
                            !formData.sessionName && error.includes("Topic")
                              ? colors.error.main
                              : colors.primary.main,
                        },
                      },
                      "& .MuiFormLabel-root.Mui-focused": {
                        color:
                          !formData.sessionName && error.includes("Topic")
                            ? colors.error.main
                            : colors.primary.main,
                      },
                    }}
                  />
                </Box>

                {formData.sdk === "zoom" && (
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      label="Zoom SDK Key"
                      value={formData.sdkKey}
                      onChange={(e) => handleInputChange("sdkKey", e.target.value)}
                      placeholder="Enter Zoom SDK Key"
                      required
                      error={!String(formData.sdkKey || "").trim() && error.includes("Zoom SDK Key")}
                      helperText={
                        !String(formData.sdkKey || "").trim() &&
                        error.includes("Zoom SDK Key")
                          ? "Zoom SDK Key is required"
                          : ""
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: colors.border.light },
                          "&:hover fieldset": { borderColor: colors.border.medium },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.primary.main,
                          },
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Zoom SDK Secret"
                      type="password"
                      value={formData.sdkSecret}
                      onChange={(e) =>
                        handleInputChange("sdkSecret", e.target.value)
                      }
                      placeholder="Enter Zoom SDK Secret"
                      required
                      error={
                        !String(formData.sdkSecret || "").trim() &&
                        error.includes("Zoom SDK Secret")
                      }
                      helperText={
                        !String(formData.sdkSecret || "").trim() &&
                        error.includes("Zoom SDK Secret")
                          ? "Zoom SDK Secret is required"
                          : ""
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: colors.border.light },
                          "&:hover fieldset": { borderColor: colors.border.medium },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.primary.main,
                          },
                        },
                      }}
                    />
                  </Box>
                )}

                {/* {formData.sdk === "agora" && (
                  <TextField
                    fullWidth
                    label="App ID"
                    value={formData.appId}
                    onChange={(e) => handleInputChange("appId", e.target.value)}
                    placeholder="Enter Agora App ID"
                    // helperText=""
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: colors.border.light },
                        "&:hover fieldset": {
                          borderColor: colors.border.medium,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: colors.primary.main,
                        },
                      },
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  label={
                    formData.sdk === "agora"
                      ? "Token (Optional)"
                      : "Access Token"
                  }
                  value={formData.token}
                  onChange={(e) => handleInputChange("token", e.target.value)}
                  placeholder={
                    formData.sdk === "agora"
                      ? "Temporary token or leave empty for auto-generation"
                      : "Enter Twilio Access Token"
                  }
                  helperText={
                    formData.sdk === "agora"
                      ? "Leave empty to use server-generated token"
                      : "Required from Twilio Console"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: colors.border.light },
                      "&:hover fieldset": { borderColor: colors.border.medium },
                      "&.Mui-focused fieldset": {
                        borderColor: colors.primary.main,
                      },
                    },
                  }}
                /> */}
              </Stack>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Accordion
            expanded={advancedConfigExpanded}
            onChange={(event, isExpanded) =>
              setAdvancedConfigExpanded(isExpanded)
            }
            sx={{
              mb: 3,
              backgroundColor: colors.background.paper,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: colors.primary.main }} />
              }
            >
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Advanced Configuration
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Box display="flex" gap={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: colors.text.secondary }}>
                      User Role
                    </InputLabel>
                    <Select
                      value={formData.role}
                      label="User Role"
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: colors.border.light,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: colors.border.medium,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: colors.primary.main,
                        },
                      }}
                    >
                      <MenuItem value="audience">Audience</MenuItem>
                      <MenuItem value="host">Host</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.sdk === "zoom" ? (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: colors.text.secondary }}>
                        Video Mode
                      </InputLabel>
                      <Select
                        value={formData.videoMode}
                        label="Video Mode"
                        onChange={(e) =>
                          handleInputChange("videoMode", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.light,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary.main,
                          },
                        }}
                      >
                        {CODEC_CONFIG.zoom.videoMode.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: colors.text.secondary }}>
                        Video Codec
                      </InputLabel>
                      <Select
                        key={`video-codec-${formData.sdk}`}
                        value={formData.videoCodec}
                        label="Video Codec"
                        onChange={(e) =>
                          handleInputChange("videoCodec", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.light,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary.main,
                          },
                        }}
                      >
                        {CODEC_CONFIG[
                          formData.sdk as keyof typeof CODEC_CONFIG
                        ]?.video.map((codec) => (
                          <MenuItem key={codec.value} value={codec.value}>
                            {codec.label}
                          </MenuItem>
                        )) ||
                          CODEC_CONFIG.agora.video.map((codec) => (
                            <MenuItem key={codec.value} value={codec.value}>
                              {codec.label}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>

                <Box display="flex" gap={2}>
                  {formData.sdk === "zoom" ? (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: colors.text.secondary }}>
                        Audio Mode
                      </InputLabel>
                      <Select
                        value={formData.audioMode}
                        label="Audio Mode"
                        onChange={(e) =>
                          handleInputChange("audioMode", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.light,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary.main,
                          },
                        }}
                      >
                        {CODEC_CONFIG.zoom.audioMode.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: colors.text.secondary }}>
                        Audio Codec
                      </InputLabel>
                      <Select
                        key={`audio-codec-${formData.sdk}`}
                        value={formData.audioCodec}
                        label="Audio Codec"
                        onChange={(e) =>
                          handleInputChange("audioCodec", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.light,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary.main,
                          },
                        }}
                      >
                        {CODEC_CONFIG[
                          formData.sdk as keyof typeof CODEC_CONFIG
                        ]?.audio.map((codec) => (
                          <MenuItem key={codec.value} value={codec.value}>
                            {codec.label}
                          </MenuItem>
                        )) ||
                          CODEC_CONFIG.agora.audio.map((codec) => (
                            <MenuItem key={codec.value} value={codec.value}>
                              {codec.label}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}

                  {formData.sdk === "agora" && (
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: colors.text.secondary }}>
                        SDK Mode
                      </InputLabel>
                      <Select
                        value={formData.sdkMode}
                        label="SDK Mode"
                        onChange={(e) =>
                          handleInputChange("sdkMode", e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.light,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: colors.primary.main,
                          },
                        }}
                      >
                        <MenuItem value="rtc">
                          RTC (1-on-1, small group)
                        </MenuItem>
                        <MenuItem value="live">
                          Live (broadcasting, large audience)
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>

                {formData.sdk === "agora" && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.enableDualStream}
                          onChange={(e) =>
                            handleInputChange(
                              "enableDualStream",
                              e.target.checked
                            )
                          }
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: colors.primary.main,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: colors.primary.main,
                              },
                          }}
                        />
                      }
                      label="Enable Dual Stream"
                      sx={{ color: colors.text.primary }}
                    />
                  </Box>
                )}
                {formData.sdk === "zoom" && (
                  <Box>
                    <TextField
                      fullWidth
                      label="MediaSDK Hash"
                      value={formData.mediaSdkHash}
                      onChange={(e) =>
                        handleInputChange("mediaSdkHash", e.target.value)
                      }
                      placeholder="Enter MediaSDK Hash (optional)"
                      helperText="Optional: Specify MediaSDK hash for Zoom"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: colors.border.light },
                          "&:hover fieldset": {
                            borderColor: colors.border.medium,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.primary.main,
                          },
                        },
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.enablePlaybackFile}
                          onChange={(e) =>
                            handleInputChange(
                              "enablePlaybackFile",
                              e.target.checked
                            )
                          }
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: colors.primary.main,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: colors.primary.main,
                              },
                          }}
                        />
                      }
                      label="Enable Playback File"
                      sx={{ color: colors.text.primary }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        fontSize: "0.75rem",
                        display: "block",
                        ml: 1,
                      }}
                    >
                      <b>Enable Playback File:</b>
                      Get audio and video track from a special file.
                    </Typography>
                  </Box>
                )}

                {(formData.sdk === "agora" || formData.sdk === "zoom") && (
                  <Box>
                    <Box
                      display="flex"
                      gap={3}
                      mb={formData.sdk === "zoom" ? 1 : 0}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enableAudioDenoiser}
                            onChange={(e) =>
                              handleEnableAudioDenoiser(e.target.checked)
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: colors.primary.main,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  backgroundColor: colors.primary.main,
                                },
                            }}
                          />
                        }
                        label="Enable Audio Denoiser"
                        sx={{ color: colors.text.primary }}
                      />
                      {formData.sdk === "zoom" && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.enableBuiltInDenoiser}
                              onChange={(e) =>
                                handleDisableNSChange(e.target.checked)
                              }
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                  color: colors.primary.main,
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: colors.primary.main,
                                  },
                              }}
                            />
                          }
                          label="enable Built-In Denoiser"
                          sx={{ color: colors.text.primary }}
                        />
                      )}
                    </Box>
                    {formData.sdk === "zoom" && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.secondary,
                          fontSize: "0.75rem",
                          display: "block",
                          ml: 1,
                        }}
                      >
                        <b>Enable VideoSDK Audio Denoiser</b>: Is enable{" "}
                        <b>Zoom</b> Audio Denoiser.
                        <br />
                        <b>Enable Built-In Denoiser</b>: Is enable build-in
                        built-in Audio Denoiser.
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={
              loading ||
              getSDKReminder(formData.sdk as SDKType).severity === "error"
            }
            startIcon={<LoginIcon />}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              backgroundColor: colors.primary.main,
              "&:hover": {
                backgroundColor: colors.primary.dark,
              },
              "&:disabled": {
                backgroundColor: colors.text.disabled,
              },
            }}
          >
            {loading ? "Connecting..." : "Join Meeting"}
          </Button>

          {/* Config Button */}
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate(RoutePath.Config)}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1.1rem",
              borderColor: colors.primary.main,
              color: colors.primary.main,
              "&:hover": {
                borderColor: colors.primary.dark,
                backgroundColor: colors.primary.light,
              },
            }}
          >
            Configuration
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
