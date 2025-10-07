import { sendPasswordResetEmail } from '@/helpers/sendPasswordResetEmail';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

import { forgotPasswordSchema } from '@/schemas/passwordResetSchema';
import crypto from 'crypto';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Validate input
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: 'Invalid email address',
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user by email
    const user = await UserModel.findOne({ email });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return Response.json(
        {
          success: true,
          message: 'If an account with that email exists, you will receive a password reset link.',
        },
        { status: 200 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: 'Please verify your email first before resetting password.',
        },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    const emailResponse = await sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    );

    if (!emailResponse.success) {
      console.error('Failed to send password reset email:', emailResponse.message);
      return Response.json(
        {
          success: false,
          message: 'Failed to send password reset email. Please try again.',
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in forgot password:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}