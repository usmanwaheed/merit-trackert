"use client"

import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Check, Users, Zap, Shield } from "lucide-react";
import { AdminLayout } from "@/components/superadmin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    useSuperadminPlansData,
    useCreateSuperadminPlan,
    useDeleteSuperadminPlan,
    useUpdateSuperadminPlan,
} from "@/lib/hooks/use-superadmin-plans";

interface Plan {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    userLimit: number;
    storageLimit: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
}

interface Subscription {
    id: string;
    companyId: string;
    planId: string;
    status: "trial" | "active" | "expired" | "cancelled";
    period: "monthly" | "annual";
    renewsOn: string;
    seatsUsed: number;
    seatsAllowed: number;
    companyName?: string;
    planName?: string;
}

export default function Plans() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    // Form State
    const [form, setForm] = useState({
        name: "",
        description: "",
        monthlyPrice: "",
        yearlyPrice: "",
        userLimit: "",
        storageLimit: "",
        features: "",
        isPopular: false,
        isActive: true,
    });

    const { data, isLoading } = useSuperadminPlansData();
    const createPlanMutation = useCreateSuperadminPlan();
    const deletePlanMutation = useDeleteSuperadminPlan();

    const plans = (data?.plans ?? []) as Plan[];
    const subscriptions = data?.subscriptions ?? [];

    const subscribersByPlan = useMemo(() => {
        return subscriptions.reduce<Record<string, number>>((acc, subscription) => {
            acc[subscription.planId] = (acc[subscription.planId] ?? 0) + 1;
            return acc;
        }, {});
    }, [subscriptions]);

    const planCards = useMemo(() => {
        return plans.map((plan) => {
            let tier: "starter" | "pro" | "enterprise" = "starter";
            if (plan.name.toLowerCase().includes("pro")) tier = "pro";
            if (plan.name.toLowerCase().includes("enterprise")) tier = "enterprise";

            return {
                ...plan,
                tier,
                subscribers: subscribersByPlan[plan.id] ?? 0,
            };
        });
    }, [plans, subscribersByPlan]);

    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const updatePlanMutation = useUpdateSuperadminPlan();

    const handleCreateOrUpdatePlan = async () => {
        if (!form.name || !form.monthlyPrice || !form.userLimit) {
            return;
        }

        try {
            const payload = {
                name: form.name,
                description: form.description,
                monthlyPrice: parseInt(form.monthlyPrice),
                yearlyPrice: parseInt(form.yearlyPrice) || parseInt(form.monthlyPrice) * 10,
                userLimit: parseInt(form.userLimit),
                storageLimit: parseInt(form.storageLimit) || 5,
                features: form.features.split("\n").filter(f => f.trim()),
                isPopular: form.isPopular,
                isActive: form.isActive,
            };

            if (editingPlanId) {
                await updatePlanMutation.mutateAsync({
                    id: editingPlanId,
                    ...payload,
                });
            } else {
                await createPlanMutation.mutateAsync(payload as any);
            }

            setIsCreateOpen(false);
            resetForm();
        } catch (error) {
            // Error handled by mutation toast
        }
    };

    const resetForm = () => {
        setEditingPlanId(null);
        setForm({
            name: "",
            description: "",
            monthlyPrice: "",
            yearlyPrice: "",
            userLimit: "",
            storageLimit: "",
            features: "",
            isPopular: false,
            isActive: true,
        });
    };

    const handleEditPlan = (plan: Plan) => {
        setEditingPlanId(plan.id);
        setForm({
            name: plan.name,
            description: plan.description || "",
            monthlyPrice: plan.monthlyPrice.toString(),
            yearlyPrice: plan.yearlyPrice.toString(),
            userLimit: plan.userLimit.toString(),
            storageLimit: (plan.storageLimit ?? 5).toString(),
            features: plan.features.join("\n"),
            isPopular: plan.isPopular,
            isActive: plan.isActive,
        });
        setIsCreateOpen(true);
    };

    const handleDeletePlan = (id: string) => {
        setPlanToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDeletePlan = async () => {
        if (planToDelete) {
            await deletePlanMutation.mutateAsync(planToDelete);
            setIsDeleteOpen(false);
            setPlanToDelete(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-foreground">Plans</h1>
                        <p className="text-muted-foreground text-lg">
                            Create and manage subscription plans for your customers.
                        </p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gradient-primary text-primary-foreground">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingPlanId ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="plan-name">Plan Name</Label>
                                    <Input
                                        id="plan-name"
                                        placeholder="e.g., Professional"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan-description">Description</Label>
                                    <Textarea
                                        id="plan-description"
                                        placeholder="Describe this plan..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="monthly-price">Monthly Price ($)</Label>
                                        <Input
                                            id="monthly-price"
                                            type="number"
                                            placeholder="99"
                                            value={form.monthlyPrice}
                                            onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearly-price">Yearly Price ($)</Label>
                                        <Input
                                            id="yearly-price"
                                            type="number"
                                            placeholder="990"
                                            value={form.yearlyPrice}
                                            onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="user-limit">User Limit</Label>
                                        <Input
                                            id="user-limit"
                                            type="number"
                                            placeholder="10"
                                            value={form.userLimit}
                                            onChange={(e) => setForm({ ...form, userLimit: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
                                        <Input
                                            id="storage-limit"
                                            type="number"
                                            placeholder="5"
                                            value={form.storageLimit}
                                            onChange={(e) => setForm({ ...form, storageLimit: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="features">Features (one per line)</Label>
                                    <Textarea
                                        id="features"
                                        placeholder={`Feature 1\nFeature 2\nFeature 3`}
                                        rows={4}
                                        value={form.features}
                                        onChange={(e) => setForm({ ...form, features: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="popular"
                                            checked={!!form.isPopular}
                                            onCheckedChange={(checked) => setForm({ ...form, isPopular: checked })}
                                        />
                                        <Label htmlFor="popular">Mark as popular</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="active"
                                            checked={!!form.isActive}
                                            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                                        />
                                        <Label htmlFor="active">Active</Label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="gradient-primary text-primary-foreground"
                                        variant="outline"
                                        onClick={handleCreateOrUpdatePlan}
                                        disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                                    >
                                        {createPlanMutation.isPending || updatePlanMutation.isPending
                                            ? (editingPlanId ? "Saving..." : "Creating...")
                                            : (editingPlanId ? "Save Changes" : "Create Plan")}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex justify-center py-4">
                    <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")} className="w-full max-w-xs">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl h-12">
                            <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-full">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all h-full flex items-center gap-2">
                                Yearly
                                <Badge variant="secondary" className="bg-success/15 text-success text-[10px] font-bold px-1.5 py-0 uppercase">
                                    Save 20%
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {planCards.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 hover-lift border-border/50 group ${plan.isPopular ? "border-primary ring-1 ring-primary/20 shadow-xl" : "hover:border-primary/30"
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-4 right-4 z-10">
                                    <Badge className="gradient-primary text-primary-foreground font-semibold px-3 py-1 rounded-full shadow-sm hover:opacity-90">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="text-center pb-4 pt-8">
                                <div className={cn(
                                    "w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-inner",
                                    plan.isPopular ? "bg-primary/20" : "bg-muted"
                                )}>
                                    {plan.name === "Starter" && <Users className="w-10 h-10 text-primary" />}
                                    {plan.name === "Pro" && <Zap className="w-10 h-10 text-primary" />}
                                    {plan.name === "Enterprise" && <Shield className="w-10 h-10 text-primary" />}
                                </div>
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="max-w-[80%] mx-auto mt-2 text-sm">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 px-8 pb-8">
                                <div className="text-center space-y-2">
                                    <div className="flex items-baseline justify-center gap-1.5">
                                        <span className="text-5xl font-black tracking-tight text-foreground">
                                            ${billingCycle === "monthly" ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                                        </span>
                                        <span className="text-muted-foreground font-medium text-lg">
                                            /mo
                                        </span>
                                    </div>
                                    {billingCycle === "yearly" && (
                                        <p className="text-xs text-success font-semibold px-2 py-0.5 bg-success/10 rounded-full inline-block">
                                            Billed annually (${plan.yearlyPrice}/yr)
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground font-medium">Up to {plan.userLimit} users included</p>
                                    <p className="text-sm text-muted-foreground font-medium">{plan.storageLimit || 5} GB storage</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">What's included</p>
                                    <ul className="space-y-3.5">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-4 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className="text-foreground/90 font-medium leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-8 border-t border-border/60">
                                    <div className="flex items-center justify-between text-sm mb-6 bg-muted/30 p-3 rounded-xl border border-border/40">
                                        <span className="text-muted-foreground font-medium flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Active Subs
                                        </span>
                                        <Badge variant="outline" className="font-bold border-primary/20 bg-primary/5">{plan.subscribers}</Badge>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold border-border/60 hover:bg-muted" onClick={() => handleEditPlan(plan)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Manage Plan
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-destructive hover:text-primary hover:bg-destructive border-destructive/20 transition-all shadow-sm shadow-destructive/10" onClick={() => handleDeletePlan(plan.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-border/40 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-muted/30 border-b border-border/40 py-6 px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Plan Performance</CardTitle>
                                <CardDescription>Detailed breakdown of subscriber metrics and revenue</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">Real-time Data</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/10 border-b border-border/40">
                                        <th className="text-left py-4 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan</th>
                                        <th className="text-left py-4 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Subscribers</th>
                                        <th className="text-left py-4 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Revenue</th>
                                        <th className="text-left py-4 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Yearly Revenue</th>
                                        <th className="text-left py-4 px-8 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {planCards.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="py-4 px-8">
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{plan.name}</span>
                                            </td>
                                            <td className="py-4 px-8 text-muted-foreground font-medium">{plan.subscribers}</td>
                                            <td className="py-4 px-8 text-muted-foreground font-medium">
                                                ${(plan.subscribers * plan.monthlyPrice).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-8 text-muted-foreground font-medium">
                                                ${(plan.subscribers * plan.yearlyPrice).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-8">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                                        plan.isActive
                                                            ? "bg-success/15 text-success border border-success/20 shadow-sm shadow-success/5"
                                                            : "bg-muted text-muted-foreground border border-border/50"
                                                    )}
                                                >
                                                    {plan.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Plan Alert Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the subscription plan
                                and may affect existing subscribers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={confirmDeletePlan}
                            >
                                Delete Plan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}