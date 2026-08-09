// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateOTP, saveOTP, sendOTPEmail } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate and save OTP
    const otp = generateOTP();
    await saveOTP(email, otp,'register');

    // Send OTP via email
    await sendOTPEmail(email, otp,'register');

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}