import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { resetPasswordSchema } from '@/schemas/passwordResetSchema';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: 'Reset token is required',
        },
        { status: 400 }
      );
    }

    // Validate password input
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errors = result.error.format();
      return Response.json(
        {
          success: false,
          message: errors.confirmPassword?._errors[0] || errors.password?._errors[0] || 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Find user by reset token
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'Invalid or expired reset token',
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Password reset successfully. You can now sign in with your new password.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in reset password:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}