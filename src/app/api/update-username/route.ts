import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import { z } from 'zod'
import { usernameValidation } from '@/schemas/signUpSchema'
import { resolveAuthUser } from '@/lib/auth'
import { signMobileToken } from '@/lib/mobileAuth'

const BodySchema = z.object({
  newUsername: usernameValidation,
})

export async function PATCH(request: NextRequest) {
  await dbConnect()

  const authUser = await resolveAuthUser(request)

  if (!authUser) {
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

    // If exact same username as current, short-circuit
    if (String(authUser.username || '') === newUsername) {
      return NextResponse.json({ success: true, message: 'Username unchanged' }, { status: 200 })
    }

    // Ensure unique against other users
    const existing = await UserModel.findOne({ username: newUsername, _id: { $ne: authUser._id } })
    if (existing) {
      if (existing.isVerified) {
        return NextResponse.json({ success: false, message: 'Username is already taken' }, { status: 409 })
      }
      // Stale unverified account holding the username — remove it to allow the claim
      await UserModel.deleteOne({ _id: existing._id })
    }

    const user = await UserModel.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    user.username = newUsername
    await user.save()

    let token: string | undefined
    const authHeader = request.headers.get('authorization') || ''
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      token = signMobileToken({
        sub: String(user._id),
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAcceptingMessages: user.isAcceptingMessages,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully',
      username: newUsername,
      token,
      user: {
        _id: String(user._id),
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isAcceptingMessages: user.isAcceptingMessages,
        theme: user.theme,
        profileStats: user.profileStats,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
