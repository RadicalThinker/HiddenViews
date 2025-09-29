import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { isAcceptingMessages, theme } = await request.json();
    const userId = _user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update settings
    if (typeof isAcceptingMessages === 'boolean') {
      user.isAcceptingMessages = isAcceptingMessages;
    }
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      user.theme = theme;
    }

    await user.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Settings updated successfully',
        settings: {
          isAcceptingMessages: user.isAcceptingMessages,
          theme: user.theme,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
