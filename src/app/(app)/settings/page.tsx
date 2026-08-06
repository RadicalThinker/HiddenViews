'use client'

import React from 'react'
import axios from 'axios'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, LogOut, Shield } from 'lucide-react'

function SettingsPage() {
  const { data: session, status, update } = useSession()
  const { toast } = useToast()

  const email = (session?.user as any)?.email || ''
  const currentUsername = (session?.user as any)?.username || ''

  const [username, setUsername] = React.useState(currentUsername)
  const [isChecking, setIsChecking] = React.useState(false)
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null)
  const [isSavingUsername, setIsSavingUsername] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isSavingPassword, setIsSavingPassword] = React.useState(false)

  const checkAvailability = async () => {
    if (!username || username === currentUsername) {
      setIsAvailable(null)
      return
    }
    setIsChecking(true)
    try {
      const res = await axios.get(`/api/check-username-unique?username=${encodeURIComponent(username)}`)
      setIsAvailable(Boolean(res.data?.success))
    } catch (e: any) {
      // 409 = taken (we set this in stone on the backend); other non-2xx treated as a check error.
      setIsAvailable(e?.response?.status === 409 ? false : null)
    } finally {
      setIsChecking(false)
    }
  }

  const saveUsername = async () => {
    if (!username) return
    setIsSavingUsername(true)
    try {
      const res = await axios.patch('/api/update-username', { newUsername: username })
      if (res.data?.success) {
        // Update session username so UI reflects immediately
        await update?.({ username })
        toast({ title: 'Username updated', description: 'Your username has been changed successfully.' })
        setIsAvailable(null)
      } else {
        toast({ title: 'Update failed', description: res.data?.message || 'Could not update username', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to update username', variant: 'destructive' })
    } finally {
      setIsSavingUsername(false)
    }
  }

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Missing fields', description: 'Please fill out all password fields.' })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'New password must be at least 6 characters.', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Password mismatch', description: 'New password and confirm password do not match.', variant: 'destructive' })
      return
    }
    setIsSavingPassword(true)
    try {
      const res = await axios.patch('/api/update-password', { currentPassword, newPassword })
      if (res.data?.success) {
        toast({ title: 'Password updated', description: 'Your password has been changed successfully.' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({ title: 'Update failed', description: res.data?.message || 'Could not update password', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to update password', variant: 'destructive' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card className="dark:bg-bg-200">
          <CardContent className="p-6">
            <div className="h-4 w-40 bg-secondary-100 rounded mb-4" />
            <div className="h-10 w-full bg-secondary-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card className="dark:bg-bg-200">
          <CardContent className="p-6">
            <p className="mb-4 text-secondary-700 dark:text-secondary-300">Please sign in to manage your settings.</p>
            <Button asChild>
              <a href="/sign-in">Go to Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Account Info */}
      <Card className="mb-6 dark:bg-bg-200">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="email" value={email} disabled className="max-w-md" />
              <Badge variant="secondary">Unchangeable</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Username */}
      <Card className="mb-6 dark:bg-bg-200">
        <CardHeader>
          <CardTitle>Change Username</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="username">New Username</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setIsAvailable(null)
                }}
                placeholder="Enter new username"
                className="max-w-md"
              />
              <Button variant="outline" onClick={checkAvailability} disabled={isChecking || !username || username === currentUsername} className='dark:hover:bg-customPrimary-200'>
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
              </Button>
            </div>
            {isAvailable === true && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Username is available</div>
            )}
            {isAvailable === false && (
              <div className="mt-2 text-sm text-red-600">Username is already taken</div>
            )}
          </div>
          <div>
            <Button onClick={saveUsername} disabled={isSavingUsername || !username || username === currentUsername}>
              {isSavingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Username'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-6 dark:bg-bg-200">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="max-w-md mt-1"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Button onClick={savePassword} disabled={isSavingPassword}>
              {isSavingPassword ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving</span>
              ) : (
                <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4" /> Update Password</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="dark:bg-bg-200">
        <CardHeader>
          <CardTitle>Logout</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/sign-in' })}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPageWrapper() {
  const { data: session } = useSession()
  
  return <SettingsPage key={session?.user?._id || 'no-user'} />
}
