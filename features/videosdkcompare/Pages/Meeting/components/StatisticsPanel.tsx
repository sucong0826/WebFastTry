import React from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  ExpandMore,
  ExpandLess,
  NetworkCheck,
} from "@mui/icons-material";

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

interface StatisticsPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  tabIndex: number;
  onTabChange: (index: number) => void;
  localStats: VideoStats | null;
  remoteStats: { [uid: string]: VideoStats };
  remoteUsers: {
    [uid: string]: { uid: string; hasAudio: boolean; hasVideo: boolean };
  };
  networkQuality: {
    uplink: number;
    downlink: number;
  };
  networkLevel: {
    audio?: {
      send: number;
      recv: number;
      sendStats?: {
        bandwidth?: number;
        latency?: number;
        fractionLost?: number;
      };
      recvStats?: {
        bandwidth?: number;
        latency?: number;
        fractionLost?: number;
      };
    };
    video?: {
      send: number;
      recv: number;
      sendStats?: {
        bandwidth?: number;
        latency?: number;
        fractionLost?: number;
      };
      recvStats?: {
        bandwidth?: number;
        latency?: number;
        fractionLost?: number;
      };
    };
  };
  connectionState: string;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
      {value}
    </Typography>
  </Box>
);

// Format bitrate to appropriate units
const formatBitrate = (bitrate: number | undefined): string => {
  if (!bitrate || bitrate === 0) return "0 bps";

  if (bitrate >= 1000000) {
    return `${(bitrate / 1000000).toFixed(2)} Mbps`;
  } else if (bitrate >= 1000) {
    return `${(bitrate / 1000).toFixed(2)} kbps`;
  } else {
    return `${bitrate.toFixed(0)} bps`;
  }
};

// Format packet loss rate
const formatPacketLoss = (rate: number | undefined): string => {
  if (!rate || rate === 0) return "0%";
  return `${rate.toFixed(2)}%`;
};

// Format transport delay
const formatTransportDelay = (delay: number | undefined): string => {
  if (!delay || delay === 0) return "0 ms";
  return `${delay.toFixed(0)} ms`;
};

const NetworkQualityIndicator: React.FC<{ level: number }> = ({ level }) => {
  const getColor = (level: number) => {
    if (level >= 4) return "success";
    if (level >= 2) return "warning";
    return "error";
  };

  const getLabel = (level: number) => {
    if (level >= 4) return "Excellent";
    if (level >= 2) return "Good";
    return "Poor";
  };

  return (
    <Chip
      label={getLabel(level)}
      color={getColor(level) as "success" | "warning" | "error"}
      size="small"
      icon={<NetworkCheck />}
    />
  );
};

