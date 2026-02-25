import React from "react";
import { Paper, IconButton, Button, Box, Badge } from "@mui/material";
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ExitToApp,
  Camera,
  KeyboardArrowDown,
  Fullscreen,
  AutoFixHigh,
  AutoFixOff,
} from "@mui/icons-material";
import { colors } from "../../../theme/colors";

interface ControlBarProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isAudioJoined?: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeave: () => void;
  onDeviceMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onMainViewFullscreenToggle?: () => void;
  isVirtualBackgroundSupported?: boolean;
  isVirtualBackgroundEnabled?: boolean;
  isVirtualBackgroundLoading?: boolean;
  onVirtualBackgroundSelect?: () => void;
  onVirtualBackgroundClear?: () => void;
  onVirtualBackgroundPresetClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isAudioJoined = false,
  onToggleVideo,
  onToggleAudio,
  onLeave,
  onDeviceMenuClick,
  onMainViewFullscreenToggle,
  isVirtualBackgroundSupported = false,
  isVirtualBackgroundEnabled = false,
  isVirtualBackgroundLoading = false,
  onVirtualBackgroundSelect,
  onVirtualBackgroundClear,
  onVirtualBackgroundPresetClick,
}) => {
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.light}`,
        }}
      >
        <Box flex={1} />
        <Box display="flex" alignItems="center" gap={2}>
          <Badge
            invisible={!isAudioJoined}
            variant="dot"
            overlap="rectangular"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              "& .MuiBadge-badge": {
                width: 10,
                height: 10,
                minWidth: 10,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                border: `2px solid ${colors.background.paper}`,
                top: 2,
                right: 2,
                transform: "translate(50%, -50%)",
              },
            }}
          >
            <IconButton
              onClick={onToggleAudio}
              color={isAudioEnabled ? "primary" : "error"}
              size="large"
              sx={{
                bgcolor: isAudioEnabled
                  ? colors.success.main
                  : colors.error.main,
                color: colors.text.inverse,
                "&:hover": {
                  bgcolor: isAudioEnabled
                    ? colors.success.dark
                    : colors.error.dark,
                },
              }}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Badge>

          <IconButton
            onClick={onToggleVideo}
            color={isVideoEnabled ? "primary" : "error"}
            size="large"
            sx={{
              bgcolor: isVideoEnabled ? colors.success.main : colors.error.main,
              color: colors.text.inverse,
              "&:hover": {
                bgcolor: isVideoEnabled
                  ? colors.success.dark
                  : colors.error.dark,
              },
            }}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>

          {/* Main view fullscreen button */}
          {onMainViewFullscreenToggle && (
            <IconButton
              onClick={onMainViewFullscreenToggle}
              size="large"
              sx={{
                bgcolor: colors.primary.main,
                color: colors.text.inverse,
                "&:hover": {
                  bgcolor: colors.primary.dark,
                },
              }}
            >
              <Fullscreen />
              {/* {isMainViewFullscreen ? <FullscreenExit /> : <Fullscreen />} */}
            </IconButton>
          )}

          <Button
            variant="outlined"
            startIcon={<Camera />}
            endIcon={<KeyboardArrowDown />}
            onClick={onDeviceMenuClick}
            sx={{
              borderColor: colors.border.medium,
              color: colors.primary.main,
              "&:hover": {
                borderColor: colors.primary.main,
                backgroundColor: colors.primary.light + "10",
              },
            }}
          >
            Devices
          </Button>

          {isVirtualBackgroundSupported && onVirtualBackgroundSelect && (
            <Button
              variant="outlined"
              startIcon={<AutoFixHigh />}
              onClick={onVirtualBackgroundSelect}
              disabled={isVirtualBackgroundLoading}
              sx={{
                borderColor: colors.border.medium,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.main,
                  backgroundColor: colors.primary.light + "10",
                },
              }}
            >
              {isVirtualBackgroundEnabled ? "Change VB" : "Set VB"}
            </Button>
          )}

          {isVirtualBackgroundSupported &&
            isVirtualBackgroundEnabled &&
            onVirtualBackgroundClear && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<AutoFixOff />}
                onClick={onVirtualBackgroundClear}
                disabled={isVirtualBackgroundLoading}
              >
                Clear VB
              </Button>
            )}

          {isVirtualBackgroundSupported && onVirtualBackgroundPresetClick && (
            <Button
              variant="outlined"
              onClick={onVirtualBackgroundPresetClick}
              disabled={isVirtualBackgroundLoading}
              sx={{
                borderColor: colors.border.medium,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.main,
                  backgroundColor: colors.primary.light + "10",
                },
              }}
            >
              Presets
            </Button>
          )}
        </Box>
        <Box flex={1} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            onClick={onLeave}
            size="large"
            sx={{
              backgroundColor: colors.error.main,
              fontWeight: 600,
              textTransform: "uppercase",
              "&:hover": {
                backgroundColor: colors.error.dark,
              },
            }}
          >
            LEAVE
          </Button>
        </Box>
      </Paper>
    </>
  );
};
