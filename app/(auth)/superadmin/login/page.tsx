"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSuperadminLogin } from "@/lib/hooks"
import { getErrorMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

export default function SuperadminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const loginMutation = useSuperadminLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    loginMutation.mutate({
      email,
      password,
      rememberMe,
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">WF</span>
          </div>
          <span className="font-semibold text-foreground">WorkFlow Pro</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">Superadmin Access</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to manage your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getErrorMessage(loginMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="superadmin-email">Email</Label>
                <Input
                  id="superadmin-email"
                  type="email"
                  placeholder="superadmin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="superadmin-password">Password</Label>
                <Input
                  id="superadmin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={loginMutation.isPending}
                />
                <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                  Remember me on this device
                </Label>
              </div>

              <Button type="submit" className="w-full mt-6 hover-lift border" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Need an account? </span>
              <Link href="/superadmin/register" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div >
  )
}
