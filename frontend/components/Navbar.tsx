'use client';

import React from 'react';
import { ClipboardList, LogOut, User } from 'lucide-react';

interface NavbarProps {
  userEmail?: string | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userEmail, onSignOut }) => {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-sky-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900">TaskFlow</h1>
            <p className="text-[11px] text-sky-500 font-semibold uppercase tracking-wide">
              Productivity Dashboard
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100">
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">
                {initial}
              </div>
              <span className="text-xs font-medium text-gray-700 max-w-[180px] truncate">
                {userEmail}
              </span>
            </div>
          )}

          <button
            id="signout-btn"
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-150"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
