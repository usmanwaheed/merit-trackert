"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSuperadminRegister } from "@/lib/hooks"
import { getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePlatformSettings } from "@/lib/hooks/use-platform-settings"
import { toast } from "sonner"

export default function SuperadminRegisterPage() {
  const { data: settings } = usePlatformSettings()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [registerMutation] = useState(useSuperadminRegister())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      secretKey: process.env.NEXT_PUBLIC_SUPERADMIN_SECRET_KEY || 'merit-tracker-super-secret',
    } as any) // Cast to any or correct type if available
  }

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              {settings?.platformName?.charAt(0) || "W"}F
            </span>
          </div>
          <span className="font-semibold text-foreground">
            {settings?.platformName || "WorkFlow Pro"}
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Superadmin onboarding</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create a superadmin</CardTitle>
            <CardDescription>Set up your platform owner account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || registerMutation.isError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error || getErrorMessage(registerMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="superadmin-first-name">First name</Label>
                  <Input
                    id="superadmin-first-name"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    disabled={registerMutation.isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="superadmin-last-name">Last name</Label>
                  <Input
                    id="superadmin-last-name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    disabled={registerMutation.isPending}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="superadmin-email">Email</Label>
                <Input
                  id="superadmin-email"
                  type="email"
                  placeholder="superadmin@example.com"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  disabled={registerMutation.isPending}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="superadmin-password">Password</Label>
                  <Input
                    id="superadmin-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    disabled={registerMutation.isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="superadmin-confirm">Confirm</Label>
                  <Input
                    id="superadmin-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm("confirmPassword", e.target.value)}
                    disabled={registerMutation.isPending}
                    required
                  />
                </div>

              </div>

              <Button type="submit" className="w-full " disabled={registerMutation.isPending}>
                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create superadmin
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have access? </span>
              <Link href="/superadmin/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
