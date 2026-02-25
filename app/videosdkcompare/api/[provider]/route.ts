import { NextRequest } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import twilio from "twilio";
import { KJUR } from "jsrsasign";

export const runtime = "nodejs";

const SUPPORTED_PROVIDERS = new Set(["agora-token", "twilio-token", "zoom-token"]);

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

type RouteParams = { params: { provider: string } };

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!SUPPORTED_PROVIDERS.has(params.provider)) {
    return Response.json({ error: "Unsupported provider" }, { status: 404 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (params.provider === "agora-token") {
      const {
        channelName,
        uid,
        role = "publisher",
        expireTime = 3600 * 24,
      } = payload;

      if (!channelName || uid === undefined) {
        return Response.json(
          { error: "channelName and uid are required" },
          { status: 400 }
        );
      }

      const appId = getEnv("AGORA_APP_ID");
      const appCertificate = getEnv("AGORA_APP_CERTIFICATE");
      const rtcRole =
        role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpireTs = currentTimestamp + Number(expireTime);

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        parseInt(String(uid), 10),
        rtcRole,
        privilegeExpireTs
      );

      return Response.json({ token, appId });
    }

    if (params.provider === "twilio-token") {
      const { identity, expireTime = 3600 * 24 } = payload;

      if (!identity) {
        return Response.json({ error: "identity is required" }, { status: 400 });
      }

      const {
        jwt: { AccessToken },
      } = twilio;
      const VideoGrant = AccessToken.VideoGrant;

      const token = new AccessToken(
        getEnv("TWILIO_ACCOUNT_SID"),
        getEnv("TWILIO_API_KEY"),
        getEnv("TWILIO_API_SECRET"),
        {
          ttl: expireTime,
          identity,
        }
      );

      token.identity = identity;
      token.addGrant(new VideoGrant());

      return Response.json({ token: token.toJwt() });
    }

    const {
      sdkKey,
      sdkSecret,
      role = 0,
      sessionName,
      userIdentity,
      sessionKey,
      videoWebRtcMode = 1,
      audioWebRtcMode = 1,
      expirationSeconds = 3600 * 24,
      geoRegions = "CN",
      cloudRecordingOption = 0,
      cloudRecordingElection = 0,
      telemetryTrackingId = "",
    } = payload;

    if (!sessionName) {
      return Response.json({ error: "sessionName is required" }, { status: 400 });
    }
    if (!userIdentity) {
      return Response.json({ error: "userIdentity is required" }, { status: 400 });
    }
    if (![0, 1].includes(role)) {
      return Response.json(
        { error: "role must be 0 (attendee) or 1 (host)" },
        { status: 400 }
      );
    }

    const zoomSdkKey = sdkKey || getEnv("ZOOM_SDK_KEY");
    const zoomSdkSecret = sdkSecret || getEnv("ZOOM_SDK_SECRET");

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expirationSeconds;
    const oHeader = { alg: "HS256", typ: "JWT" };
    const oPayload: Record<string, any> = {
      app_key: zoomSdkKey,
      role_type: role,
      tpc: sessionName,
      version: 1,
      iat,
      exp,
      user_identity: userIdentity,
      session_key: sessionKey,
      geo_regions: Array.isArray(geoRegions)
        ? geoRegions.join(",")
        : geoRegions || undefined,
      cloud_recording_option: cloudRecordingOption,
      cloud_recording_election: cloudRecordingElection,
      telemetry_tracking_id: telemetryTrackingId,
      video_webrtc_mode: videoWebRtcMode,
      audio_webrtc_mode: audioWebRtcMode,
    };

    Object.keys(oPayload).forEach((key) => {
      if (oPayload[key] === undefined) {
        delete oPayload[key];
      }
    });

    const token = KJUR.jws.JWS.sign(
      "HS256",
      JSON.stringify(oHeader),
      JSON.stringify(oPayload),
      zoomSdkSecret
    );

    return Response.json({
      token,
      expiresAt: exp,
      userIdentity,
      sessionName,
      role,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate token",
      },
      { status: 500 }
    );
  }
}
