"use client";

import GestureRecognition from "@/components/GestureRecognition";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Gesture Recognition
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Real-time hand gesture recognition powered by MediaPipe Hands. The hand skeleton and landmarks are always visible to show detection clarity. Perform any of the 12 gestures to see instant recognition.
          </p>
        </div>

        {/* Main Component */}
        <GestureRecognition />
      </div>
    </div>
  );
}