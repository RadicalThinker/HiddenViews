import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { queryId: string } }
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
    const { queryId } = params;
    const userId = authUser._id;

    // Find the event containing the query (ownership is enforced by the
    // createdBy filter, so we don't need to separately load the User).
    const event = await EventModel.findOne({
      createdBy: userId,
      'queries._id': queryId
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    // Find the specific query
    const query = event.queries.find((q: any) => q._id.toString() === queryId);
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    // Toggle resolved status
    query.isResolved = !query.isResolved;

    await event.save();

    // event.stats.resolvedQueries is recomputed by the pre('save') hook on
    // event.save() above. user.profileStats.resolvedQueries is intentionally
    // not maintained (the feature relies on event.stats for the resolved count).

    return NextResponse.json(
      { 
        success: true, 
        message: `Query marked as ${query.isResolved ? 'resolved' : 'unresolved'}`,
        isResolved: query.isResolved
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error toggling query status', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
