import {
  IVideoSDK,
  ConnectionConfig,
  DeviceInfo,
  RemoteUser,
  VideoStats,
  NetworkQuality,
  SDKCallbacks,
  TwilioVideoCodec,
  TwilioAudioCodec,
} from "../types/sdk";
import {
  connect,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalDataTrack,
  Room as TwilioRoom,
  LocalParticipant as TwilioLocalParticipant,
  RemoteParticipant as TwilioRemoteParticipant,
  LocalVideoTrack as TwilioLocalVideoTrack,
  LocalAudioTrack as TwilioLocalAudioTrack,
  RemoteVideoTrack as TwilioRemoteVideoTrack,
  RemoteAudioTrack as TwilioRemoteAudioTrack,
  RemoteDataTrack as TwilioRemoteDataTrack,
  LocalTrackPublication,
  RemoteTrackPublication,
  ConnectOptions,
  StatsReport,
  LocalVideoTrackStats,
  RemoteVideoTrackStats,
  NetworkQualityLevel,
  NetworkQualityStats,
} from "twilio-video";

import { getTwilioToken } from "../http";
import { VideoManager } from "../utils/videoManager";

// Use Twilio SDK types directly instead of custom interfaces

export class TwilioSDK implements IVideoSDK {
  private room: TwilioRoom | null = null;
  private localVideoTrack: TwilioLocalVideoTrack | null = null;
  private localAudioTrack: TwilioLocalAudioTrack | null = null;
  private remoteUsers: { [key: string]: RemoteUser } = {};
  private callbacks: SDKCallbacks = {};
  private currentSpeakerDeviceId: string | null = null;

  private videoCodec: string | undefined;
  private audioCodec: string | undefined;

  private localDataTrack: LocalDataTrack | null = null;

  constructor() {
    // Remove super() call
  }

  setCallbacks(callbacks: SDKCallbacks): void {
    this.callbacks = callbacks;

    // If the room is already connected, set up event listeners now
    if (this.room) {
      this.setupEventListeners();
    }
  }

  async join(config: ConnectionConfig): Promise<void> {
    try {
      const { sdkSecret, channelName, userName, videoCodec, audioCodec } =
        config;

      // Store codec preferences for track creation
      this.videoCodec = videoCodec;
      this.audioCodec = audioCodec;

      if (!userName) {
        throw new Error("Username is required");
      }

      // Validate if userName is a valid number
      const numericUid = parseInt(userName.toString(), 10);
      if (isNaN(numericUid)) {
        throw new Error("Username must be a valid number");
      }

      // If no token is provided, fetch automatically
      let accessToken: string;
      if (!sdkSecret) {
        try {
          const response = await getTwilioToken(userName.toString());
          accessToken = response.data.token;
        } catch (error) {
          console.error("Failed to get Twilio token:", error);
          throw new Error("Failed to get Twilio token automatically");
        }
      } else {
        accessToken = sdkSecret;
      }

      // create local data track
      // this.localDataTrack = new LocalDataTrack();

      // Use Twilio Video SDK directly, do not auto start audio and video
      const connectOptions: ConnectOptions = {
        name: channelName,
        audio: false, // Do not auto start audio
        video: false, // Do not auto start video
        dominantSpeaker: true,
        networkQuality: true,
        // Add codec preferences if specified
        ...(videoCodec && {
          preferredVideoCodecs: [videoCodec as TwilioVideoCodec],
        }),
        ...(audioCodec && {
          preferredAudioCodecs: [audioCodec as TwilioAudioCodec],
        }),
      };

      this.room = await connect(accessToken, connectOptions);

      // Call onJoinSuccess callback if available
      if (this.callbacks.onJoinSuccess) {
        const currentUser = {
          uid: numericUid.toString(),
          userName: userName.toString(),
          hasAudio: false, // Will be updated when audio is published
          hasVideo: false, // Will be updated when video is published
        };
        this.callbacks.onJoinSuccess(currentUser);
      }

      // Only set up event listeners if callbacks are already set
      if (Object.keys(this.callbacks).length > 0) {
        this.setupEventListeners();
      }

      console.log(
        `Successfully connected to Twilio room: ${this.room.name} with identity: ${userName} (uid: ${numericUid}), videoCodec: ${videoCodec}, audioCodec: ${audioCodec}`
      );

      // this.localDataTrack.send(
      //   JSON.stringify({
      //     type: "user-info",
      //     identity: numericUid,
      //     username: userName,
      //     data: "Leon test localDataTrack",
      //   })
      // );
    } catch (error) {
      console.error("Failed to join Twilio room:", error);
      throw error;
    }
  }

