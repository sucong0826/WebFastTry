/**
 * Unified video management utility class
 * Handles video attachment logic differences for different SDKs
 */

export interface VideoAttachmentOptions {
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: string;
  mirror?: boolean;
}

export interface AgoraVideoOptions {
  fit?: "cover" | "contain" | "fill";
  mirror?: boolean;
}

export interface ZoomVideoOptions {
  fit?: "cover" | "contain" | "fill";
  mirror?: boolean;
}

export class VideoManager {
  /**
   * Attach a video track to the specified container (for Twilio)
   * @param track Video track (Twilio)
   * @param containerId Container ID
   * @param options Attachment options
   */
  static attachTwilioVideoToContainer(
    track: { attach: () => HTMLElement },
    containerId: string,
    options: VideoAttachmentOptions = {}
  ): boolean {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container not found: ${containerId}`);
      return false;
    }

    try {
      // Do not clear the container, only remove existing video elements
      const existingVideos = container.querySelectorAll("video");
      existingVideos.forEach((video) => video.remove());

      // Create video element
      const videoElement = track.attach();

      // Apply styles - ensure the video element fully fits the container
      // Basic styles are handled by global CSS, only handle specific options here
      if (options.width) {
        videoElement.style.width = options.width;
      }
      if (options.height) {
        videoElement.style.height = options.height;
      }
      if (options.objectFit) {
        videoElement.style.objectFit = options.objectFit;
      }

      if (options.borderRadius) {
        videoElement.style.borderRadius = options.borderRadius;
      }

      if (options.mirror) {
        videoElement.style.transform = "scaleX(-1)";
      }

      // Add to container
      container.appendChild(videoElement);

      // Debug info: check actual size of video element
      console.log(`Video attached to container: ${containerId}`);
      console.log(
        `Container size: ${container.offsetWidth}x${container.offsetHeight}`
      );
      console.log(
        `Video element size: ${videoElement.offsetWidth}x${videoElement.offsetHeight}`
      );
      console.log(`Video element style:`, {
        width: videoElement.style.width,
        height: videoElement.style.height,
        objectFit: videoElement.style.objectFit,
        maxWidth: videoElement.style.maxWidth,
        maxHeight: videoElement.style.maxHeight,
      });

      return true;
    } catch (error) {
      console.error(
        `Failed to attach video to container ${containerId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Attach Agora video track to the specified container
   * @param track Agora video track
   * @param containerId Container ID
   * @param options Agora video options
   */
  static attachAgoraVideoToContainer(
    track: { play: (element: string, options?: AgoraVideoOptions) => void },
    containerId: string,
    options: AgoraVideoOptions = {}
  ): boolean {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container not found: ${containerId}`);
      return false;
    }

    try {
      // Do not clear the container, only remove existing video elements
      const existingVideos = container.querySelectorAll("video");
      existingVideos.forEach((video) => video.remove());

      // Agora's play method will create a video element under the container
      track.play(containerId, options);

      console.log(`Agora video attached to container: ${containerId}`);
      return true;
    } catch (error) {
      console.error(
        `Failed to attach Agora video to container ${containerId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Attach Zoom video track to the specified container
   * @param track Zoom video track
   * @param containerId Container ID
   * @param options Zoom video options
   */
  static attachZoomVideoToContainer(
    track: {
      start: (
        element: HTMLElement | string,
        options?: ZoomVideoOptions
      ) => Promise<void>;
    },
    containerId: string,
    options: ZoomVideoOptions = {}
  ): boolean {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container not found: ${containerId}`);
      return false;
    }

    try {
      // Do not clear the container, only remove existing video elements
      const existingVideos = container.querySelectorAll("video");
      existingVideos.forEach((video) => video.remove());

      // Create a video element for Zoom
      const videoElement = document.createElement("video");
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = options.fit || "contain";
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;

      if (options.mirror) {
        videoElement.style.transform = "scaleX(-1)";
      }

      // Add video element to container
      container.appendChild(videoElement);

      // Start Zoom video track with the video element
      track
        .start(videoElement)
        .then(() => {
          console.log(`Zoom video attached to container: ${containerId}`);
        })
        .catch((error) => {
          console.error(`Failed to start Zoom video: ${error}`);
        });

      return true;
    } catch (error) {
      console.error(
        `Failed to attach Zoom video to container ${containerId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Remove video from container
   * @param containerId Container ID
   */
  static removeVideoFromContainer(containerId: string): void {
    const container = document.getElementById(containerId);
    if (container) {
      // Only remove video elements, keep other content
      const existingVideos = container.querySelectorAll("video");
      existingVideos.forEach((video) => video.remove());
      console.log(`Video removed from container: ${containerId}`);
    }
  }

  /**
   * Check if container exists
   * @param containerId Container ID
   */
  static isContainerExists(containerId: string): boolean {
    return document.getElementById(containerId) !== null;
  }

  /**
   * Get the visibility status of the container
   * @param containerId Container ID
   */
  static getContainerVisibility(containerId: string): {
    visible: boolean;
    display: string;
    visibility: string;
  } {
    const container = document.getElementById(containerId);
    if (!container) {
      return { visible: false, display: "none", visibility: "hidden" };
    }

    const style = window.getComputedStyle(container);
    const visible = style.display !== "none" && style.visibility !== "hidden";

    return {
      visible,
      display: style.display,
      visibility: style.visibility,
    };
  }
}
