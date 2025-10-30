"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2, RefreshCw } from "lucide-react";

export default function AudioTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const startTest = () => {
    setIsTesting(true);
    // Simulate audio level changes
    const interval = setInterval(() => {
      setMicLevel(Math.random() * 100);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsTesting(false);
      setMicLevel(0);
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Audio Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test your microphone and audio output devices
        </p>

        {/* Audio Visualization */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-12 mb-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              {isTesting ? (
                <Mic className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-pulse" />
              ) : (
                <MicOff className="w-16 h-16 text-gray-400" />
              )}
            </div>
            
            {/* Audio Level Meter */}
            <div className="max-w-md mx-auto mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full transition-all duration-150"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Audio Level: {Math.round(micLevel)}%
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {isTesting
                ? "Listening to your microphone..."
                : "Click Start Test to begin"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={startTest}
            disabled={isTesting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Mic className="w-5 h-5" />
            {isTesting ? "Testing..." : "Start Test"}
          </button>
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 className="w-5 h-5" />
            Test Speakers
          </button>
        </div>

        {/* Device Selection */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Audio Devices
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Microphone
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Default Microphone</option>
                <option>Built-in Microphone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speakers
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Default Speakers</option>
                <option>Built-in Speakers</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

