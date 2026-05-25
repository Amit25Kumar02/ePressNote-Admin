import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { Dashboard } from "./components/Dashboard";
import UsersManagement from "./components/UsersManagement";
import AdvertisementsManagement from "./components/BusinessesManagement";
import NewspapersPage from "./components/NewspaperManagement";
import CategoriesPage from "./components/CategorysManagement";
import {PressNoteManagement} from "./components/PressNoteManagement";
import {ContactManagement} from "./components/ContactManagement";
import MediaOrganizations from "./components/InviteCodes";
import OfferManagement from "./components/offerManagement";
import PricingPanel from "./components/PricingManagement";
import MediaPartners from "./components/MediaPartners";
import RolesManagement from "./components/RolesManagement";


export default function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'true');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('activeSection');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveSection("dashboard");
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "users": return <UsersManagement />;
      case "businesses": return <AdvertisementsManagement />;
      case "newspaper": return <NewspapersPage />;
      case "category": return <CategoriesPage />;
      case "pressnote": return <PressNoteManagement />;
      case "contact": return <ContactManagement />;
      case "media": return <MediaOrganizations />;
      case "offer": return <OfferManagement />;
      case "price": return <PricingPanel />;
      case "media-partners": return <MediaPartners />;
      case "roles": return <RolesManagement />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup
        onSignup={handleLogin}
        onShowLogin={() => setShowSignup(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowSignup={() => setShowSignup(true)}
      />
    );
  }


  return (
    <div className={`flex min-h-screen bg-background text-foreground ${isMobile && sidebarOpen ? 'overflow-hidden' : ''}`}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section);
          localStorage.setItem('activeSection', section);
          if (isMobile) {
            setSidebarOpen(false);
            localStorage.setItem('sidebarOpen', 'false');
          }
        }}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isMobile={isMobile}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}>
        <TopNav
          onLogout={handleLogout}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        <main className="p-6 md:p-8 overflow-x-hidden h-[calc(100vh-4rem)] overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
