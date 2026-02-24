"use client"

import { useMemo } from "react";
import {
  Building2,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { AdminLayout } from "@/components/superadmin/admin-layout";
import { StatsCard } from "@/components/superadmin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSuperadminDashboardData } from "@/lib/hooks";

interface MetricsSummary {
  companies: number;
  users: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

interface Company {
  id: string;
  name: string;
  email: string;
  plan: string;
  users: number;
  maxUsers: number;
  status: "trial" | "active" | "expired" | "cancelled" | "suspended";
  createdAt: string;
}

interface Transaction {
  id: string;
  company: string;
  type: "payment" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
  description: string;
}

const fallbackRevenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
  { month: "Jul", revenue: 7000 },
];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseTransactionDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }
  return null;
}

export default function Dashboard() {
  const { data } = useSuperadminDashboardData();
  const metrics: MetricsSummary | null = data?.metrics ?? null;
  const companies: Company[] = data?.companies ?? [];
  const transactions: Transaction[] = data?.transactions ?? [];

  const revenueData = useMemo(() => {
    const totals = new Map<string, number>();

    transactions
      .filter((transaction) => transaction.type === "payment")
      .forEach((transaction) => {
        const parsedDate = parseTransactionDate(transaction.date);
        const monthLabel = parsedDate ? monthLabels[parsedDate.getMonth()] : "Unknown";
        totals.set(monthLabel, (totals.get(monthLabel) ?? 0) + Math.abs(transaction.amount));
      });

    if (totals.size === 0) {
      return fallbackRevenueData;
    }

    return Array.from(totals.entries()).map(([month, revenue]) => ({ month, revenue }));
  }, [transactions]);

  const planDistribution = useMemo(() => {
    const counts = companies.reduce<Record<string, number>>((acc, company) => {
      acc[company.plan] = (acc[company.plan] ?? 0) + 1;
      return acc;
    }, {});

    const total = companies.length || 1;
    return Object.entries(counts).map(([plan, count]) => ({
      plan,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [companies]);

  const recentCompanies = useMemo(() => {
    const sorted = [...companies].sort((a, b) => {
      const dateA = Date.parse(a.createdAt) || 0;
      const dateB = Date.parse(b.createdAt) || 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 5);
  }, [companies]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Companies"
            value={metrics ? metrics.companies.toLocaleString() : "—"}
            icon={<Building2 className="w-6 h-6" />}
            change="+12% from last month"
            changeType="positive"
          />
          <StatsCard
            title="Total Users"
            value={metrics ? metrics.users.toLocaleString() : "—"}
            icon={<Users className="w-6 h-6" />}
            change="+18% from last month"
            changeType="positive"
          />
          <StatsCard
            title="Active Subscriptions"
            value={metrics ? metrics.activeSubscriptions.toLocaleString() : "—"}
            icon={<CreditCard className="w-6 h-6" />}
            change="+5% from last month"
            changeType="positive"
          />
          <StatsCard
            title="Monthly Revenue"
            value={metrics ? `$${metrics.monthlyRevenue.toLocaleString()}` : "—"}
            icon={<DollarSign className="w-6 h-6" />}
            change="+22% from last month"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +22%
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.plan} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{plan.plan}</span>
                    <span className="text-sm font-semibold">{plan.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${plan.percentage}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Companies</CardTitle>
            <a href="/superadmin/companies" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </a>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCompanies.map((company) => (
                    <tr key={company.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {company.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{company.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{company.plan}</td>
                      <td className="py-3 px-4 text-muted-foreground">{company.users}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={company.status === "active" ? "default" : "secondary"}
                          className={
                            company.status === "active"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-warning/10 text-warning hover:bg-warning/20"
                          }
                        >
                          {company.status}
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
