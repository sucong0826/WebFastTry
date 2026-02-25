"use client";

import dynamic from "next/dynamic";

const EmbeddedVideoSdkCompareApp = dynamic(
  () => import("@/features/videosdkcompare/EmbeddedApp"),
  { ssr: false }
);

export default function VideoSdkComparePage() {
  return (
    <div className="min-h-[88vh] overflow-visible rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="w-full">
        <EmbeddedVideoSdkCompareApp />
      </div>
    </div>
  );
}