const ConnectionStateIndicator: React.FC<{ state: string }> = ({ state }) => {
  const getColor = (state: string) => {
    const lowerState = state.toLowerCase();
    if (lowerState.includes("connected") || lowerState.includes("joined")) {
      return "success";
    }
    if (lowerState.includes("connecting") || lowerState.includes("joining")) {
      return "warning";
    }
    return "error";
  };

  const getLabel = (state: string) => {
    const lowerState = state.toLowerCase();
    if (lowerState.includes("connected") || lowerState.includes("joined")) {
      return "Connected";
    }
    if (lowerState.includes("connecting") || lowerState.includes("joining")) {
      return "Connecting";
    }
    return "Disconnected";
  };

  return (
    <Chip
      label={getLabel(state)}
      color={getColor(state) as "success" | "warning" | "error"}
      size="small"
      icon={<NetworkCheck />}
    />
  );
};

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  isExpanded,
  onToggleExpand,
  tabIndex,
  onTabChange,
  localStats,
  remoteStats,
  remoteUsers,
  networkQuality,
  networkLevel,
  connectionState,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        top: 80,
        right: 16,
        width: 350,
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp />
          <Typography variant="h6">Statistics</Typography>
        </Box>
        <IconButton onClick={onToggleExpand} size="small">
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Local" />
          <Tab label="Remote" />
          <Tab label="Network" />
        </Tabs>

        <Box sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
          {tabIndex === 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Local Video Statistics
              </Typography>
              {localStats ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <StatItem
                      label="Codec"
                      value={localStats.codecType || "N/A"}
                    />
                    <StatItem
                      label="Frame Rate"
                      value={`${localStats.sendFrameRate || 0} fps`}
                    />
                    <StatItem
                      label="Bitrate"
                      value={formatBitrate(localStats.sendBitrate)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <StatItem
                      label="Resolution"
                      value={`${localStats.sendResolutionWidth || 0}x${
                        localStats.sendResolutionHeight || 0
                      }`}
                    />
                    <StatItem
                      label="Transport Delay"
                      value={formatTransportDelay(localStats.transportDelay)}
                    />
                    <StatItem
                      label="Packet Loss"
                      value={formatPacketLoss(localStats.packetLossRate)}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No local statistics available
                </Typography>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Remote Video Statistics
              </Typography>
              {Object.keys(remoteStats).length > 0 ? (
                Object.entries(remoteStats).map(([uid, stats]) => (
                  <Box
                    key={uid}
                    sx={{
                      mb: 2,
                      p: 1,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      User {uid}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <StatItem
                          label="Codec"
                          value={stats.codecType || "N/A"}
                        />
                        <StatItem
                          label="Frame Rate"
                          value={`${stats.receiveFrameRate || 0} fps`}
                        />
                        <StatItem
                          label="Bitrate"
                          value={formatBitrate(stats.receiveBitrate)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <StatItem
                          label="Resolution"
                          value={`${stats.receiveResolutionWidth || 0}x${
                            stats.receiveResolutionHeight || 0
                          }`}
                        />
                        <StatItem
                          label="Transport Delay"
                          value={formatTransportDelay(stats.transportDelay)}
                        />
                        <StatItem
                          label="Packet Loss"
                          value={formatPacketLoss(stats.packetLossRate)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">
                  No remote statistics available
                </Typography>
              )}
            </Box>
          )}

          {tabIndex === 2 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Network Quality
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Connection Status
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <ConnectionStateIndicator state={connectionState} />
                  <Typography variant="caption" color="text.secondary">
                    {connectionState}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Overall Quality
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    Up: {networkQuality.uplink} Down: {networkQuality.downlink}
                  </Typography>
                </Box>
              </Box>

              {networkLevel.audio && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Audio Quality
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption">Send:</Typography>
                    <NetworkQualityIndicator level={networkLevel.audio.send} />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Receive:</Typography>
                    <NetworkQualityIndicator level={networkLevel.audio.recv} />
                  </Box>
                  {networkLevel.audio.sendStats && (
                    <Box
                      sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="caption" display="block">
                        Send:{" "}
                        {formatBitrate(networkLevel.audio.sendStats.bandwidth)},
                        Latency:{" "}
                        {formatTransportDelay(
                          networkLevel.audio.sendStats.latency
                        )}
                        , Loss:{" "}
                        {formatPacketLoss(
                          networkLevel.audio.sendStats.fractionLost
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {networkLevel.video && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Video Quality
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption">Send:</Typography>
                    <NetworkQualityIndicator level={networkLevel.video.send} />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Receive:</Typography>
                    <NetworkQualityIndicator level={networkLevel.video.recv} />
                  </Box>
                  {networkLevel.video.sendStats && (
                    <Box
                      sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Typography variant="caption" display="block">
                        Send:{" "}
                        {formatBitrate(networkLevel.video.sendStats.bandwidth)},
                        Latency:{" "}
                        {formatTransportDelay(
                          networkLevel.video.sendStats.latency
                        )}
                        , Loss:{" "}
                        {formatPacketLoss(
                          networkLevel.video.sendStats.fractionLost
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};
