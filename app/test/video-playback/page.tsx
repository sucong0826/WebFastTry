"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function VideoPlaybackTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Video Playback Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test video playback functionality on this device
        </p>

        {/* Video Player Placeholder */}
        <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" />
              ) : (
                <Play className="w-12 h-12 text-white ml-2" />
              )}
            </div>
            <p className="text-white text-lg">Video Player Area</p>
            <p className="text-gray-400 text-sm mt-2">
              Replace with actual video element
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Play
              </>
            )}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-5 h-5" />
                Unmute
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Mute
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                Video Format Support
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                Ready
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                Playback State
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                {isPlaying ? "Playing" : "Paused"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                Audio State
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
                {isMuted ? "Muted" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

