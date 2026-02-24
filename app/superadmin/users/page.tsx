"use client"

import { useMemo, useState } from "react";
import { Search, Plus, MoreHorizontal, Mail, Shield, UserCheck, UserX } from "lucide-react";
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
import { StatsCard } from "@/components/superadmin/stats-card";
import { useSuperadminUsers } from "@/lib/hooks";

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
  const { data } = useSuperadminUsers();
  const users = data ?? [];
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.toLowerCase());
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
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem>
                            {user.status === "suspended" ? "Reactivate" : "Suspend"} User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
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
