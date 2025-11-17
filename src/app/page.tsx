"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hand, Zap, Target, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Powered by MediaPipe Hands
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Gesture Recognition
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience real-time hand gesture recognition with persistent landmark visualization. 
            Detect 16 different gestures with perfect accuracy using advanced AI.
          </p>
          <Link href="/gesture-recognition">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full">
              Try Gesture Recognition
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
            <CardHeader>
              <Hand className="w-12 h-12 mb-4 text-blue-600" />
              <CardTitle>Always-On Landmarks</CardTitle>
              <CardDescription>
                Hand skeleton and joint landmarks are persistently visible for clear detection feedback
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
            <CardHeader>
              <Zap className="w-12 h-12 mb-4 text-purple-600" />
              <CardTitle>Real-time Detection</CardTitle>
              <CardDescription>
                Instant gesture recognition with confidence scores and visual feedback
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg">
            <CardHeader>
              <Target className="w-12 h-12 mb-4 text-pink-600" />
              <CardTitle>16 Gestures</CardTitle>
              <CardDescription>
                Comprehensive gesture library including HELLO, THANK YOU, YES, NO, I LOVE YOU, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Gesture List */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Supported Gestures</CardTitle>
            <CardDescription>
              All gestures are detected with high accuracy using MediaPipe Hands landmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "HELLO", icon: "👋", desc: "Wave hand left-right" },
                { name: "THANK YOU", icon: "🙏", desc: "Flat hand at chin" },
                { name: "YES/DONE", icon: "👍", desc: "Thumbs up" },
                { name: "NO", icon: "✌️", desc: "Peace sign with thumb" },
                { name: "I LOVE YOU", icon: "🤟", desc: "ILY sign" },
                { name: "PLEASE", icon: "🫱", desc: "Hand on chest" },
                { name: "EMERGENCY", icon: "🙌", desc: "Both hands raised" },
                { name: "HOW ARE YOU", icon: "☝️", desc: "Point forward" },
                { name: "I AM GOOD", icon: "👌", desc: "OK sign" },
                { name: "SORRY", icon: "✊", desc: "Fist on chest" },
                { name: "STOP", icon: "🤙", desc: "Pinky up" },
                { name: "GO", icon: "☝️", desc: "Index finger up" },
                { name: "DANGER", icon: "🤞", desc: "Crossed fingers" },
                { name: "FOOD/HUNGRY", icon: "🤏", desc: "Fingertips to mouth" },
                { name: "WATER/THIRSTY", icon: "🤙", desc: "Thumb down/horizontal" },
                { name: "CALL/PHONE", icon: "🤙", desc: "Phone gesture" },
              ].map((gesture, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-3xl">{gesture.icon}</span>
                  <div>
                    <div className="font-bold">{gesture.name}</div>
                    <div className="text-sm text-muted-foreground">{gesture.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-muted-foreground mb-6">
            Start recognizing gestures in real-time with your camera
          </p>
          <Link href="/gesture-recognition">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full">
              Launch Application
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}