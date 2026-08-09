import { api } from "@/lib/api";
import type { RegisterDto, VerifyOtpDto, ResendOtpDto } from "@/types/auth.types";

export const authService = {
  register(data: RegisterDto) {
    return api.post("/auth/register", data);
  },

  verifyOTP(data:VerifyOtpDto) {
    return api.post("/auth/verify-otp", data);
  },

  resendOTP(data:ResendOtpDto) {
    return api.post("/auth/send-otp", data);
  },
};