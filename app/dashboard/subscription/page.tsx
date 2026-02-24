"use client"

import { SubscriptionManagement } from "@/components/dashboard/subscription-management"

export default function SubscriptionPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
                <p className="text-muted-foreground">
                    Manage your company's plan and billing
                </p>
            </div>
            <SubscriptionManagement />
        </div>
    )
}
