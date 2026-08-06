import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  const authUser = await resolveAuthUser(request);
  if (!authUser) {
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
      createdBy: authUser._id
    }).select('title description eventType slug isActive createdAt reviews queries stats settings');

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Sort reviews and queries by creation date (newest first) on plain
    // copies — sorting the Mongoose subdoc arrays in place mutates the
    // document and confuses later save() calls.
    const sortedReviews = [...event.reviews].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sortedQueries = [...event.queries].sort((a: any, b: any) =>
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
    logger.error('Error fetching event reviews and queries', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
