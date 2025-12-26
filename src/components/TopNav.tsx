import { useEffect, useState } from "react";
import { Bell, User, LogOut, Menu, MoreVertical } from "lucide-react";
import { Badge } from "./ui/badge";

interface TopNavProps {
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

// Small hook to detect desktop vs mobile
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

export function TopNav({ onLogout, onToggleSidebar }: TopNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isDesktop = useIsDesktop(); 

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        
        {!isDesktop && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="font-medium">Admin Dashboard</h2>
      </div>

      {/* RIGHT SIDE */}
      {isDesktop ? (
        // 👉 DESKTOP VIEW (md / lg)
        <div className="p-2 hover:bg-muted justify-end flex rounded-lg">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 cursor-pointer" />
            <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center p-0 text-xs">
              3
            </Badge>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@epress.sa</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full cursor-pointer flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMobileMenu && (
            <div className="fixed right-2 top-16 w-56 bg-card border border-border rounded-lg shadow-lg z-50">

              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">
                      admin@crcl.sa
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px]">
                      3
                    </Badge>
                  </div>
                  <span className="text-sm">Notifications</span>
                </button>

                <button
                  onClick={() => {
                    onLogout?.();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
