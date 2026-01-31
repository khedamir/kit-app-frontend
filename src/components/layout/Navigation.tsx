import { NavLink } from "react-router-dom";
import { User, MessageSquare, LayoutDashboard, ShoppingBag, Home, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: ("student" | "admin")[];
}

// Все пункты навигации
const navItems: NavItem[] = [
  {
    to: "/home",
    label: "Главная",
    icon: Home,
    roles: ["student"],
  },
  {
    to: "/profile",
    label: "Профиль",
    icon: User,
    roles: ["student"],
  },
  {
    to: "/admin",
    label: "Панель",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    to: "/forum",
    label: "Форум",
    icon: MessageSquare,
  },
  {
    to: "/shop",
    label: "Магазин",
    icon: ShoppingBag,
    roles: ["student"],
  },
];

// Хук для фильтрации навигации по роли
export function useNavItems() {
  const { user } = useAuthStore();
  const role = user?.role;

  return navItems.filter((item) => {
    if (!item.roles) return true; // Доступно всем
    return role && item.roles.includes(role);
  });
}

// Десктопная навигация (горизонтальная, для хедера)
export function DesktopNav() {
  const items = useNavItems();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Мобильная навигация (внизу экрана)
export function BottomNav() {
  const items = useNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-colors",
                    isActive && "bg-primary/15"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

