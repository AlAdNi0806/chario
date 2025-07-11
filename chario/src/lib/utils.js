import { clsx } from "clsx";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const daysLeft = (deadline) => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

/**
 * Adds two ETH amounts represented as strings.
 * 
 * @param {string} ethAmount1 - First ETH amount as string (e.g. "0.037")
 * @param {string} ethAmount2 - Second ETH amount as string (e.g. "0.005")
 * @returns {string} - Sum of the two amounts as ETH string (e.g. "0.042")
 */
export function addEthAmounts(ethAmount1, ethAmount2) {
  // Convert ETH strings to bigint wei values
  const wei1 = ethers.parseEther(ethAmount1);
  const wei2 = ethers.parseEther(ethAmount2);

  // Add the bigint wei amounts using native +
  const sumWei = wei1 + wei2;

  // Convert back to ETH string
  return ethers.formatEther(sumWei);
}
