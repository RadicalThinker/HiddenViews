import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
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
    const { reviewId } = params;
    const userId = _user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find and remove the review
    const reviewIndex = user.reviews.findIndex((review: any) => review._id.toString() === reviewId);
    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    user.reviews.splice(reviewIndex, 1);

    // Recalculate profile stats
    const totalReviews = user.reviews.length;
    if (totalReviews > 0) {
      const totalRating = user.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
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
