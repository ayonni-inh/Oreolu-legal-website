import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  findUserByEmail,
  createPasswordResetToken,
  getBaseUrl,
} from "@/lib/server/shared";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || email.trim() === "")
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail))
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );

    const user = await findUserByEmail(trimmedEmail);

    // Always return the same success message whether or not the user exists,
    // to avoid leaking which emails are registered.
    if (user) {
      const token = await createPasswordResetToken(user.id, trimmedEmail);
      const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
      await sendEmail(
        trimmedEmail,
        "Password Reset Request",
        `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
