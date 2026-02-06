"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function WebnnTest() {
  useEffect(() => {
    // 确保脚本加载完成后再执行初始化
    const initPage = () => {
      console.log("WebNN Test page loaded");
    };

    // 等待 ONNX Runtime 加载完成
    if (typeof window !== "undefined" && (window as any).ort) {
      initPage();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof window !== "undefined" && (window as any).ort) {
          initPage();
          clearInterval(checkInterval);
        }
      }, 100);
      
      return () => clearInterval(checkInterval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebNN Test (ONNX Runtime WebGPU)</h1>
        
        {/* Camera Controls */}
        <fieldset className="mb-6 p-4 border border-gray-600 rounded-lg">
          <legend className="px-2 text-lg font-semibold">Camera</legend>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2">
              Camera:
              <select
                id="cameraList"
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
              />
            </label>
            <label className="flex items-center gap-2">
              Size:
              <select
                id="sizeList"
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
              >
                <option>1280x720</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              FPS:
              <select
                id="fpsList"
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
              >
                <option>15</option>
                <option>20</option>
                <option>25</option>
                <option>27</option>
                <option>30</option>
              </select>
            </label>
          </div>
        </fieldset>

        {/* Video and Canvas Elements */}
        <div className="mb-4">
          <video id="capture" style={{ display: "none" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Downsampled Canvas</h3>
            <canvas
              id="canvasDownSampled"
              className="border border-gray-600 rounded bg-black"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Source Canvas</h3>
            <canvas
              id="canvasSource"
              className="border border-gray-600 rounded bg-black"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Mask Canvas</h3>
            <canvas
              id="canvasMask"
              className="border border-gray-600 rounded bg-black"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Mixed Canvas</h3>
            <canvas
              id="canvasMixed"
              className="border border-gray-600 rounded bg-black"
            />
          </div>
        </div>

        <button
          id="start"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          Start
        </button>

        {/* Load Scripts */}
        <Script
          src="https://cdn.jsdelivr.net/npm/onnxruntime-web@latest/dist/ort.webgpu.min.js"
          strategy="beforeInteractive"
          onLoad={() => {
            console.log("ONNX Runtime loaded");
          }}
        />
        <Script 
          src="/webnn-test/webglblend.js" 
          strategy="afterInteractive"
          onLoad={() => {
            console.log("webglblend.js loaded");
          }}
        />
        <Script
          src="/webnn-test/origin_nhwc.js"
          strategy="afterInteractive"
          type="module"
          onLoad={() => {
            console.log("origin_nhwc.js loaded");
          }}
        />
        <Script
          src="/webnn-test/webnn_test.js"
          strategy="afterInteractive"
          type="module"
          onLoad={() => {
            console.log("webnn_test.js loaded");
          }}
        />
      </div>
    </div>
  );
}
