import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';
import { resolveAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await dbConnect();
  const authUser = await resolveAuthUser(request);

  if (!authUser) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(authUser._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    // $unwind produces zero docs when messages is an empty array, so we
    // distinguish "no messages" (200, [] ) from "user truly gone" (404).
    if (!user || user.length === 0) {
      const exists = await UserModel.exists({ _id: userId });
      if (!exists) {
        return Response.json(
          { message: 'User not found', success: false },
          { status: 404 }
        );
      }
      return Response.json({ messages: [] }, { status: 200 });
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    logger.error('Error fetching messages', error, { userId: authUser._id });
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
