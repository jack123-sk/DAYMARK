import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import { NotificationItem } from './types';

// Layout Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';

// Public Views
import { LandingPage } from './views/LandingPage';
import { FeaturesPage } from './views/FeaturesPage';
import { PricingPage } from './views/PricingPage';
import { UseCasesPage } from './views/UseCasesPage';
import { LoginPage } from './views/LoginPage';
import { SignUpPage } from './views/SignUpPage';
import { ForgotPasswordPage } from './views/ForgotPasswordPage';
import { PrivacyPage } from './views/PrivacyPage';
import { TermsPage } from './views/TermsPage';

// Workspace App Views
import { OnboardingWizard } from './views/OnboardingWizard';
import { DashboardView } from './views/DashboardView';
import { OpportunityEngineView } from './views/OpportunityEngineView';
import { BusinessBuilderView } from './views/BusinessBuilderView';
import { WorkflowAutomationView } from './views/WorkflowAutomationView';
import { CrmView } from './views/CrmView';
import { AiAgentsView } from './views/AiAgentsView';
import { GlobalConnectView } from './views/GlobalConnectView';
import { RevenueIntelligenceView } from './views/RevenueIntelligenceView';
import { MarketplaceView } from './views/MarketplaceView';
import { NotificationsView } from './views/NotificationsView';
import { BillingView } from './views/BillingView';
import { TeamView } from './views/TeamView';
import { IntegrationsView } from './views/IntegrationsView';
import { AuditLogsView } from './views/AuditLogsView';
import { ProfileView } from './views/ProfileView';
import { HelpView } from './views/HelpView';

const MainRouter: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Sync navigation with browser history
  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Poll notifications & approval counters when authenticated
  useEffect(() => {
    if (token) {
      const loadAlerts = async () => {
        try {
          const [nRes, eRes] = await Promise.all([
            api.getNotifications(),
            api.getExecutions()
          ]);
          setNotifications(nRes.notifications || []);
          const pending = (eRes.executions || []).filter((e: any) => e.status === 'waiting_approval');
          setPendingApprovalsCount(pending.length);
        } catch {}
      };
      loadAlerts();
      const interval = setInterval(loadAlerts, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING DAYMARK OS...</span>
        </div>
      </div>
    );
  }

  // Public View Routing
  const isPublicRoute = [
    '/',
    '/features',
    '/pricing',
    '/use-cases',
    '/login',
    '/signup',
    '/forgot-password',
    '/privacy',
    '/terms'
  ].includes(currentRoute);

  if (isPublicRoute && !token) {
    switch (currentRoute) {
      case '/features':
        return <FeaturesPage onNavigate={navigate} />;
      case '/pricing':
        return <PricingPage onNavigate={navigate} />;
      case '/use-cases':
        return <UseCasesPage onNavigate={navigate} />;
      case '/login':
        return <LoginPage onNavigate={navigate} />;
      case '/signup':
        return <SignUpPage onNavigate={navigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />;
      case '/privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case '/terms':
        return <TermsPage onNavigate={navigate} />;
      case '/':
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  }

  // If user visits public route while already logged in, allow them to view or jump to app
  if (isPublicRoute && token) {
    if (currentRoute === '/login' || currentRoute === '/signup') {
      navigate('/app/dashboard');
      return null;
    }
    switch (currentRoute) {
      case '/features':
        return <FeaturesPage onNavigate={navigate} />;
      case '/pricing':
        return <PricingPage onNavigate={navigate} />;
      case '/use-cases':
        return <UseCasesPage onNavigate={navigate} />;
      case '/privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case '/terms':
        return <TermsPage onNavigate={navigate} />;
      case '/':
        return <LandingPage onNavigate={navigate} />;
    }
  }

  // If user tries to access protected app route without token, redirect to login
  if (!token) {
    return <LoginPage onNavigate={navigate} />;
  }

  // Onboarding Wizard View
  if (currentRoute === '/onboarding') {
    return <OnboardingWizard onNavigate={navigate} />;
  }

  // Authenticated Application Shell (Sidebar + Top Bar + View Canvas)
  return (
    <div className="min-h-screen bg-[#070b14] flex text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={navigate} 
        pendingApprovalsCount={pendingApprovalsCount} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onNavigate={navigate}
        />

        <main className="flex-1 overflow-y-auto">
          {currentRoute === '/app/dashboard' && <DashboardView onNavigate={navigate} />}
          {currentRoute === '/app/opportunities' && <OpportunityEngineView />}
          {currentRoute === '/app/builder' && <BusinessBuilderView />}
          {currentRoute === '/app/workflows' && <WorkflowAutomationView />}
          {currentRoute === '/app/crm' && <CrmView />}
          {currentRoute === '/app/agents' && <AiAgentsView />}
          {currentRoute === '/app/connect' && <GlobalConnectView />}
          {currentRoute === '/app/revenue' && <RevenueIntelligenceView />}
          {currentRoute === '/app/marketplace' && <MarketplaceView />}
          {currentRoute === '/app/notifications' && <NotificationsView onNavigate={navigate} />}
          {currentRoute === '/app/billing' && <BillingView />}
          {currentRoute === '/app/team' && <TeamView />}
          {currentRoute === '/app/integrations' && <IntegrationsView />}
          {currentRoute === '/app/audit-logs' && <AuditLogsView />}
          {currentRoute === '/app/profile' && <ProfileView />}
          {currentRoute === '/app/help' && <HelpView />}

          {/* Fallback for unmapped /app routes */}
          {!currentRoute.startsWith('/app/') && (
            <DashboardView onNavigate={navigate} />
          )}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}

export default App;
