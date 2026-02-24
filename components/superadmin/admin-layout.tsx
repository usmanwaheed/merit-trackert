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
import { ThemeToggle } from "@/components/theme-toggle";
import { useSuperadminLogout } from "@/lib/hooks/use-superadmin-auth";

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
  const pathname = usePathname();
  const logoutMutation = useSuperadminLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col">
        <div className="h-16 px-6 flex items-center gap-2 border-b border-border">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            SA
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Superadmin</p>
            <p className="font-semibold text-foreground">Merit Tracker</p>
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
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Need help?</p>
              <p className="text-xs text-muted-foreground">Contact support</p>
            </div>
            <Button variant="outline" size="sm">
              Support
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleLogout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border px-4 lg:px-6 flex items-center justify-between bg-card/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden" asChild>
              <Link href="/superadmin/dashboard">Menu</Link>
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">Superadmin Panel</p>
              <p className="font-semibold text-foreground">Merit Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 bg-muted/20 min-h-0">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
