"use client"

import { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, Building2, Users, Mail, Calendar } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/request";
import {
  useCreateSuperadminCompany,
  useSuperadminCompanies,
  useSuperadminPlans,
} from "@/lib/hooks";

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

interface Plan {
  id: string;
  name: string;
  tier: "starter" | "pro" | "enterprise";
  pricePerMonth: number;
  pricePerYear: number;
  description: string;
  maxUsers: number;
  features: string[];
}

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [planName, setPlanName] = useState<string | null>(null);
  const { data: companiesData } = useSuperadminCompanies();
  const { data: plansData } = useSuperadminPlans();
  const createCompanyMutation = useCreateSuperadminCompany();
  const companies = companiesData ?? [];
  const plans = plansData ?? [];

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "all" || company.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || company.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [companies, planFilter, searchQuery, statusFilter]);

  const createCompany = async () => {
    if (!companyName || !companyEmail) {
      toast.error("Company name and admin email are required.");
      return;
    }

    const selectedPlan = plans.find((plan) => plan.name === planName) ?? plans[0];

    try {
      const newCompany = await createCompanyMutation.mutateAsync({
        name: companyName,
        email: companyEmail,
        plan: selectedPlan?.name ?? "Starter",
        maxUsers: selectedPlan?.maxUsers,
      });
      setIsCreateOpen(false);
      setCompanyName("");
      setCompanyEmail("");
      setPlanName(null);
      toast.success(`Added ${newCompany.name}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Companies</h1>
            <p className="text-muted-foreground mt-1">
              Manage all registered companies and their subscriptions.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Admin Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="admin@company.com"
                    value={companyEmail}
                    onChange={(event) => setCompanyEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-plan">Select Plan</Label>
                  <Select value={planName ?? undefined} onValueChange={setPlanName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.name}>
                          {plan.name} ({plan.maxUsers} users)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="gradient-primary text-primary-foreground"
                    onClick={createCompany}
                    disabled={createCompanyMutation.isPending}
                  >
                    Create Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
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
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          company.status === "active"
                            ? "bg-success/10 text-success mt-1"
                            : company.status === "trial"
                              ? "bg-warning/10 text-warning mt-1"
                              : "bg-destructive/10 text-destructive mt-1"
                        }
                      >
                        {company.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Company</DropdownMenuItem>
                      <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Suspend Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {company.users} / {company.maxUsers} users
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Joined {company.createdAt}
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <Badge variant="outline">{company.plan}</Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>User capacity</span>
                      <span>{Math.round((company.users / company.maxUsers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${(company.users / company.maxUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
