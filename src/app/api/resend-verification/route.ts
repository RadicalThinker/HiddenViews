import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

const generateVerifyCode = (): string => crypto.randomInt(100000, 1000000).toString();

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    
    const user = await UserModel.findOne({ username: decodedUsername });

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
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      { 
        success: true, 
        message: 'Verification code resent successfully. Please check your email.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error resending verification code:', error);
    return Response.json(
      { success: false, message: 'Error resending verification code' },
      { status: 500 }
    );
  }
}