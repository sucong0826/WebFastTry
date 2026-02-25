import {
  createClient,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  getCameras,
  getMicrophones,
  registerExtensions,
} from "agora-rtc-sdk-ng/esm";
import {
  AIDenoiserExtension,
  AIDenoiserProcessor,
  AIDenoiserProcessorMode,
  AIDenoiserProcessorLevel,
} from "agora-extension-ai-denoiser";
// import { IAudioProcessor } from "agora-rte-extension";

import type {
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IDataChannelConfig,
  SDK_CODEC,
  SDK_MODE,
  NetworkQuality,
  ConnectionState,
  ConnectionDisconnectedReason,
} from "agora-rtc-sdk-ng/esm";

import {
  IVideoSDK,
  ConnectionConfig,
  DeviceInfo,
  RemoteUser,
  VideoStats,
  SDKCallbacks,
} from "../types/sdk";
import { getAgoraToken } from "../http/index";
import { VideoManager } from "../utils/videoManager";
import { VIDEOSDKCOMPARE_API_BASE_URL } from "../config";

const baseURL = VIDEOSDKCOMPARE_API_BASE_URL;

export class AgoraSDK implements IVideoSDK {
  private agoraClient: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private remoteUsers: { [key: string]: RemoteUser } = {};
  private callbacks: SDKCallbacks = {};
  private currentSpeakerDeviceId: string | null = null;

  private remoteVideoStatsInterval: NodeJS.Timeout | null = null;

  private aiDenoiserProcessor: AIDenoiserProcessor | null = null;

  private getTokenParams: {
    channelName: string;
    uid: number;
    role: string;
  } | null = null;

  constructor() {
    // Remove super() call
  }

  setCallbacks(callbacks: SDKCallbacks): void {
    this.callbacks = callbacks;

    // If SDK is already initialized, set up event listeners immediately
    if (this.agoraClient && Object.keys(callbacks).length > 0) {
      this.setupEventListeners();
    }
  }

  async join(config: ConnectionConfig): Promise<void> {
    try {
      const {
        // sdkKey = "",
        // sdkSecret,
        channelName,
        userName,
        role = "host",
        videoCodec = "vp8",
        sdkMode = "rtc",
        enableDualStream = true,
        enableAudioDenoiser = false,
      } = config;

      // if (!appId) {
      //   throw new Error("Agora needs appId to join channel");
      // }

      if (!userName) {
        throw new Error("Username is required");
      }

      // Create Agora client with configuration from login
      this.agoraClient = createClient({
        mode: sdkMode as SDK_MODE,
        codec: videoCodec as SDK_CODEC,
      });

      // Enable dual stream support
      if (enableDualStream) {
        await this.agoraClient.enableDualStream();

        // Set low stream parameters
        this.agoraClient.setLowStreamParameter({
          width: 640,
          height: 360,
          bitrate: 400,
        });
      }

      // Default subscribe to high stream (high quality video stream)
      this.agoraClient.setRemoteDefaultVideoStreamType(0);

      // Setup event listeners only if callbacks are already set
      if (Object.keys(this.callbacks).length > 0) {
        this.setupEventListeners();
      }

      // Convert userName to number as uid
      const uid = parseInt(userName.toString(), 10);
      if (isNaN(uid)) {
        throw new Error("Username must be a valid number");
      }

      this.getTokenParams = { channelName, uid, role };
      const response = await getAgoraToken(channelName, uid, role);

      const finalToken = response.data.token;
      const finalAppId = response.data.appId;

      await this.agoraClient.join(
        finalAppId,
        channelName,
        finalToken || null,
        uid
      );

      // Call onJoinSuccess callback if available
      if (this.callbacks.onJoinSuccess) {
        const currentUser = {
          uid: uid.toString(),
          userName: userName.toString(),
          hasAudio: false, // Will be updated when audio is published
          hasVideo: false, // Will be updated when video is published
        };
        this.callbacks.onJoinSuccess(currentUser);
      }

      console.log(
        `Successfully joined Agora channel: ${channelName} with uid: ${uid} (userName: ${userName}), mode: ${sdkMode}, codec: ${videoCodec}`
      );

      // Store token params for renewal
      this.getTokenParams = { channelName, uid, role };

      // Start stats collection
      this.startStatsCollection();

      console.log("Agora EnableAudioDenoiser", enableAudioDenoiser);
      if (enableAudioDenoiser) {
        await this.initAgoraAIDenoiser();
      }
    } catch (error) {
      console.error("Failed to join Agora channel:", error);
      throw error;
    }
  }

