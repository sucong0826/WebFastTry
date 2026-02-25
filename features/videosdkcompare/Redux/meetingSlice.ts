import { createSlice } from "@reduxjs/toolkit";
import {
  SDKType,
  RemoteUser,
  VideoStats,
  NetworkQuality as GenericNetworkQuality,
  DeviceInfo,
  AgoraVideoCodec,
  AgoraAudioCodec,
  TwilioVideoCodec,
  TwilioAudioCodec,
  ZoomVideoCodec,
  ZoomAudioCodec,
  ZoomVideoMode,
  ZoomAudioMode,
  ZoomSABMode,
} from "../types/sdk";

import type {
  ClientRole,
  SDK_MODE,
  SVCConfiguration,
} from "agora-rtc-sdk-ng/esm";

const defualtAccount = {
  sdkKey: "",
  sdkSecret: "",
  sessionName: "",
};

export interface LoginInfo {
  sdk: SDKType;

  videoCodec: AgoraVideoCodec | TwilioVideoCodec | ZoomVideoCodec | string;
  audioCodec: AgoraAudioCodec | TwilioAudioCodec | ZoomAudioCodec | string;
  sdkMode: SDK_MODE | string;

  // Agora-specific
  optimizationMode: OptimizationMode;
  SVCConfiguration: SVCConfiguration;
  enableDualStream: boolean;
  /****/

  enableAudioDenoiser: boolean;
  enableBuiltInDenoiser: boolean;

  sdkKey: string;
  sdkSecret: string;
  userName: string | number;
  sessionName: string; // topic
  role: ClientRole | string;

  sessionPwd: string;

  // Zoom-specific modes
  videoMode?: ZoomVideoMode;
  audioMode?: ZoomAudioMode;
  mediaSdkHash?: string;
  enablePlaybackFile?: boolean;
  webEndpoint?: string;
  sabMode?: ZoomSABMode;
  signature?: string;
  sessionKey?: string;
  userIdentity?: string;
  /***/
}

export type OptimizationMode = "motion" | "detail";

export interface Users {
  [uid: string]: RemoteUser;
}

export interface DeviceList {
  camera: {
    current: DeviceInfo;
    list: DeviceInfo[];
  };
  microphone: {
    current: DeviceInfo;
    list: DeviceInfo[];
  };
  speaker: {
    current: DeviceInfo;
    list: DeviceInfo[];
  };
  selectedPlaybackFile: string | null;
}
export interface AutoJoinConfig {
  isAutoJoin: boolean;

  sdkKey: string;
  sdkSecret: string;

  sessionName: string;
  userName: string;

  role: ClientRole;

  videoMode: ZoomVideoMode;
  audioMode: ZoomAudioMode;

  cameraName: string;
  microphoneName: string;
  speakerName: string;

  // Media settings
  enableVideo?: boolean;
  enableAudio?: boolean;

  // Full screen settings
  selfFull: boolean;
  remoteFull: boolean;

  mediaSdkHash: string;
  enablePlaybackFile: boolean;
  webEndpoint?: string;
  sabMode?: ZoomSABMode;
  signature?: string;
  sessionPwd?: string;
  sessionKey?: string;
  userIdentity?: string;
}

export interface MeetingState {
  loginInfo: LoginInfo;
  currentUser: {
    uid: string;
    userName: string;
    hasAudio: boolean;
    hasVideo: boolean;
  } | null;
  remoteUsers: Users;
  remoteUserVideoTrackStats: {
    [uid: string]: VideoStats;
  };
  localVideoStats: VideoStats;
  networkLevel: GenericNetworkQuality;
  connectionState: string;

  deviceList: DeviceList;

  common: {
    selfFullScreen: {
      isFullScrreen: boolean;
      isCSSFullscreen: boolean;
    };
    remoteFullScreen: {
      isFullScrreen: boolean;
      isCSSFullscreen: boolean;
    };

    isVideoEnabled: false; // self video enabled
    isAudioEnabled: false; // self audio enabled
  };

  autoJoinConfig: AutoJoinConfig;
}

