import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password} = await request.json();

    // Check for required email
    if (!email) {
      return Response.json(
        {
          success: false,
          message: 'Email is required',
        },
        { status: 400 }
      );
    }

    const existingVerifiedUserByUsername = await UserModel.findOne({ username });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    if (existingUserByEmail) {
      return Response.json(
        {
          success: false,
          message: 'Email is already registered',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      email, // Include email here
      isAcceptingMessages: true,
      messages: [],
    });

    await newUser.save();

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Redirecting to login page.',
        redirectUrl: '/sign-in', 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}