  async initAgoraAIDenoiser() {
    const extension = new AIDenoiserExtension({
      assetsPath: `${baseURL}/agora-assets`,
    });

    if (!extension.checkCompatibility()) {
      console.error("Agora AIDenoiserExtension checkCompatibility failed");
      return;
    }

    registerExtensions([extension]);

    this.aiDenoiserProcessor = extension.createProcessor();

    this.aiDenoiserProcessor.on("loaderror", (e: Error) => {
      console.error("aiDenoiserProcessor loaderror!!!", e);
    });

    // 监听降噪处理耗时过长的事件
    this.aiDenoiserProcessor.on("overload", async (elapsedTime: number) => {
      console.log("aiDenoiserProcessor overload!!!", elapsedTime);

      await this.aiDenoiserProcessor?.setMode(
        AIDenoiserProcessorMode.STATIONARY_NS
      );
    });

    // // SNG：AI 降噪。该模式可以压制噪声类型中的稳态与非稳态噪声。
    // // STATIONARY_NS：稳态降噪。该模式仅压制稳态噪声，建议仅在 AI 降噪处理耗时过长时使用。
    // await this.aiDenoiserProcessor?.setMode(AIDenoiserProcessorMode.NSNG);

    // //SOFT：（推荐）舒缓降噪。
    // // AGGRESSIVE：激进降噪。将降噪强度提高到激进降噪会增大损伤人声的概率。
    // await this.aiDenoiserProcessor?.setLevel(AIDenoiserProcessorLevel.SOFT);

    await this.aiDenoiserProcessor.disable();
  }

  async leave(): Promise<void> {
    if (this.remoteVideoStatsInterval) {
      clearInterval(this.remoteVideoStatsInterval);
      this.remoteVideoStatsInterval = null;
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }

    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }

