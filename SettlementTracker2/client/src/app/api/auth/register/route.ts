// app/api/auth/register/route.ts
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { generateOTP, saveOTP, sendOTPEmail } from "@/lib/otp";

export const POST = async (request: Request) => {
  try {
    const { name, email, password } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ message: "Email is already in use" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    await saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    return new NextResponse(
      JSON.stringify({ 
        message: "User registered. OTP sent to email.",
        email: email 
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
};