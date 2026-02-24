"use client"

import { useMemo, useState } from "react";
import { Search, MoreHorizontal, Calendar, CreditCard, RefreshCw, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/superadmin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/superadmin/stats-card";
import { useSuperadminSubscriptionsData, useCancelSubscription } from "@/lib/hooks/use-superadmin-subscriptions";

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

interface Plan {
  id: string;
  name: string;
  pricePerMonth: number;
  pricePerYear: number;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success",
    trialing: "bg-info/10 text-info",
    past_due: "bg-warning/10 text-warning",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return styles[status] || "bg-muted text-muted-foreground";
}

export default function Subscriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useSuperadminSubscriptionsData();
  const subscriptions = data?.subscriptions ?? [];
  const plans = data?.plans ?? [];
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");

  const cancelMutation = useCancelSubscription();

  const formattedSubscriptions = useMemo(() => {
    return subscriptions.map((subscription) => {
      const plan = plans.find((item) => item.id === subscription.planId || item.name === subscription.planName);
      const amount = subscription.period === "annual" ? plan?.pricePerYear : plan?.pricePerMonth;
      return {
        ...subscription,
        company: subscription.companyName ?? "Unknown",
        plan: subscription.planName ?? plan?.name ?? "Plan",
        billingCycle: subscription.period === "annual" ? "yearly" : "monthly",
        amount: amount ?? 0,
        nextBilling: subscription.renewsOn,
        uiStatus:
          subscription.status === "trial"
            ? "trialing"
            : subscription.status === "expired"
              ? "past_due"
              : subscription.status,
      };
    });
  }, [plans, subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return formattedSubscriptions.filter((sub) => {
      const matchesSearch =
        sub.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "all" || sub.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || sub.uiStatus === statusFilter;
      const matchesBilling = billingFilter === "all" || sub.billingCycle === billingFilter;
      return matchesSearch && matchesPlan && matchesStatus && matchesBilling;
    });
  }, [billingFilter, formattedSubscriptions, planFilter, searchQuery, statusFilter]);

  const activeSubscriptions = formattedSubscriptions.filter((sub) => sub.uiStatus === "active");
  const monthlyRecurringRevenue = activeSubscriptions.reduce((total, sub) => {
    if (sub.billingCycle === "monthly") {
      return total + sub.amount;
    }
    return total + sub.amount / 12;
  }, 0);
  const trialSubscriptions = formattedSubscriptions.filter((sub) => sub.uiStatus === "trialing").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all active subscriptions and billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Subscriptions"
            value={activeSubscriptions.length.toLocaleString()}
            icon={<RefreshCw className="w-6 h-6" />}
            change="Live subscriptions"
            changeType="positive"
          />
          <StatsCard
            title="MRR"
            value={`$${Math.round(monthlyRecurringRevenue).toLocaleString()}`}
            icon={<CreditCard className="w-6 h-6" />}
            change="Estimated monthly run-rate"
            changeType="positive"
          />
          <StatsCard
            title="Trial Accounts"
            value={trialSubscriptions.toLocaleString()}
            icon={<Calendar className="w-6 h-6" />}
            change="Currently in trial"
            changeType="neutral"
          />
          <StatsCard
            title="Churn Rate"
            value="2.4%"
            icon={<XCircle className="w-6 h-6" />}
            change="-0.5% vs last month"
            changeType="positive"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company or subscription ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.name}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={billingFilter} onValueChange={setBillingFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Billing Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-sm">{sub.id}</TableCell>
                    <TableCell className="font-medium">{sub.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan}</Badge>
                    </TableCell>
                    <TableCell>${sub.amount}</TableCell>
                    <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                    <TableCell className="text-muted-foreground">{sub.nextBilling}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(sub.uiStatus)}>
                        {sub.uiStatus.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Change Plan</DropdownMenuItem>
                          <DropdownMenuItem>Update Payment</DropdownMenuItem>
                          <DropdownMenuItem>View Invoices</DropdownMenuItem>
                          {sub.uiStatus !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to cancel this subscription?")) {
                                  cancelMutation.mutate(sub.companyId);
                                }
                              }}
                            >
                              Cancel Subscription
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
