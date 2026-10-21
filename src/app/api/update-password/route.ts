import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { resolveAuthUser } from '@/lib/auth'

const BodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
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

    const { currentPassword, newPassword } = parsed.data

    const user = await UserModel.findById(authUser._id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const isCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isCorrect) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    user.password = hashed
    await user.save()

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
