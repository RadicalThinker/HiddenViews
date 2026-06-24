import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
        authenticated: false
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      authenticated: true,
      user: {
        id: session.user._id,
        username: session.user.username,
        email: session.user.email,
        isVerified: session.user.isVerified
      },
      sessionMethod: 'getServerSession',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      authenticated: false
    }, { status: 500 });
  }
}