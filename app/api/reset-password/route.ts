import { NextRequest, NextResponse } from "next/server";
import {
  consumePasswordResetToken,
  updateUserPassword,
  hashPassword,
} from "@/lib/server/shared";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password)
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      );
    if (password.length < 8)
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );

    const result = await consumePasswordResetToken(token);
    if (!result)
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 400 },
      );

    const passwordHash = hashPassword(password);
    await updateUserPassword(result.userId, passwordHash);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
