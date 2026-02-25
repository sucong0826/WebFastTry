declare global {
  interface Window {
    VideoCompare: {
      leaveMeeting?: () => Promise<void>;
      sessionInfo?: {
        topic: string;
        password: string;
        userName: string;
        userId: number;
        isInMeeting: boolean;
        sessionId: string;
      };
    };
  }
}

export {};
