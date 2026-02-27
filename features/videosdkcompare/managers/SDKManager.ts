import {
  IVideoSDK,
  SDKType,
  ConnectionConfig,
  SDKCallbacks,
  ShareActiveChange,
} from "../types/sdk";
import { AgoraSDK } from "../adapters/AgoraSDK";
import { TwilioSDK } from "../adapters/TwilioSDK";
import { ZoomSDK } from "../adapters/ZoomSDK";
import { AppDispatch } from "../Redux/store";
import {
  addRemoteUsers,
  removeRemoteUsers,
  updateNetworkLevel,
  updateConnectionState,
  setCurrentUser,
  updateCurrentUser,
  clearMeetingState,
  // cleanDataWhenFailover,
} from "../Redux/meetingSlice";

import { store } from "../Redux/store";

// Extended callback interface for UI-specific handling
export interface ExtendedSDKCallbacks extends SDKCallbacks {
  // UI-specific handlers
  onErrorWithUI?: (error: Error) => void;
  onNetworkQualityWithUI?: (stats: unknown) => void;
}

export class SDKManager {
  private currentSDK: IVideoSDK | null = null;
  private currentSDKType: SDKType | null = null;
  private pendingCallbacks: SDKCallbacks | null = null;
  private extendedCallbacks: ExtendedSDKCallbacks | null = null;
  private currentUserId: string | null = null;

  private isFailoverRunning: boolean = false;

  private failoverInterval: NodeJS.Timeout | undefined = undefined;

  constructor() {}

  /**
   * Create and return SDK instance of specified type
   */
  createSDK(sdkType: SDKType): IVideoSDK {
    switch (sdkType) {
      case "agora":
        return new AgoraSDK();
      case "twilio":
        return new TwilioSDK();
      case "zoom":
        return new ZoomSDK();
      default:
        throw new Error(`Unsupported SDK type: ${sdkType}`);
    }
  }

  /**
   * Set current user ID for filtering
   */
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Check if user is current user
   */
  isCurrentUser(uid: string): boolean {
    return this.currentUserId === uid;
  }

