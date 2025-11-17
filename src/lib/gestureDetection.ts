// Gesture detection utilities using MediaPipe Hands landmarks
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  gesture: string;
  confidence: number;
}

// Helper functions for landmark calculations
function distance(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

function angle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
  
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  
  return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
}

function isFingerExtended(landmarks: Landmark[], fingerTip: number, fingerPip: number): boolean {
  const wrist = landmarks[0];
  const tip = landmarks[fingerTip];
  const pip = landmarks[fingerPip];
  
  const tipDist = distance(wrist, tip);
  const pipDist = distance(wrist, pip);
  
  return tipDist > pipDist * 1.1;
}

function areFingersTogether(landmarks: Landmark[], finger1Tip: number, finger2Tip: number, threshold = 0.05): boolean {
  return distance(landmarks[finger1Tip], landmarks[finger2Tip]) < threshold;
}

// Gesture detection functions
export function detectGestures(
  landmarks: Landmark[],
  handedness: string,
  previousLandmarks?: Landmark[]
): GestureResult[] {
  if (!landmarks || landmarks.length !== 21) return [];
  
  const results: GestureResult[] = [];
  
  // HELLO - Wave hand left-right
  const helloGesture = detectHello(landmarks, previousLandmarks);
  if (helloGesture.confidence > 0.6) results.push(helloGesture);
  
  // THANK YOU - Flat hand at chin/mouth
  const thankYouGesture = detectThankYou(landmarks);
  if (thankYouGesture.confidence > 0.7) results.push(thankYouGesture);
  
  // YES/DONE - Thumbs up or forward punch
  const yesGesture = detectYes(landmarks);
  if (yesGesture.confidence > 0.75) results.push(yesGesture);
  
  // NO - Index+middle fingers together with thumb extended
  const noGesture = detectNo(landmarks);
  if (noGesture.confidence > 0.7) results.push(noGesture);
  
  // I LOVE YOU - Thumb+index+pinky raised OR heart shape
  const iLoveYouGesture = detectILoveYou(landmarks);
  if (iLoveYouGesture.confidence > 0.7) results.push(iLoveYouGesture);
  
  // PLEASE - Flat hand on chest
  const pleaseGesture = detectPlease(landmarks);
  if (pleaseGesture.confidence > 0.65) results.push(pleaseGesture);
  
  // EMERGENCY - Both hands raised (single hand version)
  const emergencyGesture = detectEmergency(landmarks);
  if (emergencyGesture.confidence > 0.7) results.push(emergencyGesture);
  
  // HOW ARE YOU - Point toward camera and move outward
  const howAreYouGesture = detectHowAreYou(landmarks);
  if (howAreYouGesture.confidence > 0.7) results.push(howAreYouGesture);
  
  // I AM GOOD/FINE - Form O shape
  const iAmGoodGesture = detectIAmGood(landmarks);
  if (iAmGoodGesture.confidence > 0.7) results.push(iAmGoodGesture);
  
  // SORRY - Hand on chest making circles
  const sorryGesture = detectSorry(landmarks);
  if (sorryGesture.confidence > 0.65) results.push(sorryGesture);
  
  // STOP - Raise only pinky finger
  const stopGesture = detectStop(landmarks);
  if (stopGesture.confidence > 0.8) results.push(stopGesture);
  
  // GO - Show only index finger
  const goGesture = detectGo(landmarks);
  if (goGesture.confidence > 0.8) results.push(goGesture);
  
  // DANGER - Cross fingers forming X
  const dangerGesture = detectDanger(landmarks);
  if (dangerGesture.confidence > 0.7) results.push(dangerGesture);
  
  // FOOD/HUNGRY - Tap fingertips toward mouth
  const foodGesture = detectFood(landmarks);
  if (foodGesture.confidence > 0.7) results.push(foodGesture);
  
  // WATER/THIRSTY - Fold all fingers except thumb
  const waterGesture = detectWater(landmarks);
  if (waterGesture.confidence > 0.75) results.push(waterGesture);
  
  // CALL/PHONE - Phone gesture near ear
  const callGesture = detectCall(landmarks);
  if (callGesture.confidence > 0.7) results.push(callGesture);
  
  return results.sort((a, b) => b.confidence - a.confidence);
}