    await this.agoraClient?.leave();
  }

  async destroy(): Promise<void> {
    await this.leave();
    this.agoraClient = null;
    this.remoteUsers = {};
    this.callbacks = {};
  }

  async startVideo(enable: boolean, deviceId?: string): Promise<void> {
    if (!enable && this.localVideoTrack) {
      await this.agoraClient?.unpublish(this.localVideoTrack);
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
      return;
    }

    if (enable && !this.localVideoTrack) {
      this.localVideoTrack = await createCameraVideoTrack({
        encoderConfig: "720p_3",
        optimizationMode: "motion",
        cameraId: deviceId,
      });

      // Use unified video manager to attach video
      VideoManager.attachAgoraVideoToContainer(
        this.localVideoTrack,
        "self-camera-video",
        {
          fit: "contain",
          mirror: false,
        }
      );

      await this.agoraClient?.publish(this.localVideoTrack);
    }
  }

  async startAudio(enable: boolean): Promise<void> {
    if (!enable && this.localAudioTrack) {
      if (this.aiDenoiserProcessor) {
        console.log("Agora disable audio denoiser");
        await this.aiDenoiserProcessor.disable();
      }

      await this.agoraClient?.unpublish(this.localAudioTrack);

      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
      return;
    }

    if (enable && !this.localAudioTrack) {
      this.localAudioTrack = await createMicrophoneAudioTrack();

      if (this.aiDenoiserProcessor) {
        this.localAudioTrack
          .pipe(this.aiDenoiserProcessor)
          .pipe(this.localAudioTrack.processorDestination);

        console.log("Agora enable audio denoiser");
        await this.aiDenoiserProcessor.enable();
      }

      await this.agoraClient?.publish([this.localAudioTrack]);
    }
  }

  async getDeviceList(): Promise<{
    cameras: DeviceInfo[];
    microphones: DeviceInfo[];
    speakers: DeviceInfo[];
  }> {
    const [cameras, microphones] = await Promise.all([
      getCameras(),
      getMicrophones(),
    ]);

    // some special device id not work when setDevice , we need to filter out
    const filterSpecialDeviceId = (device: DeviceInfo) =>
      device.deviceId === "default" || device.deviceId.length > 15;

    // Get audio output devices (speakers/headphones)
    let speakers: DeviceInfo[] = [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      speakers = devices
        .filter((device) => device.kind === "audiooutput")
        .filter(filterSpecialDeviceId)
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label,
          kind: "audiooutput" as const,
          groupId: device.groupId,
        }));
    } catch (error) {
      console.warn("Failed to get audio output devices:", error);
    }

    return {
      cameras: cameras.filter(filterSpecialDeviceId).map((device) => ({
        deviceId: device.deviceId,
        label: device.label,
        kind: "videoinput" as const,
        groupId: device.groupId,
      })),
      microphones: microphones.filter(filterSpecialDeviceId).map((device) => ({
        deviceId: device.deviceId,
        label: device.label,
        kind: "audioinput" as const,
        groupId: device.groupId,
      })),
      speakers,
    };
  }

  async setDevice(
    type: "camera" | "microphone" | "speaker",
    deviceId: string
  ): Promise<void> {
    if (type === "camera" && this.localVideoTrack) {
      await this.localVideoTrack.setDevice(deviceId);
    } else if (type === "microphone" && this.localAudioTrack) {
      await this.localAudioTrack.setDevice(deviceId);
    } else if (type === "speaker") {
      console.log(`Setting audio output device to: ${deviceId}`);
      this.currentSpeakerDeviceId = deviceId;

      // Set playback device for local audio track if it exists
      if (this.localAudioTrack) {
        try {
          await this.localAudioTrack.setPlaybackDevice(deviceId);
          console.log(`Local audio track playback device set to: ${deviceId}`);
        } catch (error) {
          console.warn(
            "Failed to set local audio track playback device:",
            error
          );
        }
      }

      // Apply the new audio output device to all existing remote audio tracks
      this.applyAudioOutputDeviceToRemoteTracks(deviceId);
    }
  }

  /**
   * Apply the current speaker device setting to all existing remote audio tracks
   */
  private applyAudioOutputDeviceToRemoteTracks(deviceId: string): void {
    try {
      // Get all remote users and their audio tracks
      Object.values(this.remoteUsers).forEach((user) => {
        const remoteUser = this.agoraClient?.remoteUsers.find(
          (ru) => ru.uid.toString() === user.uid
        );

        if (remoteUser && remoteUser.audioTrack) {
          remoteUser.audioTrack
            .setPlaybackDevice(deviceId)
            .then(() => {
              console.log(
                `Applied audio output device to remote track ${user.uid}: ${deviceId}`
              );
            })
            .catch((error) => {
              console.warn(
                `Failed to apply audio output device to remote track ${user.uid}:`,
                error
              );
            });
        }
      });
    } catch (error) {
      console.warn(
        "Failed to apply audio output device to remote tracks:",
        error
      );
    }
  }

  getCurrentDeviceLabel(
    type: "camera" | "microphone" | "speaker"
  ): string | null {
    if (type === "camera" && this.localVideoTrack) {
      // Agora SDK's getTrackLabel method can get current device info
      // Need to find the corresponding deviceId from the device list
      const deviceInfo = this.localVideoTrack.getTrackLabel();
      return deviceInfo || null;
    } else if (type === "microphone" && this.localAudioTrack) {
      const deviceInfo = this.localAudioTrack.getTrackLabel();
      return deviceInfo || null;
    } else if (type === "speaker") {
      // For speakers, we need to find the label from the device list
      // This would need to be implemented with access to the device list
      return this.currentSpeakerDeviceId || null;
    }
    return null;
  }

  getLocalVideoStats(): VideoStats | null {
    const stats = this.agoraClient?.getLocalVideoStats();
    if (!stats) return null;

    return {
      codecType: stats.codecType,
      sendFrameRate: stats.sendFrameRate,
      sendBitrate: stats.sendBitrate,
      sendResolutionWidth: stats.sendResolutionWidth,
      sendResolutionHeight: stats.sendResolutionHeight,
    };
  }

  getRemoteVideoStats(): { [uid: string]: VideoStats } | null {
    const stats = this.agoraClient?.getRemoteVideoStats();
    if (!stats) return null;

    const result: { [uid: string]: VideoStats } = {};
    Object.keys(stats).forEach((uid) => {
      const stat = stats[uid];
      result[uid] = {
        codecType: stat.codecType,
        receiveFrameRate: stat.receiveFrameRate,
        receiveBitrate: stat.receiveBitrate,
        receiveResolutionWidth: stat.receiveResolutionWidth,
        receiveResolutionHeight: stat.receiveResolutionHeight,
        transportDelay: stat.transportDelay,
        packetLossRate: stat.packetLossRate,
      };
    });

    return result;
  }

  private setupEventListeners(): void {
    if (!this.agoraClient) return;

    this.agoraClient.on("network-quality", this.onNetworkQuality);
    this.agoraClient.on(
      "connection-state-change",
      this.onConnectionStateChange
    );
    this.agoraClient.on("user-joined", this.onUserJoined);
    this.agoraClient.on("user-left", this.onUserLeft);
    this.agoraClient.on("user-published", this.onUserPublished);
    this.agoraClient.on("user-unpublished", this.onUserUnPublished);
    this.agoraClient.on(
      "token-privilege-will-expire",
      this.onTokenPrivilegeWillExpire
    );
  }

  private startStatsCollection(): void {
    this.remoteVideoStatsInterval = setInterval(() => {
      // Here you can trigger stats update events
    }, 1000);
  }

  private onNetworkQuality = (stats: NetworkQuality) => {
    this.callbacks.onNetworkQualityChange?.(stats);
  };

  private onConnectionStateChange = (
    curState: ConnectionState,
    revState: ConnectionState,
    reason?: ConnectionDisconnectedReason
  ) => {
    console.log("Connection state changed:", curState, revState, reason);
    this.callbacks.onConnectionStateChange?.(curState);
  };

  private onUserJoined = (user: IAgoraRTCRemoteUser) => {
    console.log("User joined:", user.uid);

    const remoteUser: RemoteUser = {
      uid: `${user.uid}`,
      userName: `${user.uid}`,
      hasAudio: user.hasAudio,
      hasVideo: user.hasVideo,
    };

    this.remoteUsers[remoteUser.uid] = remoteUser;
    this.callbacks.onUserJoined?.(remoteUser);
  };

  private onUserLeft = (user: IAgoraRTCRemoteUser, reason: string) => {
    console.log("User left:", user.uid, reason);

    const remoteUser: RemoteUser = {
      uid: `${user.uid}`,
      userName: `${user.uid}`,
      hasAudio: user.hasAudio,
      hasVideo: user.hasVideo,
    };

    delete this.remoteUsers[remoteUser.uid];
    this.callbacks.onUserLeft?.(remoteUser);
  };

  private onUserPublished = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video" | "datachannel",
    config?: IDataChannelConfig
  ) => {
    // Get the currently stored user info, or create a new one
    const currentUser = this.remoteUsers[`${user.uid}`];

    const remoteUser: RemoteUser = {
      uid: `${user.uid}`,
      userName: `${user.uid}`,
      hasAudio:
        mediaType === "audio" ? true : currentUser?.hasAudio ?? user.hasAudio,
      hasVideo:
        mediaType === "video" ? true : currentUser?.hasVideo ?? user.hasVideo,
    };

    this.remoteUsers[remoteUser.uid] = remoteUser;

    if (mediaType === "video" && this.agoraClient) {
      // Important: set stream fallback option - automatically subscribe to low stream under poor network conditions
      await this.agoraClient.setStreamFallbackOption(user.uid, 1);

      // Subscribe to video stream (but don't render here - RemoteVideoItem will handle rendering)
      await this.agoraClient.subscribe(user.uid, mediaType);
    }

    if (mediaType === "audio" && this.agoraClient) {
      // Subscribe to audio stream
      const remoteTrack = await this.agoraClient.subscribe(user.uid, mediaType);

      // Set audio output device if specified
      if (this.currentSpeakerDeviceId && remoteTrack) {
        try {
          // Use Agora SDK's setPlaybackDevice method for remote audio tracks
          await remoteTrack.setPlaybackDevice(this.currentSpeakerDeviceId);
          console.log(
            `Set playback device for remote audio track ${user.uid}: ${this.currentSpeakerDeviceId}`
          );
        } catch (error) {
          console.warn(
            "Failed to set playback device for remote audio track:",
            error
          );
        }
      }

      remoteTrack?.play();
    }

    if (mediaType === "audio" || mediaType === "video") {
      this.callbacks.onUserPublished?.(remoteUser, mediaType);
    }
  };

  private onUserUnPublished = async (
    user: IAgoraRTCRemoteUser,
    mediaType: "audio" | "video" | "datachannel",
    config?: IDataChannelConfig
  ) => {
    // Get the currently stored user info, or create a new one
    const currentUser = this.remoteUsers[`${user.uid}`];

    const remoteUser: RemoteUser = {
      uid: `${user.uid}`,
      userName: `${user.uid}`,
      hasAudio:
        mediaType === "audio" ? false : currentUser?.hasAudio ?? user.hasAudio,
      hasVideo:
        mediaType === "video" ? false : currentUser?.hasVideo ?? user.hasVideo,
    };

    this.remoteUsers[remoteUser.uid] = remoteUser;

    if (mediaType === "video" && this.agoraClient) {
      await this.agoraClient.unsubscribe(user.uid, mediaType);
    }

    if (mediaType === "audio" || mediaType === "video") {
      this.callbacks.onUserUnpublished?.(remoteUser, mediaType);
    }
  };

  private onTokenPrivilegeWillExpire = async () => {
    console.warn("Token will expire soon");

    if (!this.getTokenParams) return;

    try {
      const { channelName, uid, role } = this.getTokenParams;
      const response = await getAgoraToken(channelName, uid, role);
      await this.agoraClient?.renewToken(response.data.token);
      console.log("Token renewed successfully");
    } catch (error) {
      console.error("Failed to renew token:", error);
      this.callbacks.onError?.(error as Error);
    }
  };
}
