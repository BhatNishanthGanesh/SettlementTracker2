// lib/otp.ts
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP for Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) for registration is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        </div>
        <p style="color: #555; font-size: 14px;">This OTP is valid for 10 minutes.</p>
        <p style="color: #555; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #777; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}

export async function saveOTP(email: string, otp: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Delete any existing OTPs for this email
  await prisma.oTP.deleteMany({
    where: { email },
  });

  // Create new OTP
  await prisma.oTP.create({
    data: {
      email,
      otp,
      expiresAt,
    },
  });
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      otp,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return true;
}