function detectHello(landmarks: Landmark[], previousLandmarks?: Landmark[]): GestureResult {
  const allFingersExtended = 
    isFingerExtended(landmarks, 8, 6) &&
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  
  const palmUpright = landmarks[0].y > landmarks[9].y;
  
  let waveMotion = 0;
  if (previousLandmarks && previousLandmarks.length === 21) {
    const xMovement = Math.abs(landmarks[9].x - previousLandmarks[9].x);
    waveMotion = xMovement > 0.02 ? 0.3 : 0;
  }
  
  const confidence = allFingersExtended && palmUpright ? 0.7 + waveMotion : 0;
  return { gesture: 'HELLO', confidence };
}

function detectThankYou(landmarks: Landmark[]): GestureResult {
  const allFingersExtended = 
    isFingerExtended(landmarks, 8, 6) &&
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  
  const nearMouth = landmarks[9].y < 0.4;
  const palmOrientation = landmarks[0].y > landmarks[9].y;
  
  const confidence = allFingersExtended && nearMouth && palmOrientation ? 0.85 : 0;
  return { gesture: 'THANK YOU', confidence };
}

function detectYes(landmarks: Landmark[]): GestureResult {
  const thumbExtended = distance(landmarks[4], landmarks[0]) > distance(landmarks[3], landmarks[0]);
  const otherFingersClosed = 
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  
  const thumbPointingUp = landmarks[4].y < landmarks[3].y && landmarks[3].y < landmarks[2].y;
  
  const confidence = thumbExtended && otherFingersClosed && thumbPointingUp ? 0.9 : 0;
  return { gesture: 'YES/DONE', confidence };
}

function detectNo(landmarks: Landmark[]): GestureResult {
  const indexMiddleTogether = areFingersTogether(landmarks, 8, 12, 0.04);
  const indexMiddleExtended = isFingerExtended(landmarks, 8, 6) && isFingerExtended(landmarks, 12, 10);
  const thumbExtended = distance(landmarks[4], landmarks[0]) > distance(landmarks[3], landmarks[0]);
  const ringPinkyClosed = !isFingerExtended(landmarks, 16, 14) && !isFingerExtended(landmarks, 20, 18);
  
  const confidence = indexMiddleTogether && indexMiddleExtended && thumbExtended && ringPinkyClosed ? 0.85 : 0;
  return { gesture: 'NO', confidence };
}

function detectILoveYou(landmarks: Landmark[]): GestureResult {
  const thumbExtended = distance(landmarks[4], landmarks[0]) > distance(landmarks[3], landmarks[0]);
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);
  const middleRingClosed = !isFingerExtended(landmarks, 12, 10) && !isFingerExtended(landmarks, 16, 14);
  
  const confidence = thumbExtended && indexExtended && pinkyExtended && middleRingClosed ? 0.85 : 0;
  return { gesture: 'I LOVE YOU', confidence };
}

function detectPlease(landmarks: Landmark[]): GestureResult {
  const allFingersExtended = 
    isFingerExtended(landmarks, 8, 6) &&
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  
  const nearChest = landmarks[9].y > 0.5 && landmarks[9].y < 0.8;
  const palmFlat = Math.abs(landmarks[5].z - landmarks[17].z) < 0.05;
  
  const confidence = allFingersExtended && nearChest && palmFlat ? 0.75 : 0;
  return { gesture: 'PLEASE', confidence };
}

function detectEmergency(landmarks: Landmark[]): GestureResult {
  const allFingersExtended = 
    isFingerExtended(landmarks, 8, 6) &&
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  
  const handRaised = landmarks[9].y < 0.3;
  const fingersSpread = 
    distance(landmarks[8], landmarks[12]) > 0.08 &&
    distance(landmarks[12], landmarks[16]) > 0.08 &&
    distance(landmarks[16], landmarks[20]) > 0.08;
  
  const confidence = allFingersExtended && handRaised && fingersSpread ? 0.8 : 0;
  return { gesture: 'EMERGENCY', confidence };
}

function detectHowAreYou(landmarks: Landmark[]): GestureResult {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const otherFingersClosed = 
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  
  const pointingForward = landmarks[8].z < landmarks[5].z - 0.05;
  
  const confidence = indexExtended && otherFingersClosed && pointingForward ? 0.8 : 0;
  return { gesture: 'HOW ARE YOU', confidence };
}

