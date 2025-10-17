import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  try {
    const { username } = params;
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername }).select('email');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Mask the email for privacy (show first 2 chars and domain)
    const email = user.email;
    const [localPart, domain] = email.split('@');
    const maskedEmail = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`
      : `${localPart}@${domain}`;

    return NextResponse.json(
      {
        success: true,
        email: maskedEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user email:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
