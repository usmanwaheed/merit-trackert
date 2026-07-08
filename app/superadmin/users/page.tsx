"use client"

import { useMemo, useState } from "react";
import { Search, MoreHorizontal, Mail, Shield, UserCheck, UserX } from "lucide-react";
import { AdminLayout } from "@/components/superadmin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/superadmin/stats-card";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/request";
import {
  useSuperadminUsers,
  useSuperadminUpdateUserRole,
  useSuperadminDeactivateUser,
  useSuperadminActivateUser,
  useSuperadminResetUserPassword,
  useSuperadminDeleteUser,
} from "@/lib/hooks";

interface ManagedUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
  avatar?: string;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success",
    invited: "bg-warning/10 text-warning",
    suspended: "bg-destructive/10 text-destructive",
  };
  return styles[status] || "bg-muted text-muted-foreground";
}

function getRoleBadge(role: string) {
  const normalized = role.toLowerCase();
  if (normalized.includes("owner") || normalized.includes("admin")) {
    return "bg-info/10 text-info";
  }
  return "bg-muted text-muted-foreground";
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'activate' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState<'owner' | 'admin' | 'member'>('member');
  const [newPassword, setNewPassword] = useState('');
  const { data } = useSuperadminUsers();
  const users = useMemo(() => data ?? [], [data]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const updateRoleMutation = useSuperadminUpdateUserRole();
  const deactivateUserMutation = useSuperadminDeactivateUser();
  const activateUserMutation = useSuperadminActivateUser();
  const resetPasswordMutation = useSuperadminResetUserPassword();
  const deleteUserMutation = useSuperadminDeleteUser();

  const openViewProfile = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openChangeRole = (user: ManagedUser) => {
    setSelectedUser(user);
    setNewRole(user.role.toLowerCase() as 'owner' | 'admin' | 'member');
    setIsChangeRoleOpen(true);
  };

  const openResetPassword = (user: ManagedUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordOpen(true);
  };

  const openConfirmAction = (user: ManagedUser, action: 'deactivate' | 'activate' | 'delete') => {
    setSelectedUser(user);
    setConfirmAction(action);
  };

  const closeDialogs = () => {
    setSelectedUser(null);
    setIsViewOpen(false);
    setIsChangeRoleOpen(false);
    setIsResetPasswordOpen(false);
    setConfirmAction(null);
    setNewPassword('');
  };

  const handleChangeRoleSubmit = async () => {
    if (!selectedUser) return;

    try {
      await updateRoleMutation.mutateAsync({ id: selectedUser.id, role: newRole });
      toast.success('User role updated successfully.');
      closeDialogs();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ id: selectedUser.id, password: newPassword });
      toast.success('Password reset successfully.');
      closeDialogs();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirmActionSubmit = async () => {
    if (!selectedUser || !confirmAction) return;

    try {
      if (confirmAction === 'deactivate') {
        await deactivateUserMutation.mutateAsync(selectedUser.id);
        toast.success('User suspended successfully.');
      } else if (confirmAction === 'activate') {
        await activateUserMutation.mutateAsync(selectedUser.id);
        toast.success('User reactivated successfully.');
      } else if (confirmAction === 'delete') {
        await deleteUserMutation.mutateAsync(selectedUser.id);
        toast.success('User deleted successfully.');
      }
      closeDialogs();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.company ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role.toLowerCase().includes(roleFilter);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const invitedUsers = users.filter((user) => user.status === "invited").length;
  const suspendedUsers = users.filter((user) => user.status === "suspended").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage all users across all companies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            icon={<UserCheck className="w-6 h-6" />}
            change="All registered users"
            changeType="positive"
          />
          <StatsCard
            title="Active Users"
            value={activeUsers.toLocaleString()}
            icon={<Shield className="w-6 h-6" />}
            change={`${totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0}% of total`}
            changeType="positive"
          />
          <StatsCard
            title="Pending Invites"
            value={invitedUsers.toLocaleString()}
            icon={<Mail className="w-6 h-6" />}
            change="Awaiting activation"
            changeType="neutral"
          />
          <StatsCard
            title="Suspended"
            value={suspendedUsers.toLocaleString()}
            icon={<UserX className="w-6 h-6" />}
            change="Restricted access"
            changeType="positive"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.company}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusBadge(user.status)}>
                        {user.status}
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
                          <DropdownMenuItem onClick={() => openViewProfile(user)}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openChangeRole(user)}>Change Role</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openResetPassword(user)}>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openConfirmAction(user, user.status === "suspended" ? "activate" : "deactivate")}>
                            {user.status === "suspended" ? "Reactivate" : "Suspend"} User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => openConfirmAction(user, 'delete')}>
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isViewOpen} onOpenChange={(open) => !open && setIsViewOpen(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Name</span>
                <span>{selectedUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email</span>
                <span>{selectedUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company</span>
                <span>{selectedUser?.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role</span>
                <span>{selectedUser?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status</span>
                <span>{selectedUser?.status}</span>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isChangeRoleOpen} onOpenChange={(open) => !open && setIsChangeRoleOpen(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Selected User</Label>
                <div className="p-3 bg-muted rounded-md">
                  {selectedUser?.name} ({selectedUser?.email})
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-select">New Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as 'owner' | 'admin' | 'member')}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsChangeRoleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangeRoleSubmit} disabled={updateRoleMutation.isLoading}>
                  Save Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetPasswordOpen} onOpenChange={(open) => !open && setIsResetPasswordOpen(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResetPasswordSubmit} disabled={resetPasswordMutation.isLoading}>
                  Reset Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction === 'delete'
                  ? 'Delete User'
                  : confirmAction === 'activate'
                  ? 'Reactivate User'
                  : 'Suspend User'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === 'delete'
                  ? 'This action will permanently delete the selected user account.'
                  : confirmAction === 'activate'
                  ? 'This will restore access for the selected user.'
                  : 'This will suspend the selected user and revoke access.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 text-sm">
              <p className="font-medium">{selectedUser?.name}</p>
              <p className="text-muted-foreground">{selectedUser?.email}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmAction(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className={confirmAction === 'delete' ? 'bg-destructive' : ''}
                onClick={handleConfirmActionSubmit}
              >
                {confirmAction === 'delete'
                  ? 'Delete'
                  : confirmAction === 'activate'
                  ? 'Reactivate'
                  : 'Suspend'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