function detectIAmGood(landmarks: Landmark[]): GestureResult {
  const thumbIndexDistance = distance(landmarks[4], landmarks[8]);
  const oShape = thumbIndexDistance < 0.05;
  
  const otherFingersExtended = 
    isFingerExtended(landmarks, 12, 10) &&
    isFingerExtended(landmarks, 16, 14) &&
    isFingerExtended(landmarks, 20, 18);
  
  const confidence = oShape && otherFingersExtended ? 0.85 : 0;
  return { gesture: 'I AM GOOD/FINE', confidence };
}

function detectSorry(landmarks: Landmark[]): GestureResult {
  const fistClosed = 
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  
  const nearChest = landmarks[9].y > 0.5 && landmarks[9].y < 0.8;
  
  const confidence = fistClosed && nearChest ? 0.75 : 0;
  return { gesture: 'SORRY', confidence };
}

function detectStop(landmarks: Landmark[]): GestureResult {
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);
  const otherFingersClosed = 
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14);
  
  const thumbClosed = distance(landmarks[4], landmarks[0]) < distance(landmarks[3], landmarks[0]) * 1.3;
  
  const confidence = pinkyExtended && otherFingersClosed && thumbClosed ? 0.9 : 0;
  return { gesture: 'STOP', confidence };
}

function detectGo(landmarks: Landmark[]): GestureResult {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const otherFingersClosed = 
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  
  const thumbClosed = distance(landmarks[4], landmarks[0]) < distance(landmarks[3], landmarks[0]) * 1.3;
  const indexPointingUp = landmarks[8].y < landmarks[6].y;
  
  const confidence = indexExtended && otherFingersClosed && thumbClosed && indexPointingUp ? 0.9 : 0;
  return { gesture: 'GO', confidence };
}

function detectDanger(landmarks: Landmark[]): GestureResult {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);
  const otherFingersClosed = !isFingerExtended(landmarks, 16, 14) && !isFingerExtended(landmarks, 20, 18);
  
  const fingersCrossed = areFingersTogether(landmarks, 8, 12, 0.03);
  const xShape = Math.abs(landmarks[8].x - landmarks[12].x) < 0.03;
  
  const confidence = indexExtended && middleExtended && otherFingersClosed && fingersCrossed && xShape ? 0.85 : 0;
  return { gesture: 'DANGER', confidence };
}

function detectFood(landmarks: Landmark[]): GestureResult {
  const fingertipsTogether = 
    areFingersTogether(landmarks, 4, 8, 0.04) &&
    areFingersTogether(landmarks, 8, 12, 0.04) &&
    areFingersTogether(landmarks, 12, 16, 0.04);
  
  const nearMouth = landmarks[8].y < 0.4;
  const allFingersUp = landmarks[8].y < landmarks[0].y;
  
  const confidence = fingertipsTogether && nearMouth && allFingersUp ? 0.8 : 0;
  return { gesture: 'FOOD/HUNGRY', confidence };
}

function detectWater(landmarks: Landmark[]): GestureResult {
  const thumbExtended = distance(landmarks[4], landmarks[0]) > distance(landmarks[3], landmarks[0]);
  const otherFingersClosed = 
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);
  
  const thumbDownward = landmarks[4].y > landmarks[2].y;
  const thumbHorizontal = Math.abs(landmarks[4].y - landmarks[2].y) < 0.1;
  
  const confidence = thumbExtended && otherFingersClosed && (thumbDownward || thumbHorizontal) ? 0.85 : 0;
  return { gesture: 'WATER/THIRSTY', confidence };
}

function detectCall(landmarks: Landmark[]): GestureResult {
  const thumbExtended = distance(landmarks[4], landmarks[0]) > distance(landmarks[3], landmarks[0]);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);
  const middleFingersClosedish = 
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14);
  
  const nearEar = landmarks[9].y < 0.5 && landmarks[9].x < 0.3 || landmarks[9].x > 0.7;
  
  const confidence = thumbExtended && pinkyExtended && middleFingersClosedish ? 0.8 : 0;
  return { gesture: 'CALL/PHONE', confidence };
}
