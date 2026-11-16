import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * AppShell — the single premium header + page frame shared by BOTH the
 * Business portal and the Platform (super-admin) console. Extracting it is
 * what makes the two portals read as one product family: identical gradient
 * logo lockup, animated `layoutId` pill-nav, theme toggle, user dropdown,
 * mobile menu and ambient backdrop — differing only by `accent`.
 *
 * Props:
 *   accent        "business" (blue→purple) | "platform" (indigo→violet+rose)
 *   brandIcon     lucide icon component for the logo
 *   brandLabel    string shown next to the logo
 *   nav           [{ id, name, icon }] — already role-filtered by the caller
 *   activePage / onNavigate
 *   user          { name, email }
 *   roleBadge     { label, color } | null — colored chip in the dropdown
 *   menuItems     [{ label, icon, onClick, show }] extra dropdown actions
 *   onLogout, theme, toggleTheme
 *   showNotifications, onNotifications
 *   statusLabel   optional live-status text (platform console)
 */
// Each portal has ONE solid identity color (no gradients): business = blue
// (the app primary), platform = indigo. The wordmark, active nav pill and
// avatar all use that single color.
const ACCENTS = {
  business: {
    solid: "bg-primary",
    pillShadow: "shadow-primary/25",
    text: "text-primary",
    ambient: "",
    ring: "border-border",
    icon: "text-primary",
  },
  platform: {
    // Rose is the platform signature in LIGHT mode; indigo in dark (rose = light-only).
    solid: "bg-rose-500 dark:bg-indigo-600",
    pillShadow: "shadow-rose-500/25 dark:shadow-indigo-500/25",
    text: "text-rose-600 dark:text-indigo-400",
    ambient: "is-platform",
    ring: "border-rose-500/25 dark:border-indigo-500/25",
    icon: "text-rose-600 dark:text-indigo-400",
  },
};

const AppShell = ({
  accent = "business",
  brandIcon: BrandIcon,
  brandLabel,
  nav = [],
  activePage,
  onNavigate,
  user,
  roleBadge,
  menuItems = [],
  onLogout,
  theme,
  toggleTheme,
  showNotifications = false,
  onNotifications,
  notificationCount = 0,
  bellSlot = null,
  statusLabel,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const a = ACCENTS[accent] ?? ACCENTS.business;

  const initials = (user?.name || user?.email || "User")
    .split(/[\s@.]+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const go = (id) => {
    onNavigate?.(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className={cn("app-ambient", a.ambient)} aria-hidden="true" />

      <header className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        a.ring
      )}>
        <div className="container flex h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="app-sheen flex items-center rounded-full pr-1"
            >
              <span className={cn("grid place-items-center rounded-xl", a.icon)}>
                {BrandIcon && <BrandIcon className="h-7 w-7" />}
              </span>
              <span className={cn("ml-2 text-xl font-bold tracking-tight whitespace-nowrap", a.text)}>
                {brandLabel}
              </span>
            </motion.div>

            {statusLabel && (
              <span className="acc-emerald hidden lg:flex items-center gap-2 ml-3 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="app-live-dot h-2 w-2 rounded-full bg-emerald-500" />
                {statusLabel}
              </span>
            )}

            {nav.length > 0 && (
              <div className="hidden md:flex items-center gap-1 ml-4 rounded-full border border-border/60 bg-muted/40 p-1 shadow-sm backdrop-blur">
                {nav.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={cn(
                        "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                        isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={`nav-active-${accent}`}
                          className={cn("absolute inset-0 rounded-full shadow-md", item.color || a.solid, a.pillShadow)}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center">
                        {React.cloneElement(item.icon, { className: "h-[18px] w-[18px]" })}
                      </span>
                      <span className="relative z-10 whitespace-nowrap">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Either a fully custom bell (dropdown feed) or the simple count bell. */}
            {bellSlot}
            {!bellSlot && showNotifications && (
              <Button variant="ghost" size="icon" className="relative" onClick={onNotifications}
                aria-label={notificationCount > 0 ? `Notifications (${notificationCount} unread)` : "Notifications"}>
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge variant="default"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-border transition">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn("text-white text-xs font-semibold", a.solid)}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email || ""}</p>
                    {roleBadge && (
                      <span className={cn("inline-block w-fit px-2 py-0.5 rounded text-xs font-semibold text-white", roleBadge.color)}>
                        {roleBadge.label}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                {menuItems.filter((m) => m.show !== false).length > 0 && <DropdownMenuSeparator />}
                {menuItems.filter((m) => m.show !== false).map((m) => (
                  <DropdownMenuItem key={m.label} className="cursor-pointer" onClick={m.onClick}>
                    {m.icon && React.cloneElement(m.icon, { className: "mr-2 h-4 w-4" })}
                    <span>{m.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {nav.length > 0 && (
              <Button variant="ghost" size="icon" className="md:hidden"
                onClick={() => setIsMobileMenuOpen((v) => !v)}>
                <Menu className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && nav.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t overflow-hidden"
            >
              <div className="container py-4 space-y-2">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                {nav.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? cn("text-white shadow-md", item.color || a.solid, a.pillShadow)
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
};

export default AppShell;
