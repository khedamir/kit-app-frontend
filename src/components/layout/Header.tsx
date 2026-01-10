import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, GraduationCap, Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DesktopNav } from "./Navigation";

export function Header() {
  const { user, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">
                KIT Platform
              </span>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav />
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              title="Уведомления"
              disabled
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge - uncomment when needed
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                3
              </span>
              */}
            </Button>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent onClose={() => setShowLogoutDialog(false)}>
          <DialogHeader>
            <DialogTitle>Выход из аккаунта</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите выйти из своего аккаунта?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
