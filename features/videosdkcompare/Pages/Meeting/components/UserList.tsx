import React from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import {
  Person,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
} from "@mui/icons-material";
import { RemoteUser } from "../../../types/sdk";

interface UserListProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  currentUser: {
    uid: string;
    userName: string;
    hasAudio: boolean;
    hasVideo: boolean;
  };
  remoteUsers: { [uid: string]: RemoteUser };
}

export const UserList: React.FC<UserListProps> = ({
  anchorEl,
  onClose,
  currentUser,
  remoteUsers,
}) => {
  const allUsers = [
    {
      uid: currentUser.uid,
      name: `${currentUser.userName} (${currentUser.uid})`,
      hasAudio: currentUser.hasAudio,
      hasVideo: currentUser.hasVideo,
    },
    ...Object.entries(remoteUsers).map(([uid, user]) => ({
      uid,
      name: `${user.userName ? String(user.userName) : `User ${uid}`} (${uid})`,
      hasAudio: user.hasAudio,
      hasVideo: user.hasVideo,
    })),
  ];

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: { minWidth: 300, maxHeight: 400 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Participants ({allUsers.length})
        </Typography>
        <List>
          {allUsers.map((user, index) => (
            <ListItem key={user.uid} divider={index < allUsers.length - 1}>
              <ListItemAvatar>
                <Avatar>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    component="span"
                  >
                    <Typography variant="body1" component="span">
                      {user.name}
                      {user.uid === currentUser.uid && (
                        <Chip
                          label="You"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mt={0.5}
                    component="span"
                  >
                    {user.hasVideo ? (
                      <Chip
                        icon={<Videocam />}
                        label="Video"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<VideocamOff />}
                        label="No Video"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                    {user.hasAudio ? (
                      <Chip
                        icon={<Mic />}
                        label="Audio"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<MicOff />}
                        label="No Audio"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Popover>
  );
};