  /**
   * Set basic callbacks for Login page (Redux state updates only)
   */
  setBasicCallbacks(dispatch: AppDispatch): void {
    const basicCallbacks: SDKCallbacks = {
      onUserJoined: (user) => {
        console.log("Login: User joined (basic):", user);
        // Filter out current user
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              userName: user.userName,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Set current user info
          dispatch(
            setCurrentUser({
              uid: user.uid,
              userName: user.userName,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onUserLeft: (user) => {
        console.log("Login: User left (basic):", user);
        // Only remove if it's not current user
        if (!this.isCurrentUser(user.uid)) {
          dispatch(removeRemoteUsers(user.uid));
        }
      },
      onUserPublished: (user, mediaType) => {
        console.log("Login: User published (basic):", user, mediaType);
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              userName: user.userName,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Update current user info
          dispatch(
            updateCurrentUser({
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onUserUnpublished: (user, mediaType) => {
        console.log("Login: User unpublished (basic):", user, mediaType);
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Update current user info
          dispatch(
            updateCurrentUser({
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onNetworkQualityChange: (stats) => {
        console.log("Login: Network quality changed (basic):", stats);
        dispatch(updateNetworkLevel(stats));
      },
      onConnectionStateChange: (state) => {
        console.log("Login: Connection state changed (basic):", state);
        dispatch(updateConnectionState(state));
      },
      onError: (error) => {
        console.error("Login: SDK error (basic):", error);
      },
      onJoinSuccess: (currentUser) => {
        console.log("Login: Join success (basic):", currentUser);
        // Set current user info in Redux
        dispatch(setCurrentUser(currentUser));
        // Update current user ID for filtering
        this.setCurrentUserId(currentUser.uid);
      },
    };

    this.setCallbacks(basicCallbacks);
  }

  /**
   * Set extended callbacks for Meeting page (with UI handling)
   */
  setExtendedCallbacks(
    dispatch: AppDispatch,
    uiHandlers: {
      setError?: (error: string) => void;
      setNetworkQuality?: (quality: {
        uplink: number;
        downlink: number;
      }) => void;
      onShareActiveChange?: (payload: ShareActiveChange) => void;
    } = {}
  ): void {
    const extendedCallbacks: ExtendedSDKCallbacks = {
      onUserJoined: (user) => {
        console.log("Meeting: User joined (upgraded):", user);
        // Filter out current user
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              userName: user.userName,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Set current user info
          dispatch(
            setCurrentUser({
              uid: user.uid,
              userName: user.userName,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onUserLeft: (user) => {
        console.log("Meeting: User left (upgraded):", user);
        // Only remove if it's not current user
        if (!this.isCurrentUser(user.uid)) {
          dispatch(removeRemoteUsers(user.uid));
        }
      },
      onUserPublished: (user, mediaType) => {
        console.log("Meeting: User published (upgraded):", user, mediaType);
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Update current user info
          dispatch(
            updateCurrentUser({
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onUserUnpublished: (user, mediaType) => {
        console.log("Meeting: User unpublished (upgraded):", user, mediaType);
        if (!this.isCurrentUser(user.uid)) {
          dispatch(
            addRemoteUsers({
              uid: user.uid,
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        } else {
          // Update current user info
          dispatch(
            updateCurrentUser({
              hasAudio: user.hasAudio,
              hasVideo: user.hasVideo,
            })
          );
        }
      },
      onNetworkQualityChange: (stats) => {
        // console.log("Meeting: Network quality changed (upgraded):", stats);
        // UI-specific handling
        if (uiHandlers.setNetworkQuality) {
          uiHandlers.setNetworkQuality({
            uplink: stats.uplinkNetworkQuality || 0,
            downlink: stats.downlinkNetworkQuality || 0,
          });
        }
        dispatch(updateNetworkLevel(stats));
      },
      onConnectionStateChange: (state, reason) => {
        console.log(
          "Meeting: Connection state changed (upgraded):",
          state,
          reason
        );

        dispatch(updateConnectionState(state));
      },
      onShareActiveChange: (payload) => {
        if (uiHandlers.onShareActiveChange) {
          uiHandlers.onShareActiveChange(payload);
        }
      },
      onError: (error) => {
        console.error("Meeting: SDK error (upgraded):", error);
        // UI-specific error handling
        if (uiHandlers.setError) {
          uiHandlers.setError(error.message || "An error occurred");
        }
      },
      onJoinSuccess: (currentUser) => {
        console.log("Meeting: Join success (upgraded):", currentUser);
        // Set current user info in Redux
        dispatch(setCurrentUser(currentUser));
        // Update current user ID for filtering
        this.setCurrentUserId(currentUser.uid);
      },
      onFailover: (reason) => {
        console.log("Meeting: Failover (upgraded):", reason);

        if (
          this.currentSDKType === "zoom" &&
          reason === "failover" &&
          !this.isFailoverRunning
        ) {
          this.isFailoverRunning = true;
          console.log("zoom connection-change failover, run failover");

          this.failoverInterval = setInterval(async () => {
            if (navigator.onLine) {
              clearInterval(this.failoverInterval);
              await this.runFailover();
            }
          }, 10000);
        }
      },
    };

    this.extendedCallbacks = extendedCallbacks;
    this.setCallbacks(extendedCallbacks);
  }

  /**
   * Set callback functions before initialization
   * This ensures callbacks are set before any events can be triggered
   */
  setCallbacks(callbacks: SDKCallbacks): void {
    this.pendingCallbacks = callbacks;

    // If SDK is already initialized, set callbacks immediately
    if (this.currentSDK) {
      this.currentSDK.setCallbacks(callbacks);
    }
  }

  /**
   * Clear callbacks (useful for cleanup or retry scenarios)
   */
  clearCallbacks(): void {
    this.pendingCallbacks = null;
    this.extendedCallbacks = null;
    if (this.currentSDK) {
      this.currentSDK.setCallbacks({});
    }
  }

  /**
   * Initialize SDK of specified type with proper error handling
   */
  async initializeSDK(
    sdkType: SDKType,
    config: ConnectionConfig
  ): Promise<void> {
    try {
      // Set current user ID for filtering
      this.setCurrentUserId(config.userName.toString());

      // If there's already an SDK, destroy it first
      if (this.currentSDK) {
        await this.currentSDK.destroy();
      }

      // Create new SDK instance
      this.currentSDK = this.createSDK(sdkType);
      this.currentSDKType = sdkType;

      // Set callbacks before joining to prevent event loss
      if (this.pendingCallbacks) {
        this.currentSDK.setCallbacks(this.pendingCallbacks);
      }

      // Connect to channel/room
      await this.currentSDK.join(config);
    } catch (error) {
      // Clear callbacks on failure
      this.clearCallbacks();

      // Clean up SDK instance on failure
      if (this.currentSDK) {
        try {
          await this.currentSDK.destroy();
        } catch (destroyError) {
          console.warn(
            "Failed to destroy SDK after initialization error:",
            destroyError
          );
        }
        this.currentSDK = null;
        this.currentSDKType = null;
      }

      throw error;
    }
  }

  async joinAudio(deviceId?: string): Promise<void> {
    if (this.currentSDKType === "zoom" && this.currentSDK) {
      await this.currentSDK.joinAudio?.();
    }
  }

  /**
   * Get current SDK instance
   */
  getCurrentSDK(): IVideoSDK | null {
    return this.currentSDK;
  }

  /**
   * Get current SDK type
   */
  getCurrentSDKType(): SDKType | null {
    return this.currentSDKType;
  }

  /**
   * Destroy current SDK
   */
  async destroy(): Promise<void> {
    if (this.currentSDK) {
      await this.currentSDK.destroy();
      this.currentSDK = null;
      this.currentSDKType = null;
    }
    this.clearCallbacks();
    this.currentUserId = null;
  }

  /**
   * Leave current channel/room
   */
  async leave(): Promise<void> {
    if (this.currentSDK) {
      await this.currentSDK.leave();
    }
  }

  /**
   * Enable/disable video
   */
  async startVideo(enable: boolean, deviceId?: string): Promise<void> {
    if (this.currentSDK) {
      await this.currentSDK.startVideo(enable, deviceId);
    }
  }

  /**
   * Enable/disable audio
   */
  async startAudio(enable: boolean, deviceId?: string): Promise<void> {
    if (this.currentSDK) {
      await this.currentSDK.startAudio(enable, deviceId);
    }
  }

  /**
   * Get device list
   */
  async getDeviceList() {
    if (this.currentSDK) {
      return await this.currentSDK.getDeviceList();
    }
    return { cameras: [], microphones: [], speakers: [] };
  }

  /**
   * Set device (camera, microphone, or speaker)
   */
  async setDevice(
    type: "camera" | "microphone" | "speaker" | "playback",
    deviceId: string
  ): Promise<void> {
    if (this.currentSDK) {
      await this.currentSDK.setDevice(type, deviceId);
    }
  }

  /**
   * Get current device label
   */
  getCurrentDeviceLabel(
    type: "camera" | "microphone" | "speaker"
  ): string | null {
    if (this.currentSDK) {
      return this.currentSDK.getCurrentDeviceLabel(type);
    }
    return null;
  }

  /**
   * Get local video statistics
   */
  async getLocalVideoStats() {
    return (await this.currentSDK?.getLocalVideoStats()) || null;
  }

  /**
   * Get remote video statistics
   */
  async getRemoteVideoStats() {
    return (await this.currentSDK?.getRemoteVideoStats()) || null;
  }

  async isVirtualBackgroundSupported(): Promise<boolean> {
    if (this.currentSDK?.isVirtualBackgroundSupported) {
      return await this.currentSDK.isVirtualBackgroundSupported();
    }
    return false;
  }

  async applyVirtualBackground(imageUrl: string): Promise<void> {
    if (!this.currentSDK?.applyVirtualBackground) {
      throw new Error("Virtual background is not available for current SDK");
    }
    await this.currentSDK.applyVirtualBackground(imageUrl);
  }

  async clearVirtualBackground(): Promise<void> {
    if (!this.currentSDK?.clearVirtualBackground) {
      return;
    }
    await this.currentSDK.clearVirtualBackground();
  }

  async startScreenShare(
    element: HTMLCanvasElement | HTMLVideoElement,
  ): Promise<void> {
    if (!this.currentSDK?.startScreenShare) {
      throw new Error("Screen share is not available for current SDK");
    }
    await this.currentSDK.startScreenShare(element);
  }

  async stopScreenShare(): Promise<void> {
    if (!this.currentSDK?.stopScreenShare) {
      return;
    }
    await this.currentSDK.stopScreenShare();
  }

  async startShareView(
    element: HTMLCanvasElement | HTMLElement,
    activeUserId: number
  ): Promise<void> {
    if (!this.currentSDK?.startShareView) {
      throw new Error("Share view is not available for current SDK");
    }
    await this.currentSDK.startShareView(element, activeUserId);
  }

  async stopShareView(): Promise<void> {
    if (!this.currentSDK?.stopShareView) {
      return;
    }
    await this.currentSDK.stopShareView();
  }

  isShareViewWithVideoElement(): boolean {
    if (!this.currentSDK?.isShareViewWithVideoElement) {
      return false;
    }
    return this.currentSDK.isShareViewWithVideoElement();
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.currentSDK !== null;
  }

  /**
   * Check if it's the specified SDK type
   */
  isSDKType(sdkType: SDKType): boolean {
    return this.currentSDKType === sdkType;
  }

  /**
   * Check if callbacks are set
   */
  hasCallbacks(): boolean {
    return this.pendingCallbacks !== null;
  }

  async runFailover(): Promise<void> {
    if (this.currentSDKType === "zoom" && navigator.onLine) {
      const { meeting } = store.getState();

      const failoverData = {
        sdkKey: meeting.loginInfo.sdkKey,
        sdkSecret: meeting.loginInfo.sdkSecret,
        webEndpoint: meeting.loginInfo.webEndpoint || "zoomdev.us",
        sabMode: meeting.loginInfo.sabMode || "no-sab",
        password: meeting.loginInfo.sessionPwd || "",
        signature: meeting.loginInfo.signature || "",
        sessionKey: meeting.loginInfo.sessionKey || "",
        userIdentity: meeting.loginInfo.userIdentity || "",

        topic: meeting.loginInfo.sessionName,
        userName: meeting.loginInfo.userName,

        mediaSdkHash: meeting.loginInfo.mediaSdkHash,
        enableAudioDenoiser: meeting.loginInfo.enableAudioDenoiser,
        enableBuiltInDenoiser: meeting.loginInfo.enableBuiltInDenoiser,

        role: meeting.loginInfo.role === "host" ? 1 : 0,
        videoMode: meeting.loginInfo.videoMode,
        audioMode: meeting.loginInfo.audioMode,

        selfFull: meeting.common.selfFullScreen.isFullScrreen,
        remoteFull: meeting.common.remoteFullScreen.isFullScrreen,

        enableVideo: meeting.common.isVideoEnabled,
        enableAudio: meeting.common.isAudioEnabled,

        cameraName: meeting.deviceList.camera.current.label,
        microphoneName: meeting.deviceList.microphone.current.label,
        speakerName: meeting.deviceList.speaker.current.label,
      };

      const params = new URLSearchParams();
      Object.entries(failoverData).forEach(([key, value]) => {
        params.append(key, String(value ?? ""));
      });

      const baseUrl = `${window.location.origin}`.startsWith(
        "https://mediascoring.zoomdev.us"
      )
        ? "https://mediascoring.zoomdev.us/videosdkcompare/"
        : window.location.origin;

      const fullUrl = `${baseUrl}?${params.toString()}`;

      console.log("fullUrl: ", fullUrl);
      // const encodedUrl = encodeURI(fullUrl);
      // console.log("failoverUrl: ", encodedUrl);

      // leave meeting and clean data.  // await window.VideoCompare.leaveMeeting?.();
      await this.leave();
      store.dispatch(clearMeetingState());

      // rejoin with new url params
      window.location.href = fullUrl;
    }
  }
}

// Create global SDK manager instance
export const sdkManager = new SDKManager();
