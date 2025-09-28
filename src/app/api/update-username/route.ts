import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/options'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import { User } from 'next-auth'
import { z } from 'zod'
import { usernameValidation } from '@/schemas/signUpSchema'

const BodySchema = z.object({
  newUsername: usernameValidation,
})

export async function PATCH(request: NextRequest) {
  await dbConnect()

  const session = await getServerSession(authOptions)
  const _user: User = session?.user as any

  if (!session || !_user?._id) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  try {
    const json = await request.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      const message = parsed.error.errors.map(e => e.message).join(', ')
      return NextResponse.json({ success: false, message }, { status: 400 })
    }

    const { newUsername } = parsed.data

    // If same as current, short-circuit
    if (String((_user as any).username || '').toLowerCase() === newUsername.toLowerCase()) {
      return NextResponse.json({ success: true, message: 'Username unchanged' }, { status: 200 })
    }

    // Ensure unique (exclude current user)
    const existing = await UserModel.findOne({ username: newUsername, _id: { $ne: _user._id } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Username is already taken' }, { status: 409 })
    }

    const user = await UserModel.findById(_user._id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    user.username = newUsername
    await user.save()

    return NextResponse.json({ success: true, message: 'Username updated successfully', username: newUsername }, { status: 200 })
  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
