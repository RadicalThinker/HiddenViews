import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { message: 'User is not accepting messages', success: false },
        { status: 403 } // 403 Forbidden status
      );
    }

    await UserModel.updateOne(
      { _id: user._id },
      { $push: { messages: { content, createdAt: new Date() } } }
    );

    return Response.json(
      { message: 'Message sent successfully', success: true },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error sending message', error, { username });
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
