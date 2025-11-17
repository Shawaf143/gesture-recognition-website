"use client";

import { useEffect, useRef, useState } from "react";
import { detectGestures, GestureResult, Landmark } from "@/lib/gestureDetection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// MediaPipe types (loaded from CDN)
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const GESTURE_DESCRIPTIONS: Record<string, string> = {
  "HELLO": "Wave hand left-right with all fingers extended",
  "YES/DONE": "Thumbs-up gesture",
  "NO": "Index + middle fingers together with thumb extended",
  "I LOVE YOU": "Thumb + index + pinky raised",
  "PLEASE": "Flat hand on chest area",
  "EMERGENCY": "Hand raised above shoulders with fingers spread",
  "I AM GOOD/FINE": "Form O shape with thumb and index",
  "SORRY": "Fist on chest making circles",
  "STOP": "Raise index and middle fingers up, other fingers closed",
  "GO": "Show only index finger pointing up",
  "WATER/THIRSTY": "Thumb extended, other fingers folded downward",
  "CALL/PHONE": "Phone gesture near ear (thumb + pinky extended)"
};

// Load MediaPipe scripts dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Text-to-Speech function
const speakGesture = (gestureName: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(gestureName);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

export default function GestureRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectedGestures, setDetectedGestures] = useState<GestureResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const previousLandmarksRef = useRef<Landmark[]>();
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastSpokenGestureRef = useRef<string>("");
  const lastSpeakTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const initializeMediaPipe = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;

        // Load MediaPipe scripts from CDN
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");

        // Wait for scripts to be available
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!window.Hands || !window.Camera || !window.drawConnectors) {
          throw new Error("MediaPipe libraries failed to load");
        }

        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        hands.onResults((results: any) => {
          if (!mounted || !canvasRef.current) return;

          const canvasElement = canvasRef.current;
          const canvasCtx = canvasElement.getContext("2d");
          if (!canvasCtx) return;

          // Clear canvas
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          // Draw video frame
          if (results.image) {
            canvasCtx.drawImage(
              results.image,
              0,
              0,
              canvasElement.width,
              canvasElement.height
            );
          }

          // CRITICAL: Always draw hand landmarks and connections
          if (results.multiHandLandmarks) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const landmarks = results.multiHandLandmarks[i];
              const handedness = results.multiHandedness[i]?.label || "Unknown";

              // Draw connections (skeleton)
              window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 4,
              });

              // Draw landmarks (joints)
              window.drawLandmarks(canvasCtx, landmarks, {
                color: "#FF0000",
                lineWidth: 2,
                radius: 5,
              });

              // Detect gestures
              const landmarksArray = landmarks.map((lm: any) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
              }));

              const gestures = detectGestures(
                landmarksArray,
                handedness,
                previousLandmarksRef.current
              );

              previousLandmarksRef.current = landmarksArray;

              if (gestures.length > 0) {
                setDetectedGestures(gestures);
                
                // Text-to-Speech: Speak the gesture if it's new and enough time has passed
                const topGesture = gestures[0].gesture;
                const now = Date.now();
                const timeSinceLastSpeak = now - lastSpeakTimeRef.current;
                
                // Speak if: different gesture OR same gesture but 3 seconds have passed
                if (topGesture !== lastSpokenGestureRef.current || timeSinceLastSpeak > 3000) {
                  speakGesture(topGesture);
                  lastSpokenGestureRef.current = topGesture;
                  lastSpeakTimeRef.current = now;
                }
              }
            }
          } else {
            setDetectedGestures([]);
          }

          canvasCtx.restore();
        });

        handsRef.current = hands;

        // Initialize camera
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        cameraRef.current = camera;
        await camera.start();

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        if (mounted) {
          setError("Failed to initialize camera. Please ensure camera permissions are granted.");
          setIsLoading(false);
        }
      }
    };

    initializeMediaPipe();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Camera Feed with Landmarks */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>
              Hand landmarks and skeleton overlay are always visible • Voice feedback enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Initializing camera and MediaPipe Hands...</p>
                  </div>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-10">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: "none" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                width={1280}
                height={720}
              />
            </div>

            {/* Real-time Detection Display */}
            {detectedGestures.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                  🎯 Detected Gesture • 🔊 Speaking
                </h3>
                <div className="space-y-2">
                  {detectedGestures.slice(0, 3).map((gesture, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-900 dark:text-green-300">
                        {gesture.gesture}
                      </span>
                      <Badge variant="secondary" className="text-lg px-4 py-1">
                        {(gesture.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions Panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <CardHeader>
            <CardTitle>Gesture Guide</CardTitle>
            <CardDescription>All 12 supported gestures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(GESTURE_DESCRIPTIONS).map(([gesture, description]) => {
                const isActive = detectedGestures.some((g) => g.gesture === gesture);
                return (
                  <div
                    key={gesture}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isActive
                        ? "bg-green-100 dark:bg-green-900/30 border-green-500"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div className="font-bold text-sm mb-1 flex items-center gap-2">
                      {isActive && <span className="text-green-600">✓</span>}
                      {gesture}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}