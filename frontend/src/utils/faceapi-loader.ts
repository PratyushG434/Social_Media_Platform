// utils/faceapi-loader.ts
import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
    modelsLoaded = true;
    console.log("Face-api models loaded.");
  } catch (error) {
    console.error("Failed to load face-api models:", error);
    throw error;
  }
}