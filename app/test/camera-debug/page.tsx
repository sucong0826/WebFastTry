"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraDebug() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const log = (...args: any[]) => {
    const msg = args
      .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
      .join(" ");
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  };

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const initCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      log("🎥 请求摄像头权限...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      streamRef.current = stream;
      log("✅ MediaStream 获取成功");
      log({
        id: stream.id,
        active: stream.active,
        tracks: stream.getTracks().map((t) => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          settings: t.getSettings(),
        })),
      });

      video.srcObject = stream;

      video.addEventListener("loadedmetadata", () => {
        log("🎬 video loadedmetadata 触发");
        log(`视频尺寸: ${video.videoWidth}x${video.videoHeight}`);
      });

      video.addEventListener("play", () => {
        log("▶️ video 开始播放");
      });

      video.addEventListener("error", (e: any) => {
        log("❌ video 播放错误:", e.message || e);
      });
    } catch (err: any) {
      log("❌ 获取摄像头失败:", err.name, err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        log(`⏹️ 停止 track: ${track.kind} - ${track.label}`);
      });
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      log("✅ 摄像头已停止");
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 border border-green-500/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold text-green-400 font-mono">
            Camera Debug Console
          </h1>
        </div>
        
        <p className="text-green-300/70 mb-8 font-mono text-sm">
          摄像头测试页面 - 带详细日志输出
        </p>

        {/* Video Preview */}
        <div className="mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-2xl h-auto bg-black border-2 border-green-500/50 rounded-lg"
            style={{ aspectRatio: "4/3" }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={initCamera}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-3 px-6 rounded-lg transition-colors border border-green-400"
          >
            🎥 启动摄像头
          </button>
          <button
            onClick={stopCamera}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold py-3 px-6 rounded-lg transition-colors border border-red-400"
          >
            ⏹️ 停止摄像头
          </button>
          <button
            onClick={clearLogs}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-3 px-6 rounded-lg transition-colors border border-gray-500"
          >
            🗑️ 清空日志
          </button>
        </div>

        {/* Log Output */}
        <div className="bg-gray-950 border-2 border-green-500/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-green-400 font-mono font-bold text-lg">
              📋 Console Logs
            </h2>
            <span className="text-green-500/70 font-mono text-sm">
              {logs.length} entries
            </span>
          </div>
          <div
            ref={logBoxRef}
            className="font-mono text-green-400 text-sm whitespace-pre-wrap h-64 overflow-y-auto bg-black/50 p-4 rounded border border-green-500/30"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#22c55e #000",
            }}
          >
            {logs.length === 0 ? (
              <div className="text-green-500/50 italic">
                等待操作... 点击&quot;启动摄像头&quot;开始测试
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-green-600 mr-2">[{index + 1}]</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 font-mono text-sm">
            <strong className="text-green-400">💡 提示:</strong> 此页面会显示摄像头初始化的每一步详细信息，
            包括 MediaStream 对象、视频轨道设置、事件触发等，便于调试问题。
          </p>
        </div>
      </div>
    </div>
  );
}

