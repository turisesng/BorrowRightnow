/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { HealthAssessment } from './components/HealthAssessment';
import { EligibilityChecker } from './components/EligibilityChecker';
import { RecommendationEngine } from './components/RecommendationEngine';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import { DebtManagement } from './components/DebtManagement';
import { ScamDetector } from './components/ScamDetector';
import { LoanDashboard } from './components/LoanDashboard';
import { EmergencyFinder } from './components/EmergencyFinder';
import { ComplianceHub } from './components/ComplianceHub';
import { CustomerSupport } from './components/CustomerSupport';
import { AdminDashboard } from './components/AdminDashboard';
import { DocumentVerification } from './components/DocumentVerification';
import { LoanInterestCalculatorModal } from './components/LoanInterestCalculatorModal';
import { ProfileScreen } from './components/ProfileScreen';
import {
  Sparkles, ShieldCheck, Activity, Award, Scale, HelpCircle,
  Bell, User, ShieldX, Key, Menu, X, Landmark, HeartHandshake, LogOut, Check, Edit, FileText, Calculator
} from 'lucide-react';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    setIsAdmin,
    notifications,
    profile,
    setProfile,
    addAuditLog,
    supabaseUser,
    signOutSupabase
  } = useApp();

  // If there is no active session, redirect to the real Supabase AuthScreen
  if (!supabaseUser) {
    return <AuthScreen />;
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['user', 'admin'] },
    { id: 'health', label: 'Health Assessment', icon: Award, roles: ['user'] },
    { id: 'eligibility', label: 'Eligibility Checker', icon: ShieldCheck, roles: ['user'] },
    { id: 'verification', label: 'Document Verifier', icon: FileText, roles: ['user'] },
    { id: 'recommendations', label: 'Lending Catalog', icon: Landmark, roles: ['user'] },
    { id: 'advisor', label: 'AI Advisor Chat', icon: Sparkles, roles: ['user'] },
    { id: 'debt', label: 'Debt Optimizer', icon: Scale, roles: ['user'] },
    { id: 'scam', label: 'Scam Detector', icon: ShieldX, roles: ['user'] },
    { id: 'emergency', label: 'Emergency Finder', icon: HeartHandshake, roles: ['user'] },
    { id: 'compliance', label: 'Compliance Hub', icon: Landmark, roles: ['user'] },
    { id: 'support', label: 'Support Escalations', icon: HelpCircle, roles: ['user'] },
    { id: 'profile', label: 'Profile & Settings', icon: User, roles: ['user', 'admin'] },
    { id: 'admin', label: 'Admin Operations', icon: Key, roles: ['admin'] }
  ];

  const currentNav = navItems.find(item => item.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <LoanDashboard />;
      case 'health':
        return <HealthAssessment />;
      case 'eligibility':
        return <EligibilityChecker />;
      case 'verification':
        return <DocumentVerification />;
      case 'recommendations':
        return <RecommendationEngine />;
      case 'advisor':
        return <FinancialAdvisor />;
      case 'debt':
        return <DebtManagement />;
      case 'scam':
        return <ScamDetector />;
      case 'emergency':
        return <EmergencyFinder />;
      case 'compliance':
        return <ComplianceHub />;
      case 'support':
        return <CustomerSupport />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LoanDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex transition-all duration-300">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-850 h-screen sticky top-0 flex-shrink-0 justify-between">
        <div className="space-y-6 py-6">
          {/* Logo Brand */}
          <div className="px-6 flex items-center gap-2.5">
            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20">
              BR
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">BorrowRight AI</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Lending Advisory</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {navItems
              .filter(item => item.roles.includes(isAdmin ? 'admin' : 'user'))
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    id={`nav-btn-${item.id}`}
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                  >
                    <Icon className="h-4 w-4" /> {item.label}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-850 space-y-3">
          <div className="flex items-center gap-2 px-2">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover" 
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                {profile.fullName ? profile.fullName.slice(0, 2) : 'U'}
              </div>
            )}
            <div className="truncate">
              <span className="text-xs font-bold block truncate">{profile.fullName || 'No Name Set'}</span>
              <span className="text-[10px] text-slate-400 block truncate">{profile.email}</span>
            </div>
          </div>
          <button
            id="edit-profile-trigger"
            onClick={() => setActiveTab('profile')}
            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 text-[10px] py-1.5 rounded-lg font-bold border border-slate-100 dark:border-slate-850 cursor-pointer flex items-center justify-center gap-1"
          >
            <Edit className="h-3 w-3" /> Update Profile
          </button>
          <button
            id="sidebar-logout-btn"
            onClick={signOutSupabase}
            className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] py-1.5 rounded-lg font-bold border border-rose-100/55 dark:border-rose-900/20 cursor-pointer flex items-center justify-center gap-1"
          >
            <LogOut className="h-3 w-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu trigger */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-bold tracking-tight text-slate-500 uppercase hidden md:block">
              Advisory Workspace / <span className="text-slate-800 dark:text-slate-200">{currentNav?.label}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin toggle switch */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
              <button
                id="role-switch-user"
                onClick={() => {
                  setIsAdmin(false);
                  setActiveTab('dashboard');
                }}
                className={`py-1 px-3.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${!isAdmin ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-400'}`}
              >
                USER
              </button>
              <button
                id="role-switch-admin"
                onClick={() => {
                  setIsAdmin(true);
                  setActiveTab('admin');
                }}
                className={`py-1 px-3.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${isAdmin ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-400'}`}
              >
                ADMIN
              </button>
            </div>

            <ThemeToggle />

            {/* Standalone Mini-Calculator Trigger */}
            <button
              id="global-calculator-trigger-btn"
              onClick={() => setShowCalculator(true)}
              className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl cursor-pointer relative flex items-center justify-center gap-1.5 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              title="Open BorrowRight Interest Calculator"
            >
              <Calculator className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 hidden sm:inline uppercase tracking-wider">Calculator</span>
            </button>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                id="notification-center-trigger"
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl cursor-pointer relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Dropdown list of notifications */}
              {showNotificationCenter && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg p-4 space-y-3 z-50 animate-slideUp">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Notification Logs ({notifications.length})</span>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                          {notif}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 text-center py-4">No active notification alerts.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Main Workspace stage */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* 3. Mobile Navigation Menu Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex">
          <aside className="w-64 bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between animate-slideRight relative border-r border-slate-100 dark:border-slate-800">
            <button
              id="close-mobile-menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                  BR
                </div>
                <span className="font-extrabold text-sm tracking-tight">BorrowRight AI</span>
              </div>

              <nav className="space-y-1">
                {navItems
                  .filter(item => item.roles.includes(isAdmin ? 'admin' : 'user'))
                  .map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        id={`mob-nav-${item.id}`}
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-600' : 'text-slate-500'}`}
                      >
                        <Icon className="h-4 w-4" /> {item.label}
                      </button>
                    );
                  })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* 5. Standalone BorrowRight Mini-Calculator Modal */}
      <LoanInterestCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </div>
  );
}
