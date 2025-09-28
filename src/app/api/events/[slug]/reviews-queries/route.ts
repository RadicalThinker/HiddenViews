import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const { slug } = params;

    // Find the event and verify ownership
    const event = await EventModel.findOne({ 
      slug, 
      createdBy: _user._id 
    }).select('title description eventType slug isActive createdAt reviews queries stats settings');

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Sort reviews and queries by creation date (newest first)
    const sortedReviews = event.reviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sortedQueries = event.queries.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        event: {
          _id: event._id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          slug: event.slug,
          isActive: event.isActive,
          createdAt: event.createdAt,
          stats: event.stats,
          settings: event.settings,
        },
        reviews: sortedReviews,
        queries: sortedQueries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event reviews and queries:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
