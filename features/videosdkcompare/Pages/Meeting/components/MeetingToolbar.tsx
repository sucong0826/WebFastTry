import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Badge,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { People, Analytics, Visibility } from "@mui/icons-material";
import { colors } from "../../../theme/colors";

interface MeetingToolbarProps {
  sessionName: string;
  sdkType: string;
  userName: string;
  userId: string;
  remoteUserCount: number;
  onUserListClick: (event: React.MouseEvent<HTMLElement>) => void;
  onStatsClick: () => void;
  onVideoStatsToggle: () => void;
  showVideoStats: boolean;
  videoMode?: string;
  audioMode?: string;
}

export const MeetingToolbar: React.FC<MeetingToolbarProps> = ({
  sessionName,
  sdkType,
  userName,
  userId,
  remoteUserCount,
  onUserListClick,
  onStatsClick,
  onVideoStatsToggle,
  showVideoStats,
  videoMode,
  audioMode,
}) => {
  const shouldShowModes = sdkType === "zoom" && (videoMode || audioMode);

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ backgroundColor: colors.background.paper }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" flex={1} gap={2}>
          {/* SDK Type */}
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={sdkType.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: colors.primary.light,
                color: colors.primary.contrast,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              SDK
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Zoom Mode Information */}
          {shouldShowModes && (
            <>
              <Box display="flex" alignItems="center" gap={1}>
                {videoMode && (
                  <Chip
                    label={`Video: ${videoMode.toUpperCase()}`}
                    size="small"
                    sx={{
                      backgroundColor: colors.success.light,
                      color: colors.text.inverse,
                      fontWeight: 500,
                      fontSize: "0.65rem",
                      height: 20,
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                )}
                {audioMode && (
                  <Chip
                    label={`Audio: ${audioMode.toUpperCase()}`}
                    size="small"
                    sx={{
                      backgroundColor: colors.info.light,
                      color: colors.text.inverse,
                      fontWeight: 500,
                      fontSize: "0.65rem",
                      height: 20,
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                )}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            </>
          )}

          {/* Session Name */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="h6"
              sx={{
                color: colors.text.primary,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {sessionName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              Topic
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User Name */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              {userName} ({userId})
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
              }}
            >
              You
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Video Stats Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showVideoStats}
                onChange={onVideoStatsToggle}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: colors.primary.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: colors.primary.main,
                  },
                }}
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.text.secondary,
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  }}
                >
                  VideoInfo
                </Typography>
              </Box>
            }
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.7rem",
              },
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User list button */}
          <Tooltip title="Participants List">
            <IconButton
              color="inherit"
              onClick={onUserListClick}
              size="small"
              sx={{ color: colors.primary.main }}
            >
              <Badge badgeContent={remoteUserCount + 1} color="error">
                <People sx={{ color: colors.primary.main }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Statistics">
            <IconButton
              color="inherit"
              onClick={onStatsClick}
              size="small"
              sx={{ color: colors.primary.main }}
            >
              <Analytics />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
