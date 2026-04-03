"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, CreditCard, Users, Zap, Loader2 } from "lucide-react"
import { useSubscriptionStatus, useCompanyUserStats, authKeys } from "@/lib/hooks/use-auth"
import { usePlans, useSubscribeToPlan } from "@/lib/hooks/use-plans"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatCurrency } from "@/lib/utils"
import { usePlatformSettings } from "@/lib/hooks/use-platform-settings"
import { api } from "@/lib/api/request"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function SubscriptionManagement() {
    const { company, setCompany, setSubscription } = useAuthStore()
    const { data: settings } = usePlatformSettings()
    const { data: plans, isLoading: plansLoading } = usePlans()
    const { data: subscription } = useSubscriptionStatus()
    const { data: userStats } = useCompanyUserStats()
    const subscribeMutation = useSubscribeToPlan()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const router = useRouter()
    const hasHandledSuccess = useRef(false)

    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
    const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)

    // Handle Stripe redirect — verify payment and activate subscription
    useEffect(() => {
        const status = searchParams.get("status")
        const sessionId = searchParams.get("session_id")

        if (status === "success" && sessionId && !hasHandledSuccess.current) {
            hasHandledSuccess.current = true
            setIsVerifying(true)

            const verifyAndActivate = async () => {
                try {
                    // Call backend to verify the Stripe session and upgrade the plan
                    await api.post("/auth/subscription/verify-payment", { sessionId })

                    // Refetch subscription status from backend
                    const freshSubscription = await api.get<any>("/auth/subscription-status")
                    setSubscription(freshSubscription)

                    // Refetch company profile to get updated subscriptionPlan
                    const freshProfile = await api.get<any>("/auth/me")
                    if (freshProfile?.company) {
                        setCompany(freshProfile.company)
                    }

                    // Invalidate all related queries so the UI re-renders with fresh data
                    await queryClient.invalidateQueries({ queryKey: authKeys.subscription() })
                    await queryClient.invalidateQueries({ queryKey: authKeys.all })

                    toast.success("Payment successful! Your plan has been upgraded.")
                } catch (error) {
                    console.error("Failed to verify payment:", error)
                    toast.error("Payment verification failed. Please contact support if you were charged.")
                } finally {
                    setIsVerifying(false)
                    // Clean up URL params so a page refresh doesn't re-trigger
                    router.replace("/dashboard/subscription", { scroll: false })
                }
            }

            verifyAndActivate()
        }
    }, [searchParams, queryClient, setSubscription, setCompany, router])

    const isTrial = subscription?.status === "TRIAL"
    const currentPlanName = isTrial ? "Free Trial" : (company?.subscriptionPlan || "Starter")

    const handleUpgrade = (planId: string) => {
        setConfirmPlanId(planId)
    }

    const onConfirmUpgrade = () => {
        if (confirmPlanId) {
            subscribeMutation.mutate({ planId: confirmPlanId, period: billingCycle })
            setConfirmPlanId(null)
        }
    }

    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Verifying your payment...</p>
                <p className="text-sm text-muted-foreground">Please wait while we activate your subscription.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-1">
            {/* Current Plan Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Subscription
                    </CardTitle>
                    <CardDescription>Your plan details and usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="text-2xl font-bold">{currentPlanName}</p>
                        </div>
                        <Badge
                            variant={subscription?.isValid ? "default" : "destructive"}
                            className="text-sm py-1 px-3"
                        >
                            {subscription?.status || "TRIAL"}
                        </Badge>
                    </div>

                    {userStats && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team Members
                                </span>
                                <span className="font-medium">
                                    {userStats.currentUsers} / {userStats.maxUsers} users
                                </span>
                            </div>
                            <Progress value={userStats.percentUsed} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {userStats.canAddMore
                                    ? `${userStats.maxUsers - userStats.currentUsers} spots remaining`
                                    : "User limit reached - upgrade to add more team members"}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Days Remaining</p>
                        <p className="text-lg font-semibold">{subscription?.daysRemaining || 0} days</p>
                    </div>
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Available Plans</h3>
                    <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
                        <TabsList>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly (-20%)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {plansLoading ? (
                    <div className="grid gap-6 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-96" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {plans?.map((plan) => {
                            const isCurrent = plan.name.toUpperCase() === currentPlanName.toUpperCase()

                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative flex flex-col ${isCurrent ? "border-primary shadow-lg" : ""
                                        }`}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-primary">Current Plan</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">
                                                {formatCurrency(
                                                    billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
                                                    settings?.defaultCurrency || 'USD'
                                                )}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /{billingCycle === "monthly" ? "month" : "year"}
                                            </span>
                                        </div>
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            {billingCycle === "monthly" && (
                                                <>
                                                    <Zap className="h-3 w-3" />
                                                    Switch to yearly to save 20%
                                                </>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{plan.userLimit} team members</span>
                                        </div>

                                        <div className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <div className="p-6 pt-0 mt-auto">
                                        <Button
                                            className="w-full"
                                            variant={isCurrent ? "outline" : "default"}
                                            disabled={isCurrent || subscribeMutation.isPending}
                                            onClick={() => handleUpgrade(plan.id)}
                                        >
                                            {isCurrent ? "Current Plan" : "Upgrade"}
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            <AlertDialog open={!!confirmPlanId} onOpenChange={(open) => !open && setConfirmPlanId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change your subscription plan? You will be redirected to Stripe to complete the payment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmUpgrade}>
                            Continue to Payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
