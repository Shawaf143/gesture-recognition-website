"use client";

import GestureRecognition from "@/components/GestureRecognition";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GestureRecognitionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Gesture Recognition
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Real-time hand gesture recognition powered by MediaPipe Hands. The hand skeleton and landmarks are always visible to show detection clarity. Perform any of the 16 gestures to see instant recognition.
          </p>
        </div>

        {/* Main Component */}
        <GestureRecognition />

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">High Accuracy</h3>
            <p className="text-sm text-muted-foreground">
              Advanced landmark detection with confidence scoring for precise gesture recognition
            </p>
          </div>
          <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Real-time Processing</h3>
            <p className="text-sm text-muted-foreground">
              Instant gesture detection with persistent hand skeleton visualization
            </p>
          </div>
          <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="text-3xl mb-3">🤲</div>
            <h3 className="font-bold mb-2">16 Gestures</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive gesture library from basic signs to complex expressions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
