import {
  IVideoSDK,
  ConnectionConfig,
  DeviceInfo,
  RemoteUser,
  VideoStats,
  SDKCallbacks,
} from "../types/sdk";
// import { VideoManager, ZoomVideoOptions } from "../utils/videoManager";
import { getZoomToken } from "../http/index";

// Import Zoom Video SDK
import ZoomVideo, {
  event_connection_change,
  event_current_audio_change,
  event_user_add,
  event_user_update,
  event_user_remove,
  event_network_quality_change,
  event_audio_statistic_data_change,
  event_video_statistic_data_change,
  VideoQuality,
} from "@zoom/videosdk";

// Zoom Video SDK types
import type {
  Participant,
  NetworkQuality as ZoomNetworkQuality,
  VideoQosData,
  AudioQosData,
  MediaDevice,
  ConnectionState,
  VideoActiveState,
  VideoCapturingState,
  AudioOption,
  CaptureVideoOption,
  StatisticOption,
  VideoStatisticOption,
} from "@zoom/videosdk";

export class ZoomSDK implements IVideoSDK {
  private zoomClient: ReturnType<typeof ZoomVideo.createClient> | null = null;
  private mediaStream: ReturnType<
    ReturnType<typeof ZoomVideo.createClient>["getMediaStream"]
  > | null = null;
  private remoteUsers: { [key: string]: RemoteUser } = {};
  private callbacks: SDKCallbacks = {};
  private currentSpeakerDeviceId: string | null = null;
  private currentUserId: string | null = null;

  private enableAudioDenoiser: boolean = false;

  private isStartAudioStream: boolean = false;

  // private getTokenParams: {
  //   identity: string;
  //   expireTime: number;
  // } | null = null;

  constructor() {
    // Remove super() call
  }

  setCallbacks(callbacks: SDKCallbacks): void {
    this.callbacks = callbacks;

    // If SDK is already initialized, set up event listeners immediately
    if (this.zoomClient && Object.keys(callbacks).length > 0) {
      this.setupEventListeners();
    }
  }

  /**
   * Get current user ID from Zoom session
   */
  private getCurrentUserId(): string | null {
    if (!this.zoomClient) return null;

    try {
      const sessionInfo = this.zoomClient.getSessionInfo();
      return sessionInfo?.userId?.toString() || null;
    } catch (error) {
      console.warn("Failed to get current user ID:", error);
      return null;
    }
  }

  /**
   * Check if user is current user
   */
  private isCurrentUser(userId: number | string): boolean {
    if (!this.currentUserId) {
      // Try to get current user ID if not set
      this.currentUserId = this.getCurrentUserId();
    }
    return this.currentUserId === userId.toString();
  }

