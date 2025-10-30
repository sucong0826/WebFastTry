"use client";

import { useState } from "react";
import { Monitor, MonitorStop, Share2 } from "lucide-react";

export default function ScreenShare() {
  const [isSharing, setIsSharing] = useState(false);

  const toggleScreenShare = () => {
    setIsSharing(!isSharing);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Screen Share Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test screen sharing capability
        </p>

        {/* Screen Share Preview */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6 relative overflow-hidden">
          {isSharing ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Monitor className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-lg font-medium">Sharing Screen</p>
              <p className="text-gray-400 text-sm mt-2">
                Your screen content would appear here
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MonitorStop className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-white text-lg font-medium">Not Sharing</p>
              <p className="text-gray-400 text-sm mt-2">
                Click Start to share your screen
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <button
          onClick={toggleScreenShare}
          className={`w-full font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-8 ${
            isSharing
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSharing ? (
            <>
              <MonitorStop className="w-5 h-5" />
              Stop Sharing
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Start Screen Share
            </>
          )}
        </button>

        {/* Instructions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Instructions
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>Click the &quot;Start Screen Share&quot; button above</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>
                Select the window, tab, or entire screen you want to share
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>Verify the shared content appears correctly</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span>Click &quot;Stop Sharing&quot; when finished</span>
            </p>
          </div>
        </div>

        {/* Browser Compatibility Note */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">
            <strong>Note:</strong> Screen sharing requires a modern browser with
            getUserMedia API support and user permission.
          </p>
        </div>
      </div>
    </div>
  );
}

