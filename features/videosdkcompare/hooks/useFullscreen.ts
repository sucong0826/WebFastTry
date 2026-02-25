import { useState, useEffect, useRef, useCallback } from "react";

export interface UseFullscreenOptions {
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onError?: (error: Error) => void;
  targetElement?: HTMLElement | null;
  useCSSMode?: boolean; // is css mode
}

export interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  setCSSFullscreen: (fullscreen: boolean) => void;
  elementRef: React.RefObject<HTMLDivElement>;
  isCSSFullscreen: boolean; // is current css fullscreen state
}

/**
 * Custom hook for managing fullscreen functionality
 * Supports cross-browser fullscreen API with proper error handling
 */
export const useFullscreen = (
  options: UseFullscreenOptions = {}
): UseFullscreenReturn => {
  const {
    onEnterFullscreen,
    useCSSMode,
    onExitFullscreen,
    onError,
    targetElement,
  } = options;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCSSFullscreen, setIsCSSFullscreen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const getFullscreenTarget = useCallback(() => {
    return targetElement || elementRef.current;
  }, [targetElement]);

  const setCSSFullscreen = useCallback(
    (fullscreen: boolean) => {
      if (fullscreen === isCSSFullscreen) {
        return;
      }

      setIsCSSFullscreen(fullscreen);

      if (fullscreen) {
        onEnterFullscreen?.();
      } else {
        onExitFullscreen?.();
      }
    },
    [onEnterFullscreen, onExitFullscreen, isCSSFullscreen]
  );

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    // if use css mode, set css fullscreen state directly
    if (useCSSMode) {
      setCSSFullscreen(true);
      return;
    }

    const target = getFullscreenTarget();
    if (!target) {
      const error = new Error("Element reference is not available");
      onError?.(error);
      return;
    }

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
      onEnterFullscreen?.();
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      onError?.(error as Error);
    }
  }, [
    useCSSMode,
    getFullscreenTarget,
    onEnterFullscreen,
    onError,
    setCSSFullscreen,
  ]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    // if css mode, set css fullscreen state directly to exit fullscreen
    if (useCSSMode) {
      setCSSFullscreen(false);
      return;
    }

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      // onExitFullscreen?.();
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
      onError?.(error as Error);
    }
  }, [onError, useCSSMode, setCSSFullscreen]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    const currentFullscreen = useCSSMode ? isCSSFullscreen : isFullscreen;

    if (currentFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [
    isFullscreen,
    isCSSFullscreen,
    useCSSMode,
    enterFullscreen,
    exitFullscreen,
  ]);

  // Check if current element is in fullscreen
  const checkFullscreenStatus = useCallback(() => {
    const fullscreenElement = document.fullscreenElement;

    const target = getFullscreenTarget();
    const isCurrentlyFullscreen = fullscreenElement === target;

    if (isCurrentlyFullscreen !== isFullscreen) {
      console.log(
        "checkFullscreenStatus isCurrentlyFullscreen",
        isCurrentlyFullscreen
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // workaround for native fullscreen, exit fullscreen by key esc will not work
      if (!isCurrentlyFullscreen) {
        onExitFullscreen?.();
      }
    }

    return isCurrentlyFullscreen;
  }, [isFullscreen, getFullscreenTarget, onExitFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreenStatus);
    // Initial check
    // checkFullscreenStatus();

    // Cleanup
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreenStatus);
    };
  }, [checkFullscreenStatus]);

  // listen for esc key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("Escape key pressed");
        if (useCSSMode && isCSSFullscreen) {
          setCSSFullscreen(false);
        }

        // else if (!useCSSMode && isFullscreen) {
        //   // if native fullscreen, exit fullscreen by key esc will not work, browser will  intercept this event
        //   exitFullscreen();
        // }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    useCSSMode,
    isCSSFullscreen,
    isFullscreen,
    exitFullscreen,
    setCSSFullscreen,
  ]);

  useEffect(() => {
    if (!useCSSMode && isCSSFullscreen) {
      setIsCSSFullscreen(false);
    }
  }, [useCSSMode, isCSSFullscreen, isFullscreen]);

  const finalFullscreenState = useCSSMode ? isCSSFullscreen : isFullscreen;

  return {
    isFullscreen: finalFullscreenState,
    isCSSFullscreen,
    setCSSFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    elementRef,
  };
};