  async join(config: ConnectionConfig): Promise<void> {
    try {
      const {
        sdkKey = "",
        sdkSecret = "",
        signature = "",
        channelName,
        userName,
        sessionPwd = "",
        sessionKey = "",
        userIdentity = "",
        webEndpoint = "zoom.us",
        sabMode = "no-sab",
        videoCodec,
        audioCodec,
        role = "host",
        videoMode,
        audioMode,
        mediaSdkHash = "",
        enableAudioDenoiser = false,
      } = config;

      if (!userName) {
        throw new Error("Username is required");
      }

      if (!channelName) {
        throw new Error("Channel name is required");
      }

      let accessToken: string = signature;
      if (!accessToken) {
        try {
          const response = await getZoomToken({
            sdkKey,
            sdkSecret,

            role: role === "host" ? 1 : 0,

            userIdentity: userIdentity || userName.toString(),

            sessionName: channelName,
            sessionKey: sessionKey || "",

            videoWebRtcMode: videoMode === "webrtc" ? 1 : 0,
            audioWebRtcMode: audioMode === "webrtc" ? 1 : 0,

            expirationSeconds: 3600 * 24,

            geoRegions: ["US"], // US , CN

            cloudRecordingOption: 0,
            cloudRecordingElection: 0,

            telemetryTrackingId: "",
          });

          accessToken = response.data.token;
        } catch (error) {
          console.error("Failed to get Zoom token:", error);
          throw new Error("Failed to get Zoom token automatically");
        }
      }

      // Store token params for renewal
      // this.getTokenParams = {
      //   identity: userName.toString(),
      //   expireTime: 3600 * 2,
      // };

      this.enableAudioDenoiser = enableAudioDenoiser;
      // Create Zoom client
      this.zoomClient = ZoomVideo.createClient();

      const mediaSDKPath = `https://d27xp8zu78jmsf.cloudfront.net/web-media/${mediaSdkHash}/`;
      const dependentAssets = mediaSdkHash ? mediaSDKPath : "CN";

      // const dependentAssets = "https://videosdk.zoomdev.us/2.3.0/lib/";

      const options = {
        // enforceMultipleVideos: true,
        // patchJsMedia: true, // Automatically apply the latest media dependency fixes
        webEndpoint, // dev account may need zoomdev.us
        enforceMultipleVideos:
          sabMode === "no-sab" && !window.crossOriginIsolated,
        enforceVirtualBackground:
          sabMode === "no-sab" && !window.crossOriginIsolated,
      };

      // Initialize Zoom client with configuration
      await this.zoomClient.init("en-US", dependentAssets, options);

      console.log("Zoom VideoSDK init Success");

      // // Get media stream
      // this.mediaStream = this.zoomClient.getMediaStream();

      // Setup event listeners only if callbacks are already set
      if (Object.keys(this.callbacks).length > 0) {
        this.setupEventListeners();
      }

      console.log(
        ` joined Zoom session before: ${channelName} with userName: ${userName} , role: ${role}, videoCodec: ${videoCodec}, audioCodec: ${audioCodec}, mediaSdkHash: ${
          mediaSdkHash || "default"
        }`,
      );

      await this.zoomClient.join(
        channelName,
        accessToken,
        userName,
        sessionPwd,
      );

      // Get session info after successful join
      const sessionInfo = this.zoomClient.getSessionInfo();
      console.log("zoom getSessionInfo", sessionInfo);

      window.VideoCompare.sessionInfo = sessionInfo;

      // report log to global tracing
      // await this.zoomClient.getLoggerClient().reportToGlobalTracing();

      if (this.zoomClient) {
        // Get media stream
        this.mediaStream = this.zoomClient.getMediaStream();

        if (this.enableAudioDenoiser) {
          console.log("Zoom enable audio denoiser");
          await this.mediaStream.enableBackgroundNoiseSuppression(true);
        }
      }

      console.log("Zoom VideoSDK initStream Success");

      // Update current user ID
      this.currentUserId = sessionInfo?.userId?.toString() || null;

      // Call onJoinSuccess callback if available
      if (this.callbacks.onJoinSuccess) {
        const currentUser = {
          uid: this.currentUserId || userName.toString(),
          userName: userName.toString(),
          hasAudio: false, // Will be updated when audio is published
          hasVideo: false, // Will be updated when video is published
        };
        this.callbacks.onJoinSuccess(currentUser);
      }

      console.log(
        `Successfully joined Zoom session: ${channelName} with userName: ${userName} (uid: ${
          this.currentUserId
        }), role: ${role}, videoCodec: ${videoCodec}, audioCodec: ${audioCodec}, mediaSdkHash: ${
          mediaSdkHash || "default"
        }`,
      );

      // Start stats collection
      this.startStatsCollection();
    } catch (error) {
      console.error("Failed to join Zoom session:", error);
      throw error;
    }
  }

  async joinAudio(deviceId?: string) {
    if (!this.isStartAudioStream) {
      this.isStartAudioStream = true;
      const params: AudioOption = {
        highBitrate: true,
        mute: true,
        // backgroundNoiseSuppression: true,
        // microphoneId: defaultDevices.microphoneId || "",
        // speakerId: defaultDevices.speakerId || "",
      };
      if (deviceId) {
        params.mediaFile = { url: deviceId, loop: true };
      }

      await this.mediaStream?.startAudio(params);

      console.log("Zoom joinAudio Success");
    }
  }
  async leaveAudio() {
    if (this.mediaStream) {
      this.isStartAudioStream = false;
      // leave audio
      await this.mediaStream.stopAudio();
    }
  }

  // leave meeting
  async leave(): Promise<void> {
    // leave audio
    await this.leaveAudio();

    if (this.zoomClient) {
      await this.zoomClient.leave();
    }
  }

  async destroy(): Promise<void> {
    await this.leave();
    if (this.zoomClient) {
      await ZoomVideo.destroyClient();
      this.zoomClient = null;
    }
    this.mediaStream = null;
    this.remoteUsers = {};
    this.callbacks = {};
    // this.getTokenParams = null;
  }

