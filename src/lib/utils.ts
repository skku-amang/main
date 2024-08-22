import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomElements<T>(array: T[], minCount: number = 1, maxCount?: number): T[] {
  if (maxCount === undefined || maxCount > array.length) {
    maxCount = array.length;
  }

  if (minCount > maxCount) {
    throw new Error('minCount cannot be greater than maxCount.');
  }

  // Generate a random count between minCount and maxCount
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  
  // Shuffle the array
  const shuffledArray = array.slice().sort(() => 0.5 - Math.random());
  
  // Get the first `count` elements
  return shuffledArray.slice(0, count);
}