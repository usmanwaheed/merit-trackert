"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Receipt,
  Settings,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle";
import { useSuperadminLogout } from "@/lib/hooks/use-superadmin-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePlatformSettings } from "@/lib/hooks/use-platform-settings";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { title: "Companies", href: "/superadmin/companies", icon: Building2 },
  { title: "Users", href: "/superadmin/users", icon: Users },
  { title: "Plans", href: "/superadmin/plans", icon: BookOpenCheck },
  { title: "Subscriptions", href: "/superadmin/subscriptions", icon: CreditCard },
  { title: "Transactions", href: "/superadmin/transactions", icon: Receipt },
  { title: "Analytics", href: "/superadmin/analysis", icon: BarChart3 },
  { title: "Settings", href: "/superadmin/settings", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: settings } = usePlatformSettings();
  const pathname = usePathname();
  const logoutMutation = useSuperadminLogout();
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="h-16 px-6 flex items-center gap-2 border-b border-border">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold overflow-hidden">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              settings?.platformName?.charAt(0) || "S"
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{settings?.platformName || "Merit Tracker"}</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href} className="block">
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover-lift",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className={`flex items-center justify-between ${collapsed ? "flex-col" : ""} gap-2`}>
            <ThemeToggle />
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            {collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="h-9 w-9 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-6 bg-muted/20 min-h-0">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
