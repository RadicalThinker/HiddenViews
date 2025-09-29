import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import EventModel from '@/model/Event';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { queryId: string } }
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
    const { queryId } = params;
    const userId = _user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the event containing this query
    const event = await EventModel.findOne({
      createdBy: user._id,
      'queries._id': queryId
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    // Remove the query from the event
    event.queries = event.queries.filter((query: any) => query._id.toString() !== queryId);

    // Update event stats
    event.stats.totalQueries = event.queries.length;
    event.stats.resolvedQueries = event.queries.filter((q: any) => q.isResolved).length;

    await event.save();

    // Update user profile stats by recalculating from all events
    const userEvents = await EventModel.find({ createdBy: user._id });
    let totalQueries = 0;
    let resolvedQueries = 0;

    userEvents.forEach((evt: any) => {
      totalQueries += evt.queries.length;
      resolvedQueries += evt.queries.filter((q: any) => q.isResolved).length;
    });

    user.profileStats.totalQueries = totalQueries;
    await user.save();

    return NextResponse.json(
      { success: true, message: 'Query deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting query:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
