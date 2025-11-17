"use client";

import GestureRecognition from "@/components/GestureRecognition";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            AI Gesture Recognition
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Real-time hand gesture recognition powered by MediaPipe Hands. The hand skeleton and landmarks are always visible to show detection clarity. Perform any of the 11 gestures to see instant recognition.
          </p>
        </div>

        {/* Main Component */}
        <GestureRecognition />
      </div>
    </div>
  );
}