  async startVideo(enable: boolean, deviceId?: string): Promise<void> {
    if (!this.mediaStream) return;

    if (enable) {
      const isPlayback = deviceId?.includes(".mp4");
      const params =
        isPlayback && deviceId
          ? { mediaFile: { url: deviceId, loop: true } }
          : { cameraId: deviceId };

      // Start video capture with options
      const videoOptions: CaptureVideoOption = {
        hd: true, // Enable HD video
        fullHd: true, // Enable full HD video
        mirrored: false,
        ...params,
      };

      console.log("startVideo videoOptions: ", videoOptions);
      await this.mediaStream.startVideo(videoOptions);

      console.log("startVideo startVideo Success, deviceId: ", deviceId);

      // attach video to
      if (this.currentUserId) {
        await this.mediaStream.attachVideo(
          parseInt(this.currentUserId, 10),
          VideoQuality.Video_720P,
          "#self-camera-video",
        );
      }
    } else {
      await this.mediaStream.stopVideo();
    }
  }

  async startAudio(enable: boolean, deviceId?: string): Promise<void> {
    if (!this.mediaStream) {
      console.log("startAudio mediaStream is not initialized");
      return;
    }

    // if (!this.isStartAudioStream) {
    //   await this.joinAudio();
    //   this.isStartAudioStream = true;
    // }

    if (enable) {
      await this.mediaStream.unmuteAudio();
    } else {
      await this.mediaStream.muteAudio();
    }
  }

  // some special device id not work when setDevice , we need to filter out
  private checkDeviceId(deviceId: string): boolean {
    return deviceId === "default" || deviceId.length > 15;
  }

