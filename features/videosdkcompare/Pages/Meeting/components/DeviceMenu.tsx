import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { colors } from "../../../theme/colors";

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind?: "videoinput" | "audioinput" | "audiooutput";
  groupId?: string;
}

interface DeviceMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  currentCamera: DeviceInfo | null;
  currentMicrophone: DeviceInfo | null;
  currentSpeaker: DeviceInfo | null;
  onCameraSelect: (deviceId: string) => void;
  onMicrophoneSelect: (deviceId: string) => void;
  onSpeakerSelect: (deviceId: string) => void;
  enablePlaybackFile?: boolean;
  selectedPlaybackFile?: string | null;
  onPlaybackSelect?: (filename: string) => void;
}

const PlaybackVideoList = ["playback-video-file.mp4"];

export const DeviceMenu: React.FC<DeviceMenuProps> = ({
  anchorEl,
  onClose,
  cameras,
  microphones,
  speakers,
  currentCamera,
  currentMicrophone,
  currentSpeaker,
  onCameraSelect,
  onMicrophoneSelect,
  onSpeakerSelect,
  enablePlaybackFile = false,
  selectedPlaybackFile = null,
  onPlaybackSelect,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 250,
          backgroundColor: colors.background.paper,
          border: `1px solid ${colors.border.light}`,
        },
      }}
    >
      <MenuItem disabled>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: colors.text.primary }}
        >
          Cameras
        </Typography>
      </MenuItem>
      {cameras.length > 0 ? (
        cameras.map((camera) => {
          const isCameraSelected =
            !selectedPlaybackFile &&
            currentCamera?.deviceId === camera.deviceId;
          return (
            <MenuItem
              key={camera.deviceId}
              onClick={() => onCameraSelect(camera.deviceId)}
              sx={{
                backgroundColor: isCameraSelected
                  ? colors.primary.light + "20"
                  : "transparent",
                "&:hover": {
                  backgroundColor: colors.primary.light + "10",
                },
              }}
            >
              <ListItemIcon>
                {isCameraSelected && (
                  <CheckCircle
                    sx={{ color: colors.primary.main }}
                    fontSize="small"
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  camera.label || `Camera ${camera.deviceId.slice(0, 8)}`
                }
                secondary={isCameraSelected ? "Currently selected" : null}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: colors.text.primary,
                  },
                  "& .MuiListItemText-secondary": {
                    color: colors.text.secondary,
                  },
                }}
              />
            </MenuItem>
          );
        })
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            No cameras available
          </Typography>
        </MenuItem>
      )}

      {/* playback file */}
      {enablePlaybackFile && <Divider sx={{ my: 1 }} />}
      {enablePlaybackFile && (
        <MenuItem disabled>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: colors.text.primary }}
          >
            Playback File
          </Typography>
        </MenuItem>
      )}
      {enablePlaybackFile &&
        PlaybackVideoList.map((filename) => {
          const isSelected = selectedPlaybackFile === filename;
          return (
            <MenuItem
              key={filename}
              onClick={() => onPlaybackSelect?.(filename)}
              sx={{
                backgroundColor: isSelected
                  ? colors.primary.light + "20"
                  : "transparent",
                "&:hover": {
                  backgroundColor: colors.primary.light + "10",
                },
              }}
            >
              <ListItemIcon>
                {isSelected && (
                  <CheckCircle
                    sx={{ color: colors.primary.main }}
                    fontSize="small"
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={filename}
                secondary={isSelected ? "Currently selected" : null}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: colors.text.primary,
                  },
                  "& .MuiListItemText-secondary": {
                    color: colors.text.secondary,
                  },
                }}
              />
            </MenuItem>
          );
        })}

      <Divider sx={{ my: 1 }} />

      <MenuItem disabled>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: colors.text.primary }}
        >
          Microphones
        </Typography>
      </MenuItem>
      {microphones.length > 0 ? (
        microphones.map((mic) => (
          <MenuItem
            key={mic.deviceId}
            onClick={() => onMicrophoneSelect(mic.deviceId)}
            sx={{
              backgroundColor:
                currentMicrophone?.deviceId === mic.deviceId
                  ? colors.primary.light + "20"
                  : "transparent",
              "&:hover": {
                backgroundColor: colors.primary.light + "10",
              },
            }}
          >
            <ListItemIcon>
              {currentMicrophone?.deviceId === mic.deviceId && (
                <CheckCircle
                  sx={{ color: colors.primary.main }}
                  fontSize="small"
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
              secondary={
                currentMicrophone?.deviceId === mic.deviceId
                  ? "Currently selected"
                  : null
              }
              sx={{
                "& .MuiListItemText-primary": {
                  color: colors.text.primary,
                },
                "& .MuiListItemText-secondary": {
                  color: colors.text.secondary,
                },
              }}
            />
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            No microphones available
          </Typography>
        </MenuItem>
      )}

      <Divider sx={{ my: 1 }} />

      <MenuItem disabled>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: colors.text.primary }}
        >
          Speakers
        </Typography>
      </MenuItem>
      {speakers.length > 0 ? (
        speakers.map((speaker) => (
          <MenuItem
            key={speaker.deviceId}
            onClick={() => onSpeakerSelect(speaker.deviceId)}
            sx={{
              backgroundColor:
                currentSpeaker?.deviceId === speaker.deviceId
                  ? colors.primary.light + "20"
                  : "transparent",
              "&:hover": {
                backgroundColor: colors.primary.light + "10",
              },
            }}
          >
            <ListItemIcon>
              {currentSpeaker?.deviceId === speaker.deviceId && (
                <CheckCircle
                  sx={{ color: colors.primary.main }}
                  fontSize="small"
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                speaker.label || `Speaker ${speaker.deviceId.slice(0, 8)}`
              }
              secondary={
                currentSpeaker?.deviceId === speaker.deviceId
                  ? "Currently selected"
                  : null
              }
              sx={{
                "& .MuiListItemText-primary": {
                  color: colors.text.primary,
                },
                "& .MuiListItemText-secondary": {
                  color: colors.text.secondary,
                },
              }}
            />
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            No speakers available
          </Typography>
        </MenuItem>
      )}
    </Menu>
  );
};
