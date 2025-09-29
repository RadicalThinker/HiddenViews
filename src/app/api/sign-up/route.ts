import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Check for required fields
    if (!email) {
      return Response.json(
        {
          success: false,
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Check if user already exists with verified email
    const existingVerifiedUserByEmail = await UserModel.findOne({
      email,
      isVerified: true,
    });

    if (existingVerifiedUserByEmail) {
      return Response.json(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 400 }
      );
    }

    // Check if user already exists with this username
    const existingUserByUsername = await UserModel.findOne({
      username,
    });

    if (existingUserByUsername) {
      if (existingUserByUsername.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'Username is already taken',
          },
          { status: 400 }
        );
      } else {
        // User exists but not verified, update their details
        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        existingUserByUsername.email = email;
        existingUserByUsername.password = hashedPassword;
        existingUserByUsername.verifyCode = verifyCode;
        existingUserByUsername.verifyCodeExpiry = expiryDate;

        await existingUserByUsername.save();

        // Send verification email
        console.log('Sending verification email to existing user:', email);
        const emailResponse = await sendVerificationEmail(
          email,
          username,
          verifyCode
        );

        if (!emailResponse.success) {
          console.error('Failed to send verification email:', emailResponse.message);
          return Response.json(
            {
              success: true,
              message: 'User registered but failed to send verification email. Please click "Resend Code" to receive your verification code.',
              redirectUrl: `/verify/${encodeURIComponent(username)}`,
              emailSent: false,
            },
            { status: 201 }
          );
        }

        const isDevelopment = process.env.NODE_ENV === 'development';
        const developmentMessage = isDevelopment 
          ? ' For development, you can use dummy OTP: 123456' 
          : '';

        return Response.json(
          {
            success: true,
            message: `User registered successfully. Please check your email for verification code.${developmentMessage}`,
            redirectUrl: `/verify/${encodeURIComponent(username)}`,
            emailSent: true,
          },
          { status: 201 }
        );
      }
    }

    // Check if unverified user exists with this email
    const existingUnverifiedUserByEmail = await UserModel.findOne({
      email,
      isVerified: false,
    });

    if (existingUnverifiedUserByEmail) {
      // Update existing unverified user
      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      existingUnverifiedUserByEmail.username = username;
      existingUnverifiedUserByEmail.password = hashedPassword;
      existingUnverifiedUserByEmail.verifyCode = verifyCode;
      existingUnverifiedUserByEmail.verifyCodeExpiry = expiryDate;

      await existingUnverifiedUserByEmail.save();

      // Send verification email
      console.log('Sending verification email to existing unverified user:', email);
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );

      if (!emailResponse.success) {
        console.error('Failed to send verification email:', emailResponse.message);
        return Response.json(
          {
            success: true,
            message: 'User registered but failed to send verification email. Please click "Resend Code" to receive your verification code.',
            redirectUrl: `/verify/${encodeURIComponent(username)}`,
            emailSent: false,
          },
          { status: 201 }
        );
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const developmentMessage = isDevelopment 
        ? ' For development, you can use dummy OTP: 123456' 
        : '';

      return Response.json(
        {
          success: true,
          message: `User registered successfully. Please check your email for verification code.${developmentMessage}`,
          redirectUrl: `/verify/${encodeURIComponent(username)}`,
          emailSent: true,
        },
        { status: 201 }
      );
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry: expiryDate,
      isVerified: false,
    });

    await newUser.save();

    // Send verification email
    console.log('Attempting to send verification email to new user:', email);
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    console.log('Email response:', emailResponse);

    if (!emailResponse.success) {
      console.error('Failed to send verification email:', emailResponse.message);
      
      // Still return success but inform user about email issue
      return Response.json(
        {
          success: true,
          message: 'User registered successfully but failed to send verification email. Please click "Resend Code" to receive your verification code.',
          redirectUrl: `/verify/${encodeURIComponent(username)}`,
          emailSent: false,
        },
        { status: 201 }
      );
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    const developmentMessage = isDevelopment 
      ? ' For development, you can use dummy OTP: 123456' 
      : '';

    return Response.json(
      {
        success: true,
        message: `User registered successfully. Please check your email for verification code.${developmentMessage}`,
        redirectUrl: `/verify/${encodeURIComponent(username)}`,
        emailSent: true,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      { success: false, message: 'Error registering user' },
      { status: 500 }
    );
  }
}