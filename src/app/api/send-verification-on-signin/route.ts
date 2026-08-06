import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

const generateVerifyCode = (): string => crypto.randomInt(100000, 1000000).toString();

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return Response.json(
        { success: false, message: 'Username or email is required' },
        { status: 400 }
      );
    }

    // Find user by username or email
    const user = await UserModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        { success: false, message: 'User is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verifyCode = generateVerifyCode();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // Update user with new verification code
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = expiryDate;
    user.verifyAttempts = 0;
    await user.save();

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      user.email,
      user.username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: 'Failed to send verification email. Please try clicking "Resend Email" on the verification page.',
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Verification email sent successfully. Please check your email.',
        username: user.username,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending verification email on sign-in:', error);
    return Response.json(
      { success: false, message: 'Error sending verification email' },
      { status: 500 }
    );
  }
}