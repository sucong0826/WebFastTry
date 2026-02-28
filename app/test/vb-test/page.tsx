"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const VB_SCRIPT =
  "https://d27xp8zu78jmsf.cloudfront.net/web-media/fe74vyi/vb.min.js";

export default function VbTestPage() {
  const [scriptReady, setScriptReady] = useState(false);
  const [sabAvailable, setSabAvailable] = useState(false);
  const mounted = useRef(false);
  const vbRef = useRef<unknown>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSabAvailable(typeof SharedArrayBuffer !== "undefined");
  }, []);

  useEffect(() => {
    if (!scriptReady || !mounted.current) return;
    const VB = (window as unknown as { VB: new (op: unknown) => unknown }).VB;
    if (!VB) return;

    const cvs = document.getElementById("cvs") as HTMLCanvasElement;
    const startBtn = document.getElementById("start");
    const stopBtn = document.getElementById("stop");
    const toggleVBBtn = document.getElementById("toggleVB");
    const mirrorBtn = document.getElementById("mirrorBtn");
    const bgImage = document.getElementById("bgImage") as HTMLImageElement;
    const bgBtn = document.getElementById("bgBtn");
    const blurBtn = document.getElementById("blurBtn");
    const stopVBBtn = document.getElementById("stopBtn");
    const videoEle = document.getElementById("videoEle") as HTMLVideoElement;
    const pauseBtn = document.getElementById("pause");
    const resumeBtn = document.getElementById("resume");
    const resetBtn = document.getElementById("restart");
    const streamBtn = document.getElementById("stream");
    const stats = document.getElementById("stats");

    if (!cvs) return;

    const width = 640;
    const height = 360;
    cvs.width = width;
    cvs.height = height;

    let isMirror = false;
    const vb = new VB({
      canvas: cvs,
      needFrame: true,
      enableWasm: true,
    });
    vbRef.current = vb;

    vb.onMessage((e: { cmd: string; payload?: { data_ptr?: unknown } }) => {
      if (e.cmd === "VB_WORKER_ERROR") {
        console.log("VB_WORKER_ERROR: ", e);
      }
    });

    navigator.mediaDevices
      .getUserMedia({
        video: { width, height, frameRate: 24 },
      })
      .then((stream) => {
        videoStreamRef.current = stream;
        vb.captureVideo(stream).then(() => {
          console.log("backend: ", vb.backend);
        });
      })
      .catch(() => {});

    startBtn?.addEventListener("click", () => {
      const msgPort = vb.startReceiveMode();
      if (window.opener) {
        window.opener.postMessage({ type: "send_canvas" }, "*", [msgPort]);
      }
    });

    stopBtn?.addEventListener("click", () => {
      if (window.opener) {
        window.opener.postMessage({ type: "remove_canvas" });
      }
    });

    window.addEventListener("message", (e: MessageEvent) => {
      if (e.data?.frame) {
        vb.renderFrame(e.data.frame);
      }
    });

    toggleVBBtn?.addEventListener("click", () => {
      if (vb.isEnabled) vb.disable();
      else vb.enable();
    });

    mirrorBtn?.addEventListener("click", () => {
      isMirror = !isMirror;
      vb.setMirror(isMirror);
    });

    bgBtn?.addEventListener("click", () => {
      if (bgImage?.complete && bgImage.naturalWidth) {
        vb.set_background_image(bgImage);
      }
    });

    blurBtn?.addEventListener("click", () => {
      vb.set_background_blur();
    });

    stopVBBtn?.addEventListener("click", () => {
      vb.stopCapture();
    });

    pauseBtn?.addEventListener("click", () => {
      vb.stopCapture(false);
    });

    resumeBtn?.addEventListener("click", () => {
      vb.captureVideo(videoStreamRef.current);
    });

    resetBtn?.addEventListener("click", () => {
      vb.captureVideo({
        video: { width: 1280, height: 720, frameRate: 24 },
      }).catch((e: unknown) => console.log("error: ", e));
    });

    streamBtn?.addEventListener("click", () => {
      const vbStream = vb.createStream();
      if (videoEle) videoEle.srcObject = vbStream;
    });

    const statsInterval = setInterval(() => {
      if (stats && vb.stats) {
        const { fps, width: w, height: h } = vb.stats;
        stats.innerText = `stats: ${w}x${h}@${fps}`;
      }
    }, 1000);

    return () => {
      clearInterval(statsInterval);
      try {
        vb.stopCapture?.();
      } catch (_) {}
    };
  }, [scriptReady]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">VB Test (Virtual Background)</h1>

        {/* SAB / no SAB mode banner */}
        <div className="mb-6 p-4 rounded-lg bg-gray-800 border border-gray-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">SharedArrayBuffer:</span>
            <span
              className={
                sabAvailable
                  ? "text-green-400"
                  : "text-amber-400"
              }
            >
              {sabAvailable ? "available" : "not available"}
            </span>
            <span className="text-gray-400 text-sm">
              (Reload with the link below to switch mode.)
            </span>
            <div className="flex gap-3">
              <Link
                href="/test/vb-test?sabMode=sab"
                className="text-sm px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700"
              >
                Test with SharedArrayBuffer
              </Link>
              <Link
                href="/test/vb-test"
                className="text-sm px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-700"
              >
                Test without SharedArrayBuffer
              </Link>
            </div>
          </div>
        </div>

        <div id="stats" className="mb-2 font-mono text-sm text-gray-400">
          stats
        </div>
        <canvas
          width={1280}
          height={720}
          id="cvs"
          className="block w-full max-w-full h-auto border border-gray-600 rounded bg-black"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            id="start"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            start receive mode
          </button>
          <button
            id="stop"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            stop receive mode
          </button>
          <button
            id="toggleVB"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            toggle vb
          </button>
          <button
            id="mirrorBtn"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            Mirror
          </button>
          <button
            id="bgBtn"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            set background
          </button>
          <button
            id="blurBtn"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            blur
          </button>
          <button
            id="stopBtn"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            stop
          </button>
          <button
            id="pause"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            Pause
          </button>
          <button
            id="resume"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            Resume
          </button>
          <button
            id="restart"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            Restart
          </button>
          <button
            id="stream"
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
          >
            create stream
          </button>
        </div>

        <div className="mt-6">
          <img
            src="https://picsum.photos/640/360"
            alt="Background"
            id="bgImage"
            className="max-w-xs rounded border border-gray-600"
            crossOrigin="anonymous"
          />
        </div>
        <div className="mt-4">
          <video
            controls
            muted
            autoPlay
            id="videoEle"
            className="max-w-full rounded border border-gray-600"
          />
        </div>
      </div>

      <Script
        src={VB_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
    </div>
  );
}
