import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { signMobileToken, verifyMobileToken } from '@/lib/mobileAuth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const auth = request.headers.get('authorization') || '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    const payload = verifyMobileToken(auth.slice(7).trim());
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await UserModel.findById(payload.sub).select(
      'username email isVerified isAcceptingMessages theme profileStats'
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: String(user._id),
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAcceptingMessages: user.isAcceptingMessages,
          theme: user.theme,
          profileStats: user.profileStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in mobile auth GET', error);
    return NextResponse.json(
      { success: false, message: 'Failed to read session' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { identifier, password } = await request
      .json()
      .catch(() => ({ identifier: '', password: '' } as any));

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'identifier and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // Always run a bcrypt compare against a dummy hash to equalize timing
    // between "user not found" and "user found, wrong password", so the
    // endpoint can't be used as a user-enumeration oracle.
    const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.3a0aJ8sJ8.3a0aJ8sJ8.3a0aJ8sJ8.3a';
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } else {
      await bcrypt.compare(password, DUMMY_HASH);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'UNVERIFIED: Please verify your email before signing in.',
          unverified: true,
        },
        { status: 403 }
      );
    }

    const token = signMobileToken({
      sub: String(user._id),
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      isAcceptingMessages: user.isAcceptingMessages,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          _id: String(user._id),
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAcceptingMessages: user.isAcceptingMessages,
          theme: user.theme,
          profileStats: user.profileStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in mobile auth', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
