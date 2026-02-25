const SDK_VERSIONS = {
  agora: "4.24.0-1",
  twilio: "2.33.0",
  zoom: "2.3.5",
} as const;

export type SDKType = "agora" | "twilio" | "zoom";

/**
 * Get SDK version number
 * @param sdkType SDK type ('agora' | 'twilio' | 'zoom')
 * @returns Formatted version string, e.g. "v4.23.4"
 */
export const getSDKVersion = (sdkType: SDKType): string => {
  const version = SDK_VERSIONS[sdkType];
  return version ? `v${version}` : "";
};
