import axios from "axios";
import { VIDEOSDKCOMPARE_API_BASE_URL } from "../config";

const baseURL = VIDEOSDKCOMPARE_API_BASE_URL;

console.log("baseURL", baseURL);

axios.interceptors.request.use((config) => {
  console.log("Request sent:", config);
  return config;
});

export const getAgoraToken = (
  channelName: string,
  uid: number,
  role: string,
  expireTime = 3600 * 24
) => {
  const resolvedRole = role === "host" ? "publisher" : "subscriber";

  return axios.post(`${baseURL}/agora-token`, {
    channelName,
    uid,
    role: resolvedRole,
    expireTime,
  });
};

export const getTwilioToken = (identity: string, expireTime = 3600 * 24) => {
  return axios.post(`${baseURL}/twilio-token`, {
    identity,
    expireTime,
  });
};

export const getZoomToken = (params: {
  sdkKey: string;
  sdkSecret: string;

  userIdentity: string;
  sessionName: string;
  role: number;
  expirationSeconds: number;
  sessionKey?: string;
  geoRegions?: string[];
  cloudRecordingOption: number;
  cloudRecordingElection: number;
  videoWebRtcMode: number;
  audioWebRtcMode: number;
  telemetryTrackingId?: string;
}) => {
  return axios.post(`${baseURL}/zoom-token`, params);
};
