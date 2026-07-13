"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, BarChart3, Users, Receipt,
  FileText, Settings, Database, ClipboardList, BookOpen, LogOut,
  ChevronLeft, ChevronRight, UserCog,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app.store";
import { Button } from "@/shared/components/ui/button";
import type { UserRole } from "@/features/auth/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[]; // undefined = all roles can see
};

const NAV: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
  { href: "/billing",    label: "Billing POS", icon: Receipt },
  { href: "/products",   label: "Products",    icon: Package,         roles: ["admin", "manager"] },
  { href: "/categories", label: "Categories",  icon: Tag,             roles: ["admin"] },
  { href: "/inventory",  label: "Inventory",   icon: BarChart3,       roles: ["admin", "manager"] },
  { href: "/customers",  label: "Customers",   icon: Users },
  { href: "/khata",      label: "Khata/Udhar", icon: BookOpen },
  { href: "/reports",    label: "Reports",     icon: FileText,        roles: ["admin", "manager"] },
  { href: "/audit",      label: "Audit Logs",  icon: ClipboardList,   roles: ["admin"] },
  { href: "/backup",     label: "Backup",      icon: Database,        roles: ["admin"] },
  { href: "/settings",   label: "Settings",    icon: Settings,        roles: ["admin"] },
  { href: "/users",      label: "Users",       icon: UserCog,         roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user, setUser } = useAppStore();

  const role = user?.role as UserRole | undefined;
  const visibleNav = NAV.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <aside className={cn("flex flex-col h-full bg-card border-r transition-all duration-300 shrink-0", sidebarOpen ? "w-56" : "w-14")}>
      <div className="flex items-center justify-between px-3 py-4 border-b">
        {sidebarOpen && <span className="font-bold text-lg text-primary truncate">KiranaPOS</span>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto shrink-0">
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1.5">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}>
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        {sidebarOpen && user && (
          <p className="text-xs text-muted-foreground truncate px-2 pb-1">
            {user.username} · <span className="capitalize">{user.role}</span>
          </p>
        )}
        <Button variant="ghost" size={sidebarOpen ? "sm" : "icon"} className="w-full justify-start gap-3 text-muted-foreground" onClick={() => setUser(null)}>
          <LogOut className="h-4 w-4 shrink-0" />{sidebarOpen && "Sign out"}
        </Button>
      </div>
    </aside>
  );
}