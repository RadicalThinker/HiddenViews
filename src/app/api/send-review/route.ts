import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { reviewSchema } from '@/schemas/reviewSchema';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { eventSlug, content, rating, senderEmail } = await request.json();

    // Validate the review data
    const result = reviewSchema.safeParse({ content, rating });
    if (!result.success) {
      const reviewErrors = result.error.format();
      return NextResponse.json(
        {
          success: false,
          message: reviewErrors.content?._errors || reviewErrors.rating?._errors || 'Invalid review data',
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

    // Check if event is accepting reviews
    if (!event.settings.isAcceptingReviews) {
      return NextResponse.json(
        { success: false, message: 'This event is not accepting reviews' },
        { status: 403 }
      );
    }

    // Create new review
    const newReview = {
      content,
      rating,
      createdAt: new Date(),
      senderEmail: senderEmail || undefined,
    };

    // Push the review to the event's reviews array
    event.reviews.push(newReview as any);

    // Stats will be automatically updated by the pre-save middleware
    await event.save();

    return NextResponse.json(
      { success: true, message: 'Review sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
