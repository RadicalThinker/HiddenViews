import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Create a new event
export async function POST(request: NextRequest) {
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
    const { title, description, eventType, customMessage } = await request.json();

    // Validate required fields
    if (!title || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Title and event type are required' },
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

    await newEvent.save();

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
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's events
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

  try {
    const events = await EventModel.find({ createdBy: _user._id })
      .select('title description eventType slug isActive createdAt stats settings')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, events },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
