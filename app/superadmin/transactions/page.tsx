"use client"

import { useMemo, useState } from "react";
import { Search, Download, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Receipt, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/superadmin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useSuperadminTransactions } from "@/lib/hooks";

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

function parseTransactionDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = Date.parse(normalized);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }
  return null;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    completed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-destructive/10 text-destructive",
  };
  return styles[status] || "bg-muted text-muted-foreground";
}

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useSuperadminTransactions();
  const transactions = data ?? [];
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      const matchesStatus = statusFilter === "all" || txn.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const parsedDate = parseTransactionDate(txn.date);
        if (parsedDate) {
          const now = new Date();
          const diffDays = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
          if (dateFilter === "7d") matchesDate = diffDays <= 7;
          if (dateFilter === "30d") matchesDate = diffDays <= 30;
          if (dateFilter === "90d") matchesDate = diffDays <= 90;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [dateFilter, searchQuery, statusFilter, transactions, typeFilter]);

  const totalRevenue = transactions
    .filter((txn) => txn.type === "payment" && txn.status === "completed")
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  const successfulPayments = transactions.filter((txn) => txn.type === "payment" && txn.status === "completed").length;
  const refundTotal = transactions
    .filter((txn) => txn.type === "refund")
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  const failedPayments = transactions.filter((txn) => txn.status === "failed").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">View and manage all payment transactions.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6" />}
            change="Completed payments"
            changeType="positive"
          />
          <StatsCard
            title="Successful Payments"
            value={successfulPayments.toLocaleString()}
            icon={<TrendingUp className="w-6 h-6" />}
            change="Completed transactions"
            changeType="positive"
          />
          <StatsCard
            title="Refunds"
            value={`$${refundTotal.toLocaleString()}`}
            icon={<Receipt className="w-6 h-6" />}
            change="Total refunds"
            changeType="neutral"
          />
          <StatsCard
            title="Failed Payments"
            value={failedPayments.toLocaleString()}
            icon={<AlertCircle className="w-6 h-6" />}
            change="Needs review"
            changeType="negative"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell className="font-medium">{txn.company}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{txn.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {txn.type === "payment" ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                        <span
                          className={
                            txn.type === "payment"
                              ? "text-success font-medium"
                              : "text-destructive font-medium"
                          }
                        >
                          ${Math.abs(txn.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{txn.method}</TableCell>
                    <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(txn.status)}>
                        {txn.status}
                      </Badge>
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
