"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Users } from "lucide-react"
import Link from "next/link"
import { useCompanyUserStats } from "@/lib/hooks/use-auth"

export function UserLimitNotice() {
    const { data: stats, isLoading } = useCompanyUserStats()

    if (isLoading || !stats) return null

    const percentUsed = stats.percentUsed
    const isWarning = percentUsed >= 80
    const isCritical = percentUsed >= 100

    // Don't show if below 80%
    if (percentUsed < 80) return null

    return (
        <Alert variant={isCritical ? "destructive" : "default"} className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
                <span>User Limit {isCritical ? "Reached" : "Warning"}</span>
                <span className="text-sm font-normal">
                    <Users className="h-4 w-4 inline mr-1" />
                    {stats.currentUsers} / {stats.maxUsers} users
                </span>
            </AlertTitle>
            <AlertDescription className="mt-3 space-y-3">
                <Progress value={percentUsed} className="h-2" />
                <p className="text-sm">
                    {isCritical
                        ? "Your company has reached the maximum number of users allowed in your current plan. Upgrade to add more users."
                        : "Your company is approaching the user limit. Consider upgrading your plan to avoid disruptions."}
                </p>
                <Button asChild size="sm" variant={isCritical ? "default" : "outline"}>
                    <Link href="/dashboard/manage">
                        {isCritical ? "Upgrade Plan Now" : "View Plans"}
                    </Link>
                </Button>
            </AlertDescription>
        </Alert>
    )
}
