// SDK type definitions
export type SDKType = "agora" | "twilio" | "zoom";

// Agora supported codecs
export type AgoraVideoCodec = "h264" | "vp8" | "vp9" | "h265";
export type AgoraAudioCodec = "opus" | "aac" | "g711";

// Twilio supported codecs
export type TwilioVideoCodec = "H264" | "VP8" | "VP9";
export type TwilioAudioCodec = "isac" | "opus" | "PCMA" | "PCMU";

// Zoom supported codecs (Zoom typically uses H264 for video and Opus for audio)
export type ZoomVideoCodec = "H264" | "VP8" | "VP9";
export type ZoomAudioCodec = "opus" | "aac";

// Zoom supported modes
export type ZoomVideoMode = "wasm" | "webrtc";
export type ZoomAudioMode = "wasm" | "webrtc";
export type ZoomSABMode = "no-sab" | "sab";

// Common device info
export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: "videoinput" | "audioinput" | "audiooutput";
  groupId: string;
}

// Common user info
export interface RemoteUser {
  uid: string;
  userName?: string | number;
  hasAudio: boolean;
  hasVideo: boolean;
}

// Common connection config
export interface ConnectionConfig {
  sdkKey?: string;
  sdkSecret?: string;
  channelName: string;
  userName: string;
  role?: string;
  videoCodec?: string;
  audioCodec?: string;
  sdkMode?: string;
  enableDualStream?: boolean;
  enableAudioDenoiser?: boolean;
  // Zoom-specific modes
  videoMode?: ZoomVideoMode;
  audioMode?: ZoomAudioMode;
  mediaSdkHash?: string;
  webEndpoint?: string;
  sabMode?: ZoomSABMode;
  signature?: string;
  sessionPwd?: string;
  sessionKey?: string;
  userIdentity?: string;
}

// SDK-specific connection configs
export interface AgoraConnectionConfig extends ConnectionConfig {
  videoCodec?: AgoraVideoCodec;
  audioCodec?: AgoraAudioCodec;
  sdkMode?: "rtc" | "live";
  enableDualStream?: boolean;
  enableAudioDenoiser?: boolean;
}

export interface TwilioConnectionConfig extends ConnectionConfig {
  videoCodec?: TwilioVideoCodec;
  audioCodec?: TwilioAudioCodec;
  // Twilio doesn't use sdkMode or enableDualStream
}

export interface ZoomConnectionConfig extends ConnectionConfig {
  videoCodec?: ZoomVideoCodec;
  audioCodec?: ZoomAudioCodec;
  videoMode?: ZoomVideoMode;
  audioMode?: ZoomAudioMode;
  mediaSdkHash?: string;
  // Zoom doesn't use sdkMode or enableDualStream
}

// Common statistics info
export interface VideoStats {
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

  bandwidth?: number;
  sample_rate?: number;
  jitter?: number;
}

export interface NetworkQuality {
  uplinkNetworkQuality: number;
  downlinkNetworkQuality: number;
  // Detailed network quality statistics
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
}

// SDK callback interface
export interface SDKCallbacks {
  onNetworkQualityChange?: (quality: NetworkQuality) => void;
  onError?: (error: Error) => void;
  onUserJoined?: (user: RemoteUser) => void;
  onUserLeft?: (user: RemoteUser) => void;
  onUserPublished?: (
    user: RemoteUser,
    mediaType: "audio" | "video" | "data"
  ) => void;
  onUserUnpublished?: (
    user: RemoteUser,
    mediaType: "audio" | "video" | "data"
  ) => void;
  onConnectionStateChange?: (state: string, reason?: string) => void;
  onJoinSuccess?: (currentUser: {
    uid: string;
    userName: string;
    hasAudio: boolean;
    hasVideo: boolean;
  }) => void;
  onFailover?: (reason: string) => void;
}

// Unified SDK interface
export interface IVideoSDK {
  // Basic methods
  join(config: ConnectionConfig): Promise<void>;
  leave(): Promise<void>;
  destroy(): Promise<void>;

  // Audio/video control
  startVideo(enable: boolean, deviceId?: string): Promise<void>;
  startAudio(enable: boolean, deviceId?: string): Promise<void>;

  // Device management
  getDeviceList(): Promise<{
    cameras: DeviceInfo[];
    microphones: DeviceInfo[];
    speakers: DeviceInfo[];
  }>;
  setDevice(
    type: "camera" | "microphone" | "speaker" | "playback",
    deviceId: string
  ): Promise<void>;
  getCurrentDeviceLabel(
    type: "camera" | "microphone" | "speaker"
  ): string | null;

  // Statistics info
  getLocalVideoStats(): VideoStats | null | Promise<VideoStats | null>;
  getRemoteVideoStats():
    | { [uid: string]: VideoStats }
    | null
    | Promise<{ [uid: string]: VideoStats } | null>;

  // Callback setup
  setCallbacks(callbacks: SDKCallbacks): void;

  joinAudio?(): Promise<void>;

  // Virtual background (Zoom)
  isVirtualBackgroundSupported?(): Promise<boolean>;
  applyVirtualBackground?(imageUrl: string): Promise<void>;
  clearVirtualBackground?(): Promise<void>;
}
