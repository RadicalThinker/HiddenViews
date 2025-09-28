import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
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

    // Find and remove the query
    const queryIndex = user.queries.findIndex((query: any) => query._id.toString() === queryId);
    if (queryIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    user.queries.splice(queryIndex, 1);

    // Recalculate profile stats
    user.profileStats.totalQueries = user.queries.length;
    user.profileStats.resolvedQueries = user.queries.filter((q: any) => q.isResolved).length;

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
