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
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/request";
import {
  useCreateSuperadminCompany,
  useSuperadminCompanies,
  useSuperadminPlans,
  useUpdateSuperadminCompany,
} from "@/lib/hooks";
import { useRouter } from "next/navigation";

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
  const updateCompanyMutation = useUpdateSuperadminCompany();
  const router = useRouter();

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
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
        adminEmail: companyEmail,
        plan: (selectedPlan?.name ?? "starter").toLowerCase(),
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

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyName(company.name);
    setCompanyEmail(company.email);
    setPlanName(company.plan);
    setIsEditOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    try {
      await updateCompanyMutation.mutateAsync({
        id: editingCompany.id,
        name: companyName,
        email: companyEmail,
        plan: planName ?? editingCompany.plan,
      });
      setIsEditOpen(false);
      setEditingCompany(null);
      toast.success("Company updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSuspendCompany = (company: Company) => {
    setEditingCompany(company);
    setIsSuspendOpen(true);
  };

  const confirmSuspendCompany = async () => {
    if (!editingCompany) return;

    const isSuspended = editingCompany.status === "suspended";
    try {
      await updateCompanyMutation.mutateAsync({
        id: editingCompany.id,
        status: isSuspended ? "active" : "suspended",
      });
      setIsSuspendOpen(false);
      setEditingCompany(null);
      toast.success(`Company ${isSuspended ? "activated" : "suspended"} successfully.`);
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
                          {plan.name} ({plan.userLimit} users)
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
                    variant="outline"
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
                      <DropdownMenuItem onClick={() => {
                        setEditingCompany(company);
                        setIsViewOpen(true);
                      }}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCompany(company)}>Edit Company</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/superadmin/subscriptions?companyId=${company.id}`)}>
                        Manage Subscription
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={company.status === "suspended" ? "text-success" : "text-destructive"}
                        onClick={() => handleSuspendCompany(company)}
                      >
                        {company.status === "suspended" ? "Activate Company" : "Suspend Company"}
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
                  Joined {formatDate(company.createdAt)}
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

        {/* Edit Company Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input
                  id="edit-company-name"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-email">Admin Email</Label>
                <Input
                  id="edit-company-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-plan">Select Plan</Label>
                <Select value={planName ?? undefined} onValueChange={setPlanName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.name}>
                        {plan.name} ({plan.userLimit} users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground"
                  onClick={handleUpdateCompany}
                  disabled={updateCompanyMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Company Name</span>
                <span>{editingCompany?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Admin Email</span>
                <span>{editingCompany?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Current Plan</span>
                <span>{editingCompany?.plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Status</span>
                <Badge variant="secondary" className="capitalize">{editingCompany?.status}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Users</span>
                <span>{editingCompany?.users} / {editingCompany?.maxUsers}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Joined</span>
                <span>{formatDate(editingCompany?.createdAt)}</span>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Suspend/Activate Alert Dialog */}
        <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingCompany?.status === "suspended" ? "Activate" : "Suspend"} Company?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {editingCompany?.status === "suspended" ? "activate" : "suspend"} <strong>{editingCompany?.name}</strong>?
                {editingCompany?.status !== "suspended" && " This will restrict their access to the platform."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditingCompany(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={editingCompany?.status === "suspended" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                onClick={confirmSuspendCompany}
              >
                Confirm {editingCompany?.status === "suspended" ? "Activation" : "Suspension"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
