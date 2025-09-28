import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  try {
    const { slug } = params;

    // Find the event by slug and populate creator info
    const event = await EventModel.findOne({ slug, isActive: true })
      .populate('createdBy', 'username')
      .select('title description eventType settings stats createdBy createdAt');

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          settings: event.settings,
          stats: event.stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to update event settings' },
        { status: 401 }
      );
    }

    const { slug } = params;
    const { settings } = await request.json();

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Find the event and verify ownership
    const event = await EventModel.findOne({ slug, isActive: true });
    
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the event
    if (event.createdBy.toString() !== session.user._id) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to update this event' },
        { status: 403 }
      );
    }

    // Update only the provided settings fields
    const updatedSettings = { ...event.settings };
    
    // Validate and update each settings field
    if (settings.isAcceptingReviews !== undefined) {
      updatedSettings.isAcceptingReviews = Boolean(settings.isAcceptingReviews);
    }
    if (settings.isAcceptingQueries !== undefined) {
      updatedSettings.isAcceptingQueries = Boolean(settings.isAcceptingQueries);
    }
    if (settings.requireEmail !== undefined) {
      updatedSettings.requireEmail = Boolean(settings.requireEmail);
    }
    if (settings.customMessage !== undefined) {
      updatedSettings.customMessage = settings.customMessage?.toString().trim() || '';
    }

    // Update the event
    const updatedEvent = await EventModel.findOneAndUpdate(
      { slug, isActive: true },
      { 
        settings: updatedSettings,
        updatedAt: new Date()
      },
      { new: true }
    ).select('settings updatedAt');

    return NextResponse.json(
      {
        success: true,
        message: 'Event settings updated successfully',
        settings: updatedEvent.settings,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating event settings:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
