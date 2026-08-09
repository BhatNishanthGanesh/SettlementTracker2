// lib/otp.ts
import prisma from "@/lib/db";
import { transporter } from "@/lib/mail";

type OtpPurpose =
  | "register"
  | "reset-password"

const otpConfig: Record<
  OtpPurpose,
  {
    subject: string;
    heading: string;
    message: string;
  }
> = {
  register: {
    subject: "Verify your email",
    heading: "Email Verification",
    message: "Your One-Time Password (OTP) for registration is:",
  },
  "reset-password": {
    subject: "Reset your password",
    heading: "Password Reset",
    message: "Use the OTP below to reset your password:",
  },
};

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: OtpPurpose
) {
  const config = otpConfig[purpose];

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: config.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:10px;">
        <h2 style="text-align:center;">${config.heading}</h2>

        <p>Hello,</p>

        <p>${config.message}</p>

        <div style="background:#f5f5f5; padding:15px; text-align:center; border-radius:8px; margin:20px 0;">
          <h1 style="letter-spacing:5px; color:#007bff;">${otp}</h1>
        </div>

        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>If you didn't request this OTP, you can safely ignore this email.</p>

        <hr>

        <p style="font-size:12px; color:#777; text-align:center;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  });
}

export async function saveOTP(
  email: string,
  otp: string,
  purpose: OtpPurpose
) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({
    where: {
      email,
      purpose,
    },
  });

  await prisma.otp.create({
    data: {
      email,
      otp,
      purpose,
      expiresAt,
    },
  });
}

export async function verifyOTP(
  email: string,
  otp: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      purpose,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  await prisma.otp.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      used: true,
    },
  });

  return true;
}