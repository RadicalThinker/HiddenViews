import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import EventModel from '@/model/Event';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
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
    const { reviewId } = params;
    const userId = authUser._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the event containing the review
    const event = await EventModel.findOne({
      createdBy: user._id,
      'reviews._id': reviewId
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Remove the review
    event.reviews = event.reviews.filter((review: any) => 
      review._id.toString() !== reviewId
    );

    await event.save();

    // Recalculate profile stats
    const userEvents = await EventModel.find({ createdBy: user._id });
    let totalReviews = 0;
    let totalRating = 0;

    userEvents.forEach(event => {
      totalReviews += event.reviews.length;
      event.reviews.forEach((review: any) => {
        totalRating += review.rating;
      });
    });

    if (totalReviews > 0) {
      user.profileStats.averageRating = totalRating / totalReviews;
    } else {
      user.profileStats.averageRating = 0;
    }
    user.profileStats.totalReviews = totalReviews;

    await user.save();

    return NextResponse.json(
      { success: true, message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
