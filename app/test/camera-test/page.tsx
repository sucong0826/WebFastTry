"use client";

import { useState } from "react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

export default function CameraTest() {
  const [isCameraOn, setIsCameraOn] = useState(false);

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Camera Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test your camera functionality
        </p>

        {/* Camera Preview */}
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6 relative overflow-hidden">
          {isCameraOn ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Camera className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-lg font-medium">Camera Active</p>
              <p className="text-gray-400 text-sm mt-2">
                Video feed would appear here
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraOff className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-white text-lg font-medium">Camera Off</p>
              <p className="text-gray-400 text-sm mt-2">
                Click Start to activate camera
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={toggleCamera}
            className={`font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isCameraOn
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isCameraOn ? (
              <>
                <CameraOff className="w-5 h-5" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Start Camera
              </>
            )}
          </button>
          <button
            disabled={!isCameraOn}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Switch Camera
          </button>
        </div>

        {/* Camera Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Camera Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Camera
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Front Camera</option>
                <option>Back Camera</option>
                <option>External Camera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>1920x1080 (Full HD)</option>
                <option>1280x720 (HD)</option>
                <option>640x480 (SD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Info */}
        {isCameraOn && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <p className="text-green-800 dark:text-green-300 font-medium">
                Camera is active and working properly
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

