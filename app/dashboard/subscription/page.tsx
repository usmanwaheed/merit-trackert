"use client"

import { Suspense } from "react"
import { SubscriptionManagement } from "@/components/dashboard/subscription-management"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionPage() {
    return (
        <div className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
                <p className="text-muted-foreground">
                    Manage your company's plan and billing
                </p>
            </div>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <SubscriptionManagement />
            </Suspense>
        </div>
    )
}
