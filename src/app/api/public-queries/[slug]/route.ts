import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  try {
    const { slug } = params;

    // Find the event by slug
    const event = await EventModel.findOne({ slug, isActive: true }).select('queries');

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Filter queries that have replies (answered queries only)
    const publicQueries = event.queries
      .filter(query => query.reply && query.reply.content) // Only show answered queries
      .map(query => ({
        _id: query._id,
        content: query.content,
        category: query.category,
        createdAt: query.createdAt,
        reply: query.reply,
        isResolved: query.isResolved,
        // Don't expose sender email for privacy
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Most recent first

    return NextResponse.json(
      {
        success: true,
        queries: publicQueries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public queries:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
