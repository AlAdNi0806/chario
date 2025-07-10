import { authClient } from "@/lib/auth-client";

export const requestOTP = async () => {
  try {
    const response = await authClient.twoFactor.sendOtp();
    return response;
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return {
      error: { message: "Failed to request OTP. Please try again." },
    };
  }
};