const initialState: MeetingState = {
  loginInfo: {
    sdk: "zoom",
    sdkKey: defualtAccount.sdkKey,
    sdkSecret: defualtAccount.sdkSecret,
    userName: `${Math.floor(Math.random() * 1000) + 1}`,
    sessionName: defualtAccount.sessionName,
    sessionPwd: "",
    role: "audience",

    mediaSdkHash: "", //
    enablePlaybackFile: false,
    webEndpoint: "zoomdev.us",
    sabMode: "no-sab",
    signature: "",
    sessionKey: "",
    userIdentity: "",

    videoCodec: "h264", // Default for Agora SDK
    audioCodec: "opus",

    sdkMode: "rtc",
    optimizationMode: "motion",
    SVCConfiguration: {
      numSpatialLayers: 3,
      numTemporalLayers: 3,
    },
    enableDualStream: true,
    enableAudioDenoiser: false,
    enableBuiltInDenoiser: false,
  },
  currentUser: null,
  remoteUsers: {},
  remoteUserVideoTrackStats: {},
  localVideoStats: {},
  networkLevel: {
    uplinkNetworkQuality: 0,
    downlinkNetworkQuality: 0,
  },
  connectionState: "disconnected",

  deviceList: {
    camera: {
      current: { deviceId: "", label: "", groupId: "", kind: "videoinput" },
      list: [],
    },
    microphone: {
      current: { deviceId: "", label: "", groupId: "", kind: "audioinput" },
      list: [],
    },
    speaker: {
      current: { deviceId: "", label: "", groupId: "", kind: "audiooutput" },
      list: [],
    },
    selectedPlaybackFile: null,
  },

  common: {
    selfFullScreen: {
      isFullScrreen: false,
      isCSSFullscreen: false,
    },
    remoteFullScreen: {
      isFullScrreen: false,
      isCSSFullscreen: false,
    },
    isVideoEnabled: false,
    isAudioEnabled: false,
  },

  autoJoinConfig: {
    isAutoJoin: false,

    sdkKey: "",
    sdkSecret: "",
    sessionName: "",
    userName: "",

    role: "audience",

    videoMode: "webrtc", // Default for Agora SDK
    audioMode: "webrtc",

    cameraName: "",
    microphoneName: "",
    speakerName: "",

    // Full screen settings
    selfFull: false,
    remoteFull: false,

    enableVideo: false,
    enableAudio: false,

    mediaSdkHash: "",
    enablePlaybackFile: false,
    webEndpoint: "zoomdev.us",
    sabMode: "no-sab",
    signature: "",
    sessionPwd: "",
    sessionKey: "",
    userIdentity: "",
  },
};

