import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import styles from "./index.module.scss";
import { RoutePath } from "../../Route";

interface ConfigData {
  // Key
  sdkKey: string;
  sdkSecret: string;

  // MeetingInfo
  topic: string;
  userName: string;
  mediaSdkHash: string;
  role: 0 | 1;
  videoMode: "wasm" | "webrtc";
  audioMode: "wasm" | "webrtc";
  selfFull: boolean;
  remoteFull: boolean;

  // Media Settings
  enableVideo: boolean;
  enableAudio: boolean;
  enableAudioDenoiser: boolean;
  enableBuiltInDenoiser: boolean;
  enablePlaybackFile: boolean;

  // Device
  cameraName: string;
  microphoneName: string;
  speakerName: string;
}

const Config: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData>({
    sdkKey: "",
    sdkSecret: "",
    topic: "",
    userName: "",
    mediaSdkHash: "",
    role: 0,
    videoMode: "webrtc",
    audioMode: "webrtc",
    selfFull: false,
    remoteFull: false,
    enableVideo: false,
    enableAudio: false,
    enableAudioDenoiser: false,
    enableBuiltInDenoiser: false,
    enablePlaybackFile: false,
    cameraName: "",
    microphoneName: "",
    speakerName: "",
  });

  const handleInputChange = (
    field: keyof ConfigData,
    value: string | number | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setConfig({
      sdkKey: "",
      sdkSecret: "",
      topic: "",
      userName: "",
      mediaSdkHash: "",
      role: 0,
      videoMode: "webrtc",
      audioMode: "webrtc",
      selfFull: false,
      remoteFull: false,
      enableVideo: true,
      enableAudio: true,
      enableAudioDenoiser: false,
      enableBuiltInDenoiser: false,
      enablePlaybackFile: false,
      cameraName: "",
      microphoneName: "",
      speakerName: "",
    });
  };

  const handleCopyUrl = () => {
    // const baseUrl = "https://mediascoring.zoomdev.us/videosdkcompare/login";
    const baseUrl = `${window.location.origin}`.startsWith(
      "https://mediascoring.zoomdev.us"
    )
      ? "https://mediascoring.zoomdev.us/videosdkcompare/"
      : window.location.origin;

    // Create URLSearchParams object for proper encoding
    const params = new URLSearchParams();

    // Add all config parameters
    params.append("sdkKey", config.sdkKey);
    params.append("sdkSecret", config.sdkSecret);
    params.append("topic", config.topic);
    params.append("userName", config.userName);
    params.append("mediaSdkHash", config.mediaSdkHash);
    params.append("role", config.role.toString());
    params.append("videoMode", config.videoMode);
    params.append("audioMode", config.audioMode);
    params.append("selfFull", config.selfFull.toString());
    params.append("remoteFull", config.remoteFull.toString());
    params.append("enableVideo", config.enableVideo.toString());
    params.append("enableAudio", config.enableAudio.toString());
    params.append("enableAudioDenoiser", config.enableAudioDenoiser.toString());
    params.append(
      "enableBuiltInDenoiser",
      config.enableBuiltInDenoiser.toString()
    );
    params.append("enablePlaybackFile", config.enablePlaybackFile.toString());
    params.append("cameraName", config.cameraName);
    params.append("microphoneName", config.microphoneName);
    params.append("speakerName", config.speakerName);

    const fullUrl = `${baseUrl}?${params.toString()}`;
    const encodedUrl = encodeURI(fullUrl);

    // Copy to clipboard
    navigator.clipboard
      .writeText(encodedUrl)
      .then(() => {
        // You could add a toast notification here if you have a notification system
        console.log("URL copied fullUrl:", fullUrl);
        console.log("URL copied to clipboard encodedUrl:", encodedUrl);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" component="h1" gutterBottom>
        Config
      </Typography>

      <Grid container spacing={3}>
        {/* Key Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key
              </Typography>
              <TextField
                fullWidth
                label="SdkKey"
                value={config.sdkKey}
                onChange={(e) => handleInputChange("sdkKey", e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="SdkSecret"
                value={config.sdkSecret}
                onChange={(e) => handleInputChange("sdkSecret", e.target.value)}
                required
                margin="normal"
                // type="password"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* MeetingInfo Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                MeetingInfo
              </Typography>
              <TextField
                fullWidth
                label="Topic"
                value={config.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="UserName"
                value={config.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="MediaSDK Hash"
                value={config.mediaSdkHash}
                onChange={(e) =>
                  handleInputChange("mediaSdkHash", e.target.value)
                }
                margin="normal"
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={config.role}
                  label="Role"
                  onChange={(e) =>
                    handleInputChange("role", e.target.value as 0 | 1)
                  }
                >
                  <MenuItem value={0}>Audience</MenuItem>
                  <MenuItem value={1}>Host</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>VideoMode</InputLabel>
                <Select
                  value={config.videoMode}
                  label="VideoMode"
                  onChange={(e) =>
                    handleInputChange(
                      "videoMode",
                      e.target.value as "wasm" | "webrtc"
                    )
                  }
                >
                  <MenuItem value="wasm">WASM</MenuItem>
                  <MenuItem value="webrtc">WebRTC</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>AudioMode</InputLabel>
                <Select
                  value={config.audioMode}
                  label="AudioMode"
                  onChange={(e) =>
                    handleInputChange(
                      "audioMode",
                      e.target.value as "wasm" | "webrtc"
                    )
                  }
                >
                  <MenuItem value="wasm">WASM</MenuItem>
                  <MenuItem value="webrtc">WebRTC</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableVideo}
                    onChange={(e) =>
                      handleInputChange("enableVideo", e.target.checked)
                    }
                  />
                }
                label="Enable Video"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableAudio}
                    onChange={(e) =>
                      handleInputChange("enableAudio", e.target.checked)
                    }
                  />
                }
                label="Enable Audio"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.selfFull}
                    onChange={(e) => {
                      handleInputChange("selfFull", e.target.checked);
                      handleInputChange("remoteFull", !e.target.checked);
                    }}
                  />
                }
                label="SelfFull"
                required
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.remoteFull}
                    onChange={(e) => {
                      handleInputChange("remoteFull", e.target.checked);
                      handleInputChange("selfFull", !e.target.checked);
                    }}
                  />
                }
                label="RemoteFull"
                required
              />

              <Box>
                <Box display="flex" gap={3} mb={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enableAudioDenoiser}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            handleInputChange("enableAudioDenoiser", true);
                            handleInputChange("enableBuiltInDenoiser", false);
                          } else {
                            handleInputChange("enableBuiltInDenoiser", false);
                          }
                        }}
                      />
                    }
                    label="Enable Audio Denoiser"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enableBuiltInDenoiser}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            handleInputChange("enableBuiltInDenoiser", true);
                            handleInputChange("enableAudioDenoiser", false);
                          } else {
                            handleInputChange("enableBuiltInDenoiser", false);
                          }
                        }}
                      />
                    }
                    label="enable Built-In Denoiser"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enablePlaybackFile}
                        onChange={(e) =>
                          handleInputChange(
                            "enablePlaybackFile",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable Playback File"
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    display: "block",
                    ml: 1,
                  }}
                >
                  Enable Audio Denoiser: disable Denoiser in SDK flag. Disable
                  NS: disable Denoiser Completely.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Camera Name"
                    value={config.cameraName}
                    onChange={(e) =>
                      handleInputChange("cameraName", e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Microphone Name"
                    value={config.microphoneName}
                    onChange={(e) =>
                      handleInputChange("microphoneName", e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Speaker Name"
                    value={config.speakerName}
                    onChange={(e) =>
                      handleInputChange("speakerName", e.target.value)
                    }
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className={styles.actions}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReset}
          size="large"
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCopyUrl}
          size="large"
        >
          Copy URL
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(RoutePath.Login)}
          size="large"
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#1565c0",
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default Config;
