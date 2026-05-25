"use client";

import {
  Users,
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Megaphone,
  MessageCircle,
  FileText,
  FolderOpen,
  BadgePercent,
  IndianRupee,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle"; 

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ activeSection, onNavigate, isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = user?.role === "Manager";

  const allNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "businesses", label: "Advertisements", icon: Megaphone },
    { id: "newspaper", label: "Newspaper", icon: Newspaper },
    { id: "category", label: "Category", icon: FolderTree },
    { id: "pressnote", label: "PressNotes", icon: FileText },
    { id: "contact", label: "Contact Us", icon: MessageCircle },
    { id: "media", label: "Media", icon: FolderOpen },
    { id: "offer", label: "Offers", icon: BadgePercent },
    { id: "price", label: "Pricing", icon: IndianRupee },
    { id: "media-partners", label: "Media Partners", icon: Handshake },
    { id: "roles", label: "Roles", icon: ShieldCheck },
  ];

  const managerNavItems = [
    { id: "businesses", label: "Advertisements", icon: Megaphone },
    { id: "newspaper", label: "Newspaper", icon: Newspaper },
    { id: "category", label: "Category", icon: FolderTree },
  ];

  const navItems = isManager ? managerNavItems : allNavItems;

  return (
    <div
      className={`
        w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0
        flex flex-col transition-all duration-300 z-50
        ${isOpen ? "block" : (isMobile ? "hidden" : "block")}
        ${!isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : ""}
        ${!isMobile ? "md:translate-x-0" : ""}
      `}
    >
      <div className="px-2 py-2 border-b border-sidebar-border flex items-center justify-between">
        <h1 className="sidebar-logo" />
        {isMobile && (
          <button
            onClick={() => onClose && onClose()}
            className="p-2 hover:bg-sidebar-accent rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2 mb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-sm transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* <ThemeToggle /> */}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">

        <p className="text-xs text-muted-foreground">© 2025 ePress Note</p>
      </div>
    </div>
  );
}