  async leave(): Promise<void> {
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack = null;
    }

    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }

    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }

  async destroy(): Promise<void> {
    await this.leave();
    this.remoteUsers = {};
    this.callbacks = {};
  }

  async startVideo(enable: boolean, deviceId?: string): Promise<void> {
    if (!this.room) return;

    if (!enable && this.localVideoTrack) {
      // Stop local video
      await this.room.localParticipant.unpublishTrack(this.localVideoTrack);
      this.localVideoTrack.stop();
      this.localVideoTrack = null;
      return;
    }

    if (enable && !this.localVideoTrack) {
      // Create and publish local video track with codec preference
      const videoOptions: Record<string, unknown> = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        deviceId: { exact: deviceId },
      };

      // Add codec preference if specified
      if (this.videoCodec) {
        videoOptions.codec = this.videoCodec;
      }

      this.localVideoTrack = await createLocalVideoTrack(videoOptions);

      // Use unified video manager to attach video
      VideoManager.attachTwilioVideoToContainer(
        this.localVideoTrack,
        "self-camera-video",
        {
          borderRadius: "8px",
          mirror: false,
        }
      );

      // Publish track
      await this.room.localParticipant.publishTrack(this.localVideoTrack);
    }
  }

  async startAudio(enable: boolean): Promise<void> {
    if (!this.room) return;

    if (!enable && this.localAudioTrack) {
      // Stop local audio
      await this.room.localParticipant.unpublishTrack(this.localAudioTrack);
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
      return;
    }

    if (enable && !this.localAudioTrack) {
      // Create and publish local audio track with codec preference
      const audioOptions: Record<string, unknown> = {};

      // Add codec preference if specified
      if (this.audioCodec) {
        audioOptions.codec = this.audioCodec;
      }

      this.localAudioTrack = await createLocalAudioTrack(audioOptions);
      await this.room.localParticipant.publishTrack(this.localAudioTrack);
    }
  }

  async getDeviceList(): Promise<{
    cameras: DeviceInfo[];
    microphones: DeviceInfo[];
    speakers: DeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras: DeviceInfo[] = [];
      const microphones: DeviceInfo[] = [];
      const speakers: DeviceInfo[] = [];

      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          cameras.push({
            deviceId: device.deviceId,
            label: device.label || `Camera ${cameras.length + 1}`,
            kind: "videoinput",
            groupId: device.groupId,
          });
        } else if (device.kind === "audioinput") {
          microphones.push({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${microphones.length + 1}`,
            kind: "audioinput",
            groupId: device.groupId,
          });
        } else if (device.kind === "audiooutput") {
          speakers.push({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${speakers.length + 1}`,
            kind: "audiooutput",
            groupId: device.groupId,
          });
        }
      });

      return { cameras, microphones, speakers };
    } catch (error) {
      console.error("Failed to get device list:", error);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }

  async setDevice(
    type: "camera" | "microphone" | "speaker",
    deviceId: string
  ): Promise<void> {
    if (!this.room) return;

    if (type === "camera" && this.localVideoTrack) {
      // Recreate video track with codec preference
      const videoOptions: Record<string, unknown> = {
        deviceId: { exact: deviceId },
        width: 640,
        height: 480,
        frameRate: 24,
      };

      // Add codec preference if specified
      if (this.videoCodec) {
        videoOptions.codec = this.videoCodec;
      }

      const oldTrack = this.localVideoTrack;
      this.localVideoTrack = await createLocalVideoTrack(videoOptions);

      // Replace published track
      await this.room.localParticipant.unpublishTrack(oldTrack);
      await this.room.localParticipant.publishTrack(this.localVideoTrack);

      // Use unified video manager to attach video
      VideoManager.attachTwilioVideoToContainer(
        this.localVideoTrack,
        "self-camera-video",
        {
          borderRadius: "8px",
          mirror: false,
        }
      );

      oldTrack.stop();
    } else if (type === "microphone" && this.localAudioTrack) {
      // Recreate audio track with codec preference
      const audioOptions: Record<string, unknown> = {
        deviceId: { exact: deviceId },
      };

      // Add codec preference if specified
      if (this.audioCodec) {
        audioOptions.codec = this.audioCodec;
      }

      const oldTrack = this.localAudioTrack;
      this.localAudioTrack = await createLocalAudioTrack(audioOptions);

      // Replace published track
      await this.room.localParticipant.unpublishTrack(oldTrack);
      await this.room.localParticipant.publishTrack(this.localAudioTrack);

      oldTrack.stop();
    } else if (type === "speaker") {
      console.log(`Setting audio output device to: ${deviceId}`);
      this.currentSpeakerDeviceId = deviceId;

      // Apply the new audio output device to all existing remote audio tracks
      this.applyAudioOutputDeviceToRemoteTracks(deviceId);
    }
  }

  /**
   * Apply the current speaker device setting to all existing remote audio tracks
   */
  private applyAudioOutputDeviceToRemoteTracks(deviceId: string): void {
    try {
      // Get all remote participants and their audio tracks
      if (this.room) {
        this.room.participants.forEach((participant) => {
          participant.audioTracks.forEach((publication) => {
            if (publication.track && publication.track.kind === "audio") {
              const audioElement =
                publication.track.attach() as HTMLAudioElement;
              if (typeof audioElement.setSinkId === "function") {
                audioElement
                  .setSinkId(deviceId)
                  .then(() => {
                    console.log(
                      `Applied audio output device to remote track ${participant.identity}: ${deviceId}`
                    );
                  })
                  .catch((error) => {
                    console.warn(
                      `Failed to apply audio output device to remote track ${participant.identity}:`,
                      error
                    );
                  });
              }
            }
          });
        });
      }
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
    // Twilio SDK needs to get current device info in other ways
    // Since Twilio does not have a direct API, we return null and rely on sync during device switching
    if (type === "speaker") {
      return this.currentSpeakerDeviceId;
    }
    return null;
  }

  async getLocalVideoStats(): Promise<VideoStats | null> {
    if (!this.room) {
      return null;
    }

    try {
      // Get stats from the local participant using Twilio's getStats method
      const stats: StatsReport[] = await this.room.getStats();

      // console.log("Twilio getLocalVideoStats stats:", stats);

      // Convert Twilio stats to our VideoStats format
      const videoStats: VideoStats = {};

      // Process stats to extract relevant information from the new structure
      if (stats && Array.isArray(stats) && stats.length > 0) {
        const firstStat = stats[0];

        // Get local video track stats
        if (
          firstStat.localVideoTrackStats &&
          Array.isArray(firstStat.localVideoTrackStats) &&
          firstStat.localVideoTrackStats.length > 0
        ) {
          const localVideoTrackStat = firstStat
            .localVideoTrackStats[0] as LocalVideoTrackStats;

          // Extract video statistics
          videoStats.codecType = localVideoTrackStat.codec || "";
          videoStats.sendFrameRate = localVideoTrackStat.frameRate || 0;
          videoStats.sendBitrate = localVideoTrackStat.bytesSent
            ? (localVideoTrackStat.bytesSent * 8) / 1000
            : 0; // Convert to kbps
          videoStats.sendResolutionWidth =
            localVideoTrackStat.dimensions?.width || 0;
          videoStats.sendResolutionHeight =
            localVideoTrackStat.dimensions?.height || 0;

          // Additional stats if available
          if (
            localVideoTrackStat.packetsLost !== undefined &&
            localVideoTrackStat.packetsLost !== null &&
            localVideoTrackStat.packetsSent !== undefined &&
            localVideoTrackStat.packetsSent !== null
          ) {
            videoStats.packetLossRate =
              localVideoTrackStat.packetsSent > 0
                ? (localVideoTrackStat.packetsLost /
                    localVideoTrackStat.packetsSent) *
                  100
                : 0;
          }

          if (
            localVideoTrackStat.roundTripTime !== undefined &&
            localVideoTrackStat.roundTripTime !== null
          ) {
            videoStats.transportDelay = localVideoTrackStat.roundTripTime; // Already in ms
          }
        }
      }

      return Object.keys(videoStats).length > 0 ? videoStats : null;
    } catch (error) {
      console.error("Failed to get local video stats:", error);
      return null;
    }
  }

  async getRemoteVideoStats(): Promise<{ [uid: string]: VideoStats } | null> {
    if (!this.room || !this.room.participants) {
      return null;
    }

    try {
      const result: { [uid: string]: VideoStats } = {};

      // Get stats from the room
      const stats: StatsReport[] = await this.room.getStats();

      // console.log("Twilio getRemoteVideoStats stats:", stats);

      // Process stats to extract relevant information from the new structure
      if (stats && Array.isArray(stats) && stats.length > 0) {
        const firstStat = stats[0];

        // console.log(
        //   "Twilio getRemoteVideoStats firstStat?.remoteVideoTrackStats:",
        //   firstStat?.remoteVideoTrackStats
        // );

        // Get remote video track stats
        if (
          firstStat.remoteVideoTrackStats &&
          Array.isArray(firstStat.remoteVideoTrackStats) &&
          firstStat.remoteVideoTrackStats.length > 0
        ) {
          // Create a mapping from trackSid to participant identity
          const trackSidToParticipantMap = new Map<string, string>();

          this.room.participants.forEach((participant) => {
            // console.log(
            //   `Mapping participant ${participant.identity} tracks:`,
            //   participant.videoTracks
            // );

            participant.videoTracks.forEach((publication) => {
              if (publication.trackSid) {
                trackSidToParticipantMap.set(
                  publication.trackSid,
                  participant.identity
                );
                // console.log(
                //   `Mapped trackSid ${publication.trackSid} to participant ${participant.identity}`
                // );
              }
            });
          });

          firstStat.remoteVideoTrackStats.forEach(
            (remoteVideoTrackStat: RemoteVideoTrackStats) => {
              const videoStats: VideoStats = {};

              // Extract video statistics
              videoStats.codecType = remoteVideoTrackStat.codec || "";
              videoStats.receiveFrameRate = remoteVideoTrackStat.frameRate || 0;
              videoStats.receiveBitrate = remoteVideoTrackStat.bytesReceived
                ? (remoteVideoTrackStat.bytesReceived * 8) / 1000
                : 0; // Convert to kbps
              videoStats.receiveResolutionWidth =
                remoteVideoTrackStat.dimensions?.width || 0;
              videoStats.receiveResolutionHeight =
                remoteVideoTrackStat.dimensions?.height || 0;

              // Additional stats if available
              if (
                remoteVideoTrackStat.packetsLost !== undefined &&
                remoteVideoTrackStat.packetsLost !== null &&
                remoteVideoTrackStat.packetsReceived !== undefined &&
                remoteVideoTrackStat.packetsReceived !== null
              ) {
                videoStats.packetLossRate =
                  remoteVideoTrackStat.packetsReceived > 0
                    ? (remoteVideoTrackStat.packetsLost /
                        remoteVideoTrackStat.packetsReceived) *
                      100
                    : 0;
              }

              // Find the participant identity for this track
              const participantIdentity = trackSidToParticipantMap.get(
                remoteVideoTrackStat.trackSid
              );

              if (participantIdentity) {
                // console.log(
                //   `Found stats for participant ${participantIdentity}, trackSid: ${remoteVideoTrackStat.trackSid}`
                // );

                // Only add to result if we have stats
                if (Object.keys(videoStats).length > 0) {
                  result[participantIdentity] = videoStats;
                }
              } else {
                console.warn(
                  `No participant found for trackSid: ${remoteVideoTrackStat.trackSid}`
                );
              }
            }
          );
        }
      }

      // console.log("Twilio getRemoteVideoStats final result:", result);
      return Object.keys(result).length > 0 ? result : null;
    } catch (error) {
      console.error("Failed to get remote video stats:", error);
      return null;
    }
  }

  private setupEventListeners(): void {
    if (!this.room) return;

    // Listen for participant connection event
    this.room.on("participantConnected", this.onParticipantConnected);
    this.room.on("participantDisconnected", this.onParticipantDisconnected);

    // Listen for local participant track publishing event
    this.room.localParticipant.on("trackPublished", this.onTrackPublished);
    this.room.localParticipant.on(
      "trackPublicationFailed",
      this.onTrackPublicationFailed
    );

    // local network quality
    this.room.localParticipant.on(
      "networkQualityLevelChanged",
      this.onLocalNetworkQualityChanged
    );

    // Listen for room disconnection event
    this.room.on("disconnected", this.onRoomDisconnected);

    // Listen for room reconnection events
    this.room.on("reconnecting", this.onRoomReconnecting);
    this.room.on("reconnected", this.onRoomReconnected);

    // Handle existing participants
    this.room.participants.forEach((participant) => {
      this.onParticipantConnected(participant);
    });
  }

  private onParticipantConnected = (participant: TwilioRemoteParticipant) => {
    console.log(`Participant ${participant.identity} connected`, participant);

    const remoteUser: RemoteUser = {
      uid: participant.identity,
      userName: participant.identity,
      hasAudio: participant.audioTracks.size > 0,
      hasVideo: participant.videoTracks.size > 0,
      // sid: participant.sid,
    };

    this.remoteUsers[participant.identity] = remoteUser;
    this.callbacks.onUserJoined?.(remoteUser);

    // Listen for participant track events
    participant.on(
      "trackSubscribed",
      (
        track:
          | TwilioRemoteVideoTrack
          | TwilioRemoteAudioTrack
          | TwilioRemoteDataTrack
      ) => {
        this.onTrackSubscribed(participant, track);
      }
    );

    participant.on(
      "trackUnsubscribed",
      (track: TwilioRemoteVideoTrack | TwilioRemoteAudioTrack) => {
        this.onTrackUnsubscribed(participant, track);
      }
    );

    // Listen for remote participant network quality changes
    participant.on(
      "networkQualityLevelChanged",
      (
        networkQualityLevel: NetworkQualityLevel,
        networkQualityStats: NetworkQualityStats
      ) =>
        this.onRemoteNetworkQualityChanged(
          participant,
          networkQualityLevel,
          networkQualityStats
        )
    );

    // Handle existing tracks
    participant.tracks.forEach((publication: RemoteTrackPublication) => {
      if (publication.track) {
        const track = publication.track;
        if (track.kind === "video" || track.kind === "audio") {
          this.onTrackSubscribed(participant, track);
        }
      }
    });
  };

  private onParticipantDisconnected = (
    participant: TwilioRemoteParticipant
  ) => {
    console.log(
      `Participant ${participant.identity} disconnected`,
      participant
    );

    const remoteUser: RemoteUser = {
      uid: participant.identity,
      userName: participant.identity,
      hasAudio: false,
      hasVideo: false,
    };

    delete this.remoteUsers[participant.identity];
    this.callbacks.onUserLeft?.(remoteUser);
  };

  private onTrackSubscribed = async (
    participant: TwilioRemoteParticipant,
    track:
      | TwilioRemoteVideoTrack
      | TwilioRemoteAudioTrack
      | TwilioRemoteDataTrack
  ) => {
    console.log(`Subscribed to ${participant.identity}'s ${track.kind} track`);

    if (track.kind === "video") {
      // Use unified video manager to attach remote video
      const containerId = `remote-video-${participant.identity}`;
      VideoManager.attachTwilioVideoToContainer(track, containerId);
    } else if (track.kind === "audio") {
      // Attach the audio track and get the audio element
      const audioElement = track.attach() as HTMLAudioElement;
      audioElement.autoplay = true;

      // Set audio output device if specified
      if (
        this.currentSpeakerDeviceId &&
        typeof audioElement.setSinkId === "function"
      ) {
        try {
          await audioElement.setSinkId(this.currentSpeakerDeviceId);
          console.log(
            `Set audio output device for remote audio track ${participant.identity}: ${this.currentSpeakerDeviceId}`
          );
        } catch (error) {
          console.warn(
            "Failed to set audio output device for remote audio track:",
            error
          );
        }
      }

      // Add the audio element to the document
      document.body.appendChild(audioElement);
    } else if (track.kind === "data") {
      console.log("Twilio getRemoteVideoStats data track:", track);

      // track.on("message", (data) => {
      //   console.log("Twilio onTrackSubscribed data track:", data);
      // });
    }

    // Update user status
    const remoteUser = this.remoteUsers[participant.identity];
    if (remoteUser) {
      if (track.kind === "video") {
        remoteUser.hasVideo = true;
      } else if (track.kind === "audio") {
        remoteUser.hasAudio = true;
      }
      this.callbacks.onUserPublished?.(remoteUser, track.kind);
    }
  };

  private onTrackUnsubscribed = (
    participant: TwilioRemoteParticipant,
    track:
      | TwilioRemoteVideoTrack
      | TwilioRemoteAudioTrack
      | TwilioRemoteDataTrack
  ) => {
    console.log(
      `Unsubscribed from ${participant.identity}'s ${track.kind} track`
    );

    // Twilio will automatically clean up video elements, no need to manually handle

    // Update user status
    const remoteUser = this.remoteUsers[participant.identity];
    if (remoteUser) {
      if (track.kind === "video") {
        remoteUser.hasVideo = false;
      } else if (track.kind === "audio") {
        remoteUser.hasAudio = false;
      }
      this.callbacks.onUserUnpublished?.(remoteUser, track.kind);
    }
  };

  private onTrackPublished = (publication: LocalTrackPublication) => {
    console.log(`Published local ${publication.kind} track`);
  };

  private onTrackPublicationFailed = (error: Error) => {
    console.error("Track publication failed:", error);
    this.callbacks.onError?.(
      new Error(`Track publication failed: ${error.message}`)
    );
  };

  private onRoomDisconnected = (room: TwilioRoom, error?: Error) => {
    console.log("Room disconnected");
    if (error) {
      console.error("Room disconnection error:", error);
      this.callbacks.onError?.(
        new Error(`Room disconnected: ${error.message}`)
      );
    }
    this.callbacks.onConnectionStateChange?.("disconnected");
  };

  /**
   * Convert Twilio network quality level to our unified format
   * Twilio levels: 5 (excellent), 4 (good), 3 (average), 2 (below average), 1 (bad), 0 (broken)
   * Our format: 0 (unknown), 1 (excellent), 2 (good), 3 (poor), 4 (bad), 5 (very bad), 6 (down) ==> agora
   *
   * https://www.twilio.com/docs/video/using-network-quality-api
   */
  private convertTwilioNetworkLevel(level: number): number {
    switch (level) {
      case 5: // excellent
        return 1;
      case 4: // good
        return 2;
      case 3: // average
        return 3;
      case 2: // below average
        return 4;
      case 1: // bad
        return 5;
      case 0: // broken/reconnecting
        return 6;
      default:
        return 0; // unknown
    }
  }

  /**
   * Convert Twilio network quality stats to our unified format
   */
  private convertNetworkQualityStats(
    networkQualityLevel: NetworkQualityLevel,
    networkQualityStats: NetworkQualityStats
  ): NetworkQuality {
    return {
      uplinkNetworkQuality: this.convertTwilioNetworkLevel(networkQualityLevel),
      downlinkNetworkQuality:
        this.convertTwilioNetworkLevel(networkQualityLevel), // Twilio doesn't separate uplink/downlink
      // Extract detailed audio and video statistics
      audio: networkQualityStats?.audio
        ? {
            send: this.convertTwilioNetworkLevel(
              networkQualityStats.audio.send
            ),
            recv: this.convertTwilioNetworkLevel(
              networkQualityStats.audio.recv
            ),
            sendStats: networkQualityStats.audio.sendStats
              ? {
                  bandwidth:
                    networkQualityStats.audio.sendStats.bandwidth?.actual ||
                    undefined,
                  latency:
                    networkQualityStats.audio.sendStats.latency?.rtt ||
                    undefined,
                  fractionLost:
                    networkQualityStats.audio.sendStats.fractionLost
                      ?.fractionLost || undefined,
                }
              : undefined,
            recvStats: networkQualityStats.audio.recvStats
              ? {
                  bandwidth:
                    networkQualityStats.audio.recvStats.bandwidth?.actual ||
                    undefined,
                  latency:
                    networkQualityStats.audio.recvStats.latency?.rtt ||
                    undefined,
                  fractionLost:
                    networkQualityStats.audio.recvStats.fractionLost
                      ?.fractionLost || undefined,
                }
              : undefined,
          }
        : undefined,
      video: networkQualityStats?.video
        ? {
            send: this.convertTwilioNetworkLevel(
              networkQualityStats.video.send
            ),
            recv: this.convertTwilioNetworkLevel(
              networkQualityStats.video.recv
            ),
            sendStats: networkQualityStats.video.sendStats
              ? {
                  bandwidth:
                    networkQualityStats.video.sendStats.bandwidth?.actual ||
                    undefined,
                  latency:
                    networkQualityStats.video.sendStats.latency?.rtt ||
                    undefined,
                  fractionLost:
                    networkQualityStats.video.sendStats.fractionLost
                      ?.fractionLost || undefined,
                }
              : undefined,
            recvStats: networkQualityStats.video.recvStats
              ? {
                  bandwidth:
                    networkQualityStats.video.recvStats.bandwidth?.actual ||
                    undefined,
                  latency:
                    networkQualityStats.video.recvStats.latency?.rtt ||
                    undefined,
                  fractionLost:
                    networkQualityStats.video.recvStats.fractionLost
                      ?.fractionLost || undefined,
                }
              : undefined,
          }
        : undefined,
    };
  }

  /**
   * Handle local participant network quality level changes
   */
  private onLocalNetworkQualityChanged = (
    networkQualityLevel: NetworkQualityLevel,
    networkQualityStats: NetworkQualityStats
  ) => {
    // console.log(
    //   `Twilio localParticipant's network quality: ${networkQualityLevel}`,
    //   networkQualityStats
    // );

    const networkQuality = this.convertNetworkQualityStats(
      networkQualityLevel,
      networkQualityStats
    );

    this.callbacks.onNetworkQualityChange?.(networkQuality);
  };

  /**
   * Handle remote participant network quality level changes
   */
  private onRemoteNetworkQualityChanged = (
    participant: TwilioRemoteParticipant,
    networkQualityLevel: NetworkQualityLevel,
    networkQualityStats: NetworkQualityStats
  ) => {
    console.log(
      `Twilio remote participant ${participant.identity} network quality: ${networkQualityLevel}`,
      networkQualityStats
    );

    const networkQuality = this.convertNetworkQualityStats(
      networkQualityLevel,
      networkQualityStats
    );

    // Note: We could store this per participant if needed
    // For now, we'll use the same callback as local participant
    this.callbacks.onNetworkQualityChange?.(networkQuality);
  };

  private onRoomReconnecting = () => {
    console.log("Room is reconnecting");
    this.callbacks.onConnectionStateChange?.("reconnecting");
  };

  private onRoomReconnected = () => {
    console.log("Room is reconnected");
    this.callbacks.onConnectionStateChange?.("reconnected");
  };
}
