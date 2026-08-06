import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { logger } from '@/lib/logger';

const MAX_VERIFY_ATTEMPTS = 5;

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  let username: string | undefined;

  try {
    const body = await request.json();
    username = body.username;
    const code = body.code;
    const decodedUsername = decodeURIComponent(username || '');

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return Response.json(
        { success: false, message: 'User is already verified' },
        { status: 400 }
      );
    }

    // Lock out after too many failed attempts
    if (user.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
      return Response.json(
        {
          success: false,
          message:
            'Too many incorrect attempts. Please request a new verification code.',
        },
        { status: 429 }
      );
    }

    // Check if verification code is correct
    if (user.verifyCode !== code) {
      user.verifyAttempts = (user.verifyAttempts || 0) + 1;
      // Invalidate the code once the attempt budget is exhausted
      if (user.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
        user.verifyCode = 'LOCKED';
      }
      await user.save();
      return Response.json(
        {
          success: false,
          message:
            user.verifyAttempts >= MAX_VERIFY_ATTEMPTS
              ? 'Too many incorrect attempts. Please request a new verification code.'
              : 'Invalid verification code',
        },
        { status: user.verifyAttempts >= MAX_VERIFY_ATTEMPTS ? 429 : 400 }
      );
    }

    // Check if verification code has expired
    const currentTime = new Date();
    if (currentTime > user.verifyCodeExpiry) {
      return Response.json(
        { success: false, message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Verify the user
    user.isVerified = true;
    // Clear verification code, expiry, and attempts for security
    user.verifyCode = 'VERIFIED';
    user.verifyCodeExpiry = new Date();
    user.verifyAttempts = 0;

    await user.save();

    return Response.json(
      { 
        success: true, 
        message: 'Email verified successfully. You can now sign in.' 
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error verifying code', error, { username });
    return Response.json(
      { success: false, message: 'Error verifying code' },
      { status: 500 }
    );
  }
}
