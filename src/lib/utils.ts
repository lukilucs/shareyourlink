import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789"; // Similar characters removed for better readability (O, 0, I)
  let result = "";

  // For now just 4 chars
  for (let i = 0; i < 4; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomRotations(
  numberOfRotations: number,
  maxAngle: number,
): number[] {
  let randomAngles = [];
  for (let i = 0; i < numberOfRotations; i++) {
    const randomAngle = Math.floor(Math.random() * maxAngle) + 1; // Random angle between 1 and maxAngle degrees
    randomAngles.push(randomAngle);
  }
  return randomAngles;
}

export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
