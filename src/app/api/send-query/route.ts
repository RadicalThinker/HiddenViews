import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { querySchema } from '@/schemas/querySchema';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { eventSlug, content, category, senderEmail } = await request.json();

    // Validate the query data
    const result = querySchema.safeParse({ content, category, senderEmail });
    if (!result.success) {
      const queryErrors = result.error.format();
      return NextResponse.json(
        {
          success: false,
          message: queryErrors.content?._errors || queryErrors.category?._errors || queryErrors.senderEmail?._errors || 'Invalid query data',
        },
        { status: 400 }
      );
    }

    // Find the event
    const event = await EventModel.findOne({ slug: eventSlug, isActive: true });
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is accepting queries
    if (!event.settings.isAcceptingQueries) {
      return NextResponse.json(
        { success: false, message: 'This event is not accepting queries' },
        { status: 403 }
      );
    }

    // Create new query
    const newQuery = {
      content,
      category: category || 'General',
      createdAt: new Date(),
      isResolved: false,
      senderEmail: senderEmail || undefined,
    };

    // Push the query to the event's queries array
    event.queries.push(newQuery as any);

    // Stats will be automatically updated by the pre-save middleware
    await event.save();

    return NextResponse.json(
      { success: true, message: 'Query sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding query:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
