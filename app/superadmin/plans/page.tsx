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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    userLimit: "",
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
      features: plan.features.join("\n"),
      isPopular: plan.isPopular,
      isActive: plan.isActive,
    });
    setIsCreateOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      await deletePlanMutation.mutateAsync(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Plans</h1>
            <p className="text-muted-foreground mt-1">
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
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="popular">Mark as popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      checked={!!form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                      className="data-[state=checked]:bg-primary"
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

        <div className="flex justify-center">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2 bg-success/10 text-success text-xs">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planCards.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.isPopular ? "border-2 border-primary shadow-lg" : ""}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {plan.name === "Starter" && <Users className="w-7 h-7 text-primary" />}
                  {plan.name === "Pro" && <Zap className="w-7 h-7 text-primary" />}
                  {plan.name === "Enterprise" && <Shield className="w-7 h-7 text-primary" />}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      ${billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Up to {plan.userLimit} users</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Active subscribers</span>
                    <Badge variant="secondary">{plan.subscribers}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleEditPlan(plan)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeletePlan(plan.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subscribers</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Monthly Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Yearly Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planCards.map((plan) => (
                    <tr key={plan.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium">{plan.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{plan.subscribers}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        ${(plan.subscribers * plan.monthlyPrice).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        ${(plan.subscribers * plan.yearlyPrice).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={plan.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}
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
      </div>
    </AdminLayout>
  );
}
