import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { resolveAuthUser } from '@/lib/auth';

const INVALID_EVENT_TYPES = ['Workshop', 'Course', 'Webinar', 'Meeting', 'Project', 'Other'];

// Create a new event
export async function POST(request: NextRequest) {
  await dbConnect();

  const authUser = await resolveAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const _user = { _id: authUser._id } as User;

  try {
    const { title, description, eventType, customMessage } = await request.json();

    // Validate required fields
    if (!title || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Title and event type are required' },
        { status: 400 }
      );
    }

    if (!INVALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { success: false, message: `eventType must be one of: ${INVALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await EventModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new event
    const newEvent = new EventModel({
      title,
      description,
      eventType,
      slug,
      createdBy: _user._id,
      settings: {
        isAcceptingReviews: true,
        isAcceptingQueries: true,
        requireEmail: false,
        customMessage: customMessage || '',
      },
    });

    try {
      await newEvent.save();
    } catch (saveErr: any) {
      // Mongo E11000 duplicate key on slug — TOCTOU race between the
      // find-loop above and save(). Surface as 409 so the client can retry.
      if (saveErr?.code === 11000 && saveErr?.keyPattern?.slug) {
        return NextResponse.json(
          { success: false, message: 'Event slug conflict, please retry with a different title.' },
          { status: 409 }
        );
      }
      throw saveErr;
    }

    // Add event reference to user
    await UserModel.findByIdAndUpdate(
      _user._id,
      { 
        $push: { events: newEvent._id },
        $inc: { 'profileStats.totalEvents': 1 }
      }
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Event created successfully',
        event: {
          _id: newEvent._id,
          title: newEvent.title,
          slug: newEvent.slug,
          eventType: newEvent.eventType,
          isActive: newEvent.isActive,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating event', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's events
export async function GET(request: NextRequest) {
  await dbConnect();

  const authUser = await resolveAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const _user = { _id: authUser._id } as User;

  try {
    const events = await EventModel.find({ createdBy: _user._id })
      .select('title description eventType slug isActive createdAt stats settings')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, events },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
