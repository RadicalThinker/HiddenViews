import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    
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

    // Check if verification code is correct
    if (user.verifyCode !== code) {
      return Response.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
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
    // Clear verification code and expiry for security
    user.verifyCode = '';
    user.verifyCodeExpiry = new Date();

    await user.save();

    return Response.json(
      { 
        success: true, 
        message: 'Email verified successfully. You can now sign in.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying code:', error);
    return Response.json(
      { success: false, message: 'Error verifying code' },
      { status: 500 }
    );
  }
}