export const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {
    setLoginInfo: (state, action) => {
      state.loginInfo = Object.assign({}, state.loginInfo, action.payload);
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateCurrentUser: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    addRemoteUsers: (state, action) => {
      const data = action.payload;
      if (state.remoteUsers[data.uid]) {
        state.remoteUsers[data.uid] = {
          ...state.remoteUsers[data.uid],
          ...data,
        };
      } else {
        state.remoteUsers[data.uid] = data;
      }
    },

    removeRemoteUsers: (state, action) => {
      const uid = action.payload;
      if (state.remoteUsers[uid]) {
        delete state.remoteUsers[uid];
      }
    },

    updateRemoteUserVideoTrackStats: (state, action) => {
      Object.keys(action.payload || {}).forEach((key) => {
        const item = action.payload[key];
        state.remoteUserVideoTrackStats[key] = Object.assign(
          {},
          state.remoteUserVideoTrackStats[key] || {},
          item
        );
      });
    },

    updateLocalVideoStats: (state, action) => {
      state.localVideoStats = Object.assign(
        {},
        state.localVideoStats || {},
        action.payload || {}
      );
    },

    updateNetworkLevel: (state, action) => {
      state.networkLevel = Object.assign(
        {},
        state.networkLevel || {},
        action.payload || {}
      );
    },

    updateConnectionState: (state, action) => {
      state.connectionState = action.payload;
    },

    updateSelectedPlaybackFile: (state, action) => {
      state.deviceList.selectedPlaybackFile = action.payload;
    },

    updateCameraList: (state, action) => {
      state.deviceList.camera.list = action.payload;
    },

    updateCurrentCamera: (state, action) => {
      const device = action.payload;
      if (typeof device === "string") {
        // Handle legacy case where label is passed
        const data = state.deviceList.camera.list;
        for (let i = 0; i < data.length; i++) {
          if (device === data[i].label) {
            state.deviceList.camera.current = data[i];
            break;
          }
        }
      } else if (device && device.deviceId) {
        // Handle case where device object is passed
        state.deviceList.camera.current = device;
      }
    },

    updateCurrentCameraById: (state, action) => {
      const deviceId = action.payload;
      const data = state.deviceList.camera.list;
      for (let i = 0; i < data.length; i++) {
        if (deviceId === data[i].deviceId) {
          state.deviceList.camera.current = data[i];
          break;
        } else {
          state.deviceList.camera.current = {
            deviceId: "",
            label: "",
            groupId: "",
            kind: "videoinput",
          };
        }
      }
    },

    updateMicrophoneList: (state, action) => {
      state.deviceList.microphone.list = action.payload;
    },

    updateCurrentMicrophone: (state, action) => {
      const device = action.payload;
      if (typeof device === "string") {
        // Handle legacy case where label is passed
        const data = state.deviceList.microphone.list;
        for (let i = 0; i < data.length; i++) {
          if (device === data[i].label) {
            state.deviceList.microphone.current = data[i];
            break;
          }
        }
      } else if (device && device.deviceId) {
        // Handle case where device object is passed
        state.deviceList.microphone.current = device;
      }
    },

    updateCurrentMicrophoneById: (state, action) => {
      const deviceId = action.payload;
      const data = state.deviceList.microphone.list;
      for (let i = 0; i < data.length; i++) {
        if (deviceId === data[i].deviceId) {
          state.deviceList.microphone.current = data[i];
          break;
        }
      }
    },

    updateSpeakerList: (state, action) => {
      state.deviceList.speaker.list = action.payload;
    },

    updateCurrentSpeaker: (state, action) => {
      const device = action.payload;
      if (typeof device === "string") {
        // Handle legacy case where label is passed
        const data = state.deviceList.speaker.list;
        for (let i = 0; i < data.length; i++) {
          if (device === data[i].label) {
            state.deviceList.speaker.current = data[i];
            break;
          }
        }
      } else if (device && device.deviceId) {
        // Handle case where device object is passed
        state.deviceList.speaker.current = device;
      }
    },

    updateCurrentSpeakerById: (state, action) => {
      const deviceId = action.payload;
      const data = state.deviceList.speaker.list;
      for (let i = 0; i < data.length; i++) {
        if (deviceId === data[i].deviceId) {
          state.deviceList.speaker.current = data[i];
          break;
        }
      }
    },

    updateSelfFullScrreen: (state, action) => {
      state.common.selfFullScreen = {
        ...state.common.selfFullScreen,
        ...action.payload,
      };
    },
    updateRemoteFullScrreen: (state, action) => {
      state.common.remoteFullScreen = {
        ...state.common.remoteFullScreen,
        ...action.payload,
      };
    },
    updateIsVideoEnabled: (state, action) => {
      state.common.isVideoEnabled = action.payload;
    },
    updateIsAudioEnabled: (state, action) => {
      state.common.isAudioEnabled = action.payload;
    },

    setAutoJoinConfig: (state, action) => {
      state.autoJoinConfig = {
        ...state.autoJoinConfig,
        ...action.payload,
      };
    },

    // 清理会议状态，重置为初始状态
    clearMeetingState: (state) => {
      // 保留loginInfo，但清理其他会议相关状态
      state.currentUser = null;
      state.remoteUsers = {};
      state.remoteUserVideoTrackStats = {};
      state.localVideoStats = {};
      state.networkLevel = {
        uplinkNetworkQuality: 0,
        downlinkNetworkQuality: 0,
      };
      state.connectionState = "disconnected";
      state.deviceList = {
        camera: {
          current: { deviceId: "", label: "", groupId: "", kind: "videoinput" },
          list: [],
        },
        microphone: {
          current: { deviceId: "", label: "", groupId: "", kind: "audioinput" },
          list: [],
        },
        speaker: {
          current: {
            deviceId: "",
            label: "",
            groupId: "",
            kind: "audiooutput",
          },
          list: [],
        },
        selectedPlaybackFile: null,
      };
      state.common = {
        selfFullScreen: {
          isFullScrreen: false,
          isCSSFullscreen: false,
        },
        remoteFullScreen: {
          isFullScrreen: false,
          isCSSFullscreen: false,
        },
        isVideoEnabled: false,
        isAudioEnabled: false,
      };

      state.autoJoinConfig = {
        isAutoJoin: false,

        sdkKey: "",
        sdkSecret: "",
        sessionName: "",
        userName: "",

        role: "audience",

        videoMode: "webrtc",
        audioMode: "webrtc",

        cameraName: "",
        microphoneName: "",
        speakerName: "",

        // Full screen settings
        selfFull: false,
        remoteFull: false,

        enableVideo: false,
        enableAudio: false,

        mediaSdkHash: "",
        enablePlaybackFile: false,
        webEndpoint: "zoomdev.us",
        sabMode: "no-sab",
        signature: "",
        sessionPwd: "",
        sessionKey: "",
        userIdentity: "",
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setLoginInfo,
  setCurrentUser,
  updateCurrentUser,
  addRemoteUsers,
  removeRemoteUsers,
  updateRemoteUserVideoTrackStats,
  updateLocalVideoStats,
  updateNetworkLevel,
  updateConnectionState,
  updateSelectedPlaybackFile,
  updateCameraList,
  updateCurrentCamera,
  updateCurrentCameraById,
  updateMicrophoneList,
  updateCurrentMicrophone,
  updateCurrentMicrophoneById,
  updateSpeakerList,
  updateCurrentSpeaker,
  updateCurrentSpeakerById,
  setAutoJoinConfig,
  clearMeetingState,
  updateSelfFullScrreen,
  updateRemoteFullScrreen,
  updateIsVideoEnabled,
  updateIsAudioEnabled,
} = meetingSlice.actions;

export default meetingSlice.reducer;
