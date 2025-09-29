import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import EventModel from '@/model/Event';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = _user._id;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get all events created by the user
    const userEvents = await EventModel.find({ createdBy: user._id });

    // Collect all reviews and queries from the user's events
    let allReviews: any[] = [];
    let allQueries: any[] = [];

    userEvents.forEach(event => {
      allReviews.push(...event.reviews);
      allQueries.push(...event.queries);
    });

    // Sort reviews and queries by creation date (newest first)
    const sortedReviews = allReviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sortedQueries = allQueries.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        reviews: sortedReviews,
        queries: sortedQueries,
        profileStats: user.profileStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching reviews and queries:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
