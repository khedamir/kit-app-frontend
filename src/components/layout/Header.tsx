import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, GraduationCap, Bell, Sun, Moon, Check, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useMyNotifications,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DesktopNav } from "./Navigation";

export function Header() {
  const { user, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [hoveredReadButtonId, setHoveredReadButtonId] = useState<number | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const { theme, toggleTheme } = useThemeStore();
  const { data: notificationsData, isLoading: notificationsLoading } = useMyNotifications(1, 20);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";
  const unreadCount = notificationsData?.unread_count ?? 0;

  const formatCreatedAt = (value: string | null) => {
    if (!value) return "";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  useEffect(() => {
    if (!showNotificationsPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotificationsPopover]);

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
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              title={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title="Уведомления"
                onClick={() => setShowNotificationsPopover((prev) => !prev)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotificationsPopover && (
                <div className="fixed left-2 right-2 top-[4.5rem] z-50 rounded-xl border bg-background shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-[360px]">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <p className="text-sm font-medium">Уведомления</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                    >
                      Прочитано
                    </Button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1 sm:max-h-[380px]">
                    {notificationsLoading && (
                      <p className="text-xs text-muted-foreground px-2 py-1">Загрузка...</p>
                    )}

                    {!notificationsLoading && (notificationsData?.items?.length ?? 0) === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1">Пока нет уведомлений.</p>
                    )}

                    {!notificationsLoading &&
                      (notificationsData?.items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-md px-2 py-2 transition-colors hover:bg-muted/60 ${
                            item.is_read
                              ? "border border-transparent"
                              : "bg-primary/10 border border-primary/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                {!item.is_read && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                                )}
                                <p className={`text-sm leading-5 break-words ${item.is_read ? "" : "font-semibold"}`}>
                                  {item.title}
                                </p>
                              </div>
                              {item.body && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3 sm:line-clamp-2 break-words">
                                  {item.body}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {formatCreatedAt(item.created_at)}
                              </span>
                              {!item.is_read && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[11px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onMouseEnter={() => setHoveredReadButtonId(item.id)}
                                  onMouseLeave={() => setHoveredReadButtonId(null)}
                                  onClick={() => markAsReadMutation.mutate(item.id)}
                                >
                                  {hoveredReadButtonId === item.id ? (
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Check className="h-3 w-3 mr-1" />
                                  )}
                                  Прочитано
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

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
