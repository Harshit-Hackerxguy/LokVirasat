'use client';

export default function IndiaMapBg() {
  return (
    <div className="india-video-bg" aria-hidden="true">
      <video
        className="india-video"
        src="/india-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      {/* Dark gradient overlay so hero text stays readable */}
      <div className="india-video-overlay" />
    </div>
  );
}
