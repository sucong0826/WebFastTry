"use client";

import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function NetworkCheck() {
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState({
    latency: 0,
    download: 0,
    upload: 0,
    status: "idle",
  });

  const runTest = () => {
    setIsTesting(true);
    setResults({ latency: 0, download: 0, upload: 0, status: "testing" });

    // Simulate network test
    setTimeout(() => {
      setResults({
        latency: Math.random() * 50 + 10,
        download: Math.random() * 100 + 50,
        upload: Math.random() * 50 + 10,
        status: "complete",
      });
      setIsTesting(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Network Check
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test your network connectivity and speed
        </p>

        {/* Network Status */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-12 mb-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              {isTesting ? (
                <RefreshCw className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : results.status === "complete" ? (
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              ) : (
                <Wifi className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
              {isTesting
                ? "Testing network connection..."
                : results.status === "complete"
                ? "Test Complete"
                : "Ready to test"}
            </p>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={runTest}
          disabled={isTesting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-8"
        >
          <RefreshCw className={`w-5 h-5 ${isTesting ? "animate-spin" : ""}`} />
          {isTesting ? "Testing..." : "Run Network Test"}
        </button>

        {/* Results */}
        {results.status !== "idle" && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Latency
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.latency > 0 ? Math.round(results.latency) : "--"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ms
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Download
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.download > 0 ? Math.round(results.download) : "--"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Mbps
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {results.upload > 0 ? Math.round(results.upload) : "--"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Mbps
                </p>
              </div>
            </div>

            {/* Connection Quality */}
            {results.status === "complete" && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    Connection quality: {results.download > 50 ? "Excellent" : "Good"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

