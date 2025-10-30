"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Globe, Cpu, HardDrive } from "lucide-react";

export default function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Gather device information
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    setDeviceInfo(info);
  }, []);

  if (!deviceInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Device Information
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          View detailed information about this device
        </p>

        {/* Info Cards */}
        <div className="space-y-6">
          {/* Browser Info */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Browser Information
              </h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="User Agent" value={deviceInfo.userAgent} />
              <InfoRow label="Platform" value={deviceInfo.platform} />
              <InfoRow label="Language" value={deviceInfo.language} />
              <InfoRow
                label="Cookies Enabled"
                value={deviceInfo.cookieEnabled ? "Yes" : "No"}
              />
              <InfoRow
                label="Online Status"
                value={deviceInfo.onLine ? "Online" : "Offline"}
              />
            </div>
          </div>

          {/* Display Info */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Display Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow
                label="Screen Resolution"
                value={`${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`}
              />
              <InfoRow
                label="Viewport Size"
                value={`${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`}
              />
              <InfoRow
                label="Color Depth"
                value={`${deviceInfo.colorDepth}-bit`}
              />
              <InfoRow
                label="Pixel Ratio"
                value={`${deviceInfo.pixelRatio}x`}
              />
            </div>
          </div>

          {/* System Info */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                System Information
              </h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="Timezone" value={deviceInfo.timezone} />
              <InfoRow
                label="Timestamp"
                value={new Date().toLocaleString()}
              />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(deviceInfo, null, 2);
              const dataBlob = new Blob([dataStr], {
                type: "application/json",
              });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "device-info.json";
              link.click();
            }}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <HardDrive className="w-5 h-5" />
            Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white font-mono break-all">
        {value}
      </span>
    </div>
  );
}

