import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

import { resolveAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get('username'),
    };

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { username } = result.data;
    const authUser = await resolveAuthUser(request);

    // Only a verified user "owns" a username — sign-up overwrites unverified
    // collisions, so an unverified claim should not block a real sign-up.
    // When the caller is authenticated, exclude their own user ID.
    const query: Record<string, any> = {
      username,
      isVerified: true,
    };
    if (authUser?._id && mongoose.Types.ObjectId.isValid(authUser._id)) {
      query._id = { $ne: authUser._id };
    }

    const existingVerifiedUser = await UserModel.findOne(query);

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}