  async getDeviceList(): Promise<{
    cameras: DeviceInfo[];
    microphones: DeviceInfo[];
    speakers: DeviceInfo[];
  }> {
    try {
      const devices = await ZoomVideo.getDevices();

      console.log("getDeviceList getDevices ==>", devices);

      const cameras: DeviceInfo[] = [];
      const microphones: DeviceInfo[] = [];
      const speakers: DeviceInfo[] = [];

      devices.forEach((device: MediaDeviceInfo) => {
        if (this.checkDeviceId(device.deviceId)) {
          const deviceInfo: DeviceInfo = {
            deviceId: device.deviceId,
            label: device.label,
            kind: device.kind as "videoinput" | "audioinput" | "audiooutput",
            groupId: device.groupId || "",
          };

          switch (device.kind) {
            case "videoinput":
              cameras.push(deviceInfo);
              break;
            case "audioinput":
              microphones.push(deviceInfo);
              break;
            case "audiooutput":
              speakers.push(deviceInfo);
              break;
          }
        }
      });

      return { cameras, microphones, speakers };
    } catch (error) {
      console.error("Failed to get device list:", error);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }

  async setDevice(
    type: "camera" | "microphone" | "speaker" | "playback",
    deviceId: string,
  ): Promise<void> {
    if (!this.mediaStream) return;

    console.log("setDevice type ==>", type, "deviceId ==>", deviceId);
    try {
      switch (type) {
        case "playback":
          await this.mediaStream.switchCamera({ url: deviceId, loop: true });
          await this.mediaStream.switchMicrophone({
            url: deviceId,
            loop: true,
          });

          break;
        case "camera":
          await this.mediaStream.switchCamera(deviceId);
          break;
        case "microphone":
          await this.mediaStream.switchMicrophone(deviceId);
          break;
        case "speaker":
          await this.mediaStream.switchSpeaker(deviceId);
          break;
      }
    } catch (error) {
      console.error(`Failed to set ${type} device:`, error);
      throw error;
    }
  }

  getCurrentDeviceLabel(
    type: "camera" | "microphone" | "speaker",
  ): string | null {
    if (!this.mediaStream) return null;

    try {
      switch (type) {
        case "camera":
          return this.mediaStream.getActiveCamera();
        case "microphone":
          return this.mediaStream.getActiveMicrophone();
        case "speaker":
          return this.mediaStream.getActiveSpeaker();
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to get current ${type} device:`, error);
      return null;
    }
  }

  async getLocalVideoStats(): Promise<VideoStats | null> {
    if (!this.mediaStream) return null;

    try {
      const stats = this.mediaStream.getVideoStatisticData();
      if (!stats || !stats.encode) return null;

      const encodeStats = stats.encode;
      return {
        codecType: "",
        sendFrameRate: encodeStats.fps,
        sendBitrate: encodeStats.bitrate,
        sendResolutionWidth: encodeStats.width,
        sendResolutionHeight: encodeStats.height,
        transportDelay: encodeStats.rtt,
        packetLossRate: encodeStats.avg_loss,

        bandwidth: encodeStats.bandwidth,
        sample_rate: encodeStats.sample_rate,
        jitter: encodeStats.jitter,
      };
    } catch (error) {
      console.error("Failed to get local video stats:", error);
      return null;
    }
  }

  async getRemoteVideoStats(): Promise<{ [uid: string]: VideoStats } | null> {
    if (!this.mediaStream) return null;

    try {
      const stats = this.mediaStream.getVideoStatisticData();
      if (!stats || !stats.decode) return null;

      const decodeStats = stats.decode;
      const remoteStats: { [uid: string]: VideoStats } = {};

      // Get all users
      const allUsers = this.zoomClient?.getAllUser() || [];
      allUsers.forEach((user: Participant) => {
        if (user.userId !== this.zoomClient?.getCurrentUserInfo()?.userId) {
          remoteStats[user.userId.toString()] = {
            codecType: "",
            receiveFrameRate: decodeStats.fps,
            receiveBitrate: decodeStats.bitrate,
            receiveResolutionWidth: decodeStats.width,
            receiveResolutionHeight: decodeStats.height,
            transportDelay: decodeStats.rtt,
            packetLossRate: decodeStats.avg_loss,

            bandwidth: decodeStats.bandwidth,
            sample_rate: decodeStats.sample_rate,
            jitter: decodeStats.jitter,
          };
        }
      });

      return remoteStats;
    } catch (error) {
      console.error("Failed to get remote video stats:", error);
      return null;
    }
  }

  async isVirtualBackgroundSupported(): Promise<boolean> {
    if (!this.mediaStream) return false;
    try {
      return this.mediaStream.isSupportVirtualBackground();
    } catch (error) {
      console.warn("Failed to detect virtual background support:", error);
      return false;
    }
  }

  async applyVirtualBackground(imageUrl: string): Promise<void> {
    if (!this.mediaStream) {
      throw new Error("Media stream is not initialized");
    }

    if (!this.mediaStream.isSupportVirtualBackground()) {
      throw new Error("Virtual background is not supported on this device");
    }

    if (!this.mediaStream.isCapturingVideo()) {
      throw new Error("Please start video before enabling virtual background");
    }

    await this.mediaStream.updateVirtualBackgroundImage(imageUrl, true);
  }

  async clearVirtualBackground(): Promise<void> {
    if (!this.mediaStream) {
      throw new Error("Media stream is not initialized");
    }

    if (!this.mediaStream.isSupportVirtualBackground()) {
      return;
    }

    await this.mediaStream.updateVirtualBackgroundImage(undefined);
    await this.mediaStream.stopPreviewVirtualBackground();
  }

  private setupEventListeners(): void {
    if (!this.zoomClient) return;

    // Connection state change
    this.zoomClient.on(
      "connection-change",
      (payload: Parameters<typeof event_connection_change>[0]) => {
        if (this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange(payload.state, payload.reason);
        }

        if (payload.state === "Reconnecting" && payload.reason === "failover") {
          if (this.callbacks.onFailover) {
            this.callbacks.onFailover(payload.reason);
          }
        }
      },
    );

    this.zoomClient.on(
      "current-audio-change",
      (payload: Parameters<typeof event_current_audio_change>[0]) => {
        console.log("zoom current-audio-change", payload);
      },
    );

    // User joined
    this.zoomClient.on(
      "user-added",
      (payload: Parameters<typeof event_user_add>[0]) => {
        // console.log("zoom user-added", payload);

        payload.forEach(
          (user: Parameters<typeof event_user_add>[0][number]) => {
            // Filter out current user
            if (this.isCurrentUser(user.userId)) {
              console.log(
                "zoom user-added: Skipping current user",
                user.userId,
              );
              return;
            }

            const remoteUser: RemoteUser = {
              uid: `${user.userId}`,
              userName: `${user.displayName}`, // user.displayName || `User ${user.userId}`,
              hasAudio: user.audio === "computer" || user.audio === "phone",
              hasVideo: user.bVideoOn || false,
            };

            this.remoteUsers[remoteUser.uid] = remoteUser;

            // If user already has video enabled when joining, render it immediately
            if (remoteUser.hasVideo) {
              // this.attachRemoteVideo(user.userId);
              if (this.callbacks.onUserPublished) {
                this.callbacks.onUserPublished(remoteUser, "video");
              }
            }

            // If user already has audio enabled when joining, trigger audio published event
            if (remoteUser.hasAudio && this.callbacks.onUserPublished) {
              this.callbacks.onUserPublished(remoteUser, "audio");
            }

            if (this.callbacks.onUserJoined) {
              this.callbacks.onUserJoined(remoteUser);
            }
          },
        );
      },
    );

    // User left
    this.zoomClient.on(
      "user-removed",
      (payload: Parameters<typeof event_user_remove>[0]) => {
        console.log("zoom user-removed", payload);

        payload.forEach(
          (user: Parameters<typeof event_user_remove>[0][number]) => {
            // Filter out current user
            if (this.isCurrentUser(user.userId)) {
              console.log(
                "zoom user-removed: Skipping current user",
                user.userId,
              );
              return;
            }

            const uid = user.userId.toString();
            const remoteUser = this.remoteUsers[uid];

            if (remoteUser && this.callbacks.onUserLeft) {
              this.callbacks.onUserLeft(remoteUser);
            }

            delete this.remoteUsers[uid];
          },
        );
      },
    );

    // User updated (audio/video state change)
    this.zoomClient.on(
      "user-updated",
      (payload: Parameters<typeof event_user_update>[0]) => {
        // console.log("zoom user-updated", payload);
        payload.forEach(
          (user: Parameters<typeof event_user_update>[0][number]) => {
            // Filter out current user
            if (this.isCurrentUser(user.userId)) {
              // console.log(
              //   "zoom user-updated: Skipping current user",
              //   user.userId
              // );
              return;
            }

            const uid = user.userId.toString();
            const remoteUser = this.remoteUsers[uid];

            if (remoteUser) {
              const hadAudio = remoteUser.hasAudio;
              const hadVideo = remoteUser.hasVideo;

              // handle video state changes
              if ("bVideoOn" in user && user.bVideoOn !== undefined) {
                remoteUser.hasVideo = !!user.bVideoOn;
                // Handle video state changes using attachVideo API
                if (user.bVideoOn && !hadVideo) {
                  this.callbacks?.onUserPublished?.(remoteUser, "video");
                } else if (!user.bVideoOn && hadVideo) {
                  this.callbacks?.onUserUnpublished?.(remoteUser, "video");
                }
              }

              if ("audio" in user && user.audio !== undefined) {
                const exisAudio =
                  user.audio === "computer" || user.audio === "phone";
                remoteUser.hasAudio = !!exisAudio;
                // Handle audio state changes
                if (exisAudio && !hadAudio) {
                  remoteUser.hasAudio = true;
                  this.callbacks?.onUserPublished?.(remoteUser, "audio");
                } else if (!exisAudio && hadAudio) {
                  this.callbacks?.onUserUnpublished?.(remoteUser, "audio");
                }
              }
            }
          },
        );
      },
    );

    // Network quality change
    this.zoomClient.on(
      "network-quality-change",
      (payload: Parameters<typeof event_network_quality_change>[0]) => {
        console.log("VideoSDK network-quality-change payload ==>", payload);

        if (this.callbacks.onNetworkQualityChange) {
          const networkQuality = this.convertZoomNetworkQuality(payload);
          this.callbacks.onNetworkQualityChange(networkQuality);
        }
      },
    );

    // Audio statistics data change
    this.zoomClient.on(
      "audio-statistic-data-change",
      (payload: Parameters<typeof event_audio_statistic_data_change>[0]) => {
        // Handle audio statistics if needed
      },
    );

    // Video statistics data change
    this.zoomClient.on(
      "video-statistic-data-change",
      (payload: Parameters<typeof event_video_statistic_data_change>[0]) => {
        //   payload example:
        //   {
        //     "data": {
        //         "bitrate": 121123,
        //         "encoding": false,
        //         "width": 960,
        //         "height": 540,
        //         "fps": 22,
        //         "rtt": 2,
        //         "jitter": 3,
        //         "avg_loss": 0,
        //         "max_loss": 0,
        //         "bandwidth": 815371
        //     },
        //     "type": "VIDEO_QOS_DATA"
        // }
        // Handle video statistics if needed
        // console.log(
        //   "VideoSDK video-statistic-data-change payload ==>",
        //   payload
        // );
      },
    );

    // Error handling
    this.zoomClient.on("error", (error: Error) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });
  }

  private startStatsCollection(): void {
    if (!this.mediaStream) return;

    // Subscribe to video statistics
    const videoStatsOption: VideoStatisticOption = {
      encode: true,
      decode: true,
    };
    this.mediaStream.subscribeVideoStatisticData(videoStatsOption);

    // Subscribe to audio statistics
    const audioStatsOption: StatisticOption = { encode: true, decode: true };
    this.mediaStream.subscribeAudioStatisticData(audioStatsOption);
  }

  private convertZoomNetworkQuality(
    zoomQuality: Parameters<typeof event_network_quality_change>[0],
  ): {
    uplinkNetworkQuality: number;
    downlinkNetworkQuality: number;
  } {
    // Zoom network quality is per-user and per-direction
    // We'll use the current user's quality or default values
    return {
      uplinkNetworkQuality:
        zoomQuality.type === "uplink" ? zoomQuality.level : 0,
      downlinkNetworkQuality:
        zoomQuality.type === "downlink" ? zoomQuality.level : 0,
    };
  }
}
