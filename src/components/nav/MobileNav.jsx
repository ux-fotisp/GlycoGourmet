import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isRecipesActive =
    activePath === '/recipes' ||
    activePath === '/my-recipes' ||
    activePath.startsWith('/recipe/');

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden w-full sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm h-16 flex justify-between items-center px-4">
        <Link to="/">
          <h1 className="font-display text-lg text-primary tracking-tight font-bold">
            GlycoGourmet Admin
          </h1>
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            className="material-symbols-outlined text-primary p-2 min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            aria-label="Notifications"
          >
            notifications
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
            className="material-symbols-outlined text-tertiary p-2 min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
          >
            logout
          </button>
        </div>
      </header>

      {/* Mobile Bottom Quick Sheet for Recipes */}
      {isSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full bg-surface-container-lowest rounded-t-2xl p-5 border-t border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">restaurant_menu</span>
                Recipes Discovery & Management
              </h3>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close recipes menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <Link
                to="/recipes"
                onClick={() => setIsSheetOpen(false)}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-xs border transition-colors cursor-pointer ${
                  activePath === '/recipes' || activePath === '/'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  <span>All Recipes</span>
                </div>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>

              <Link
                to="/my-recipes"
                onClick={() => setIsSheetOpen(false)}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-xs border transition-colors cursor-pointer ${
                  activePath === '/my-recipes'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  <span>My Recipes</span>
                </div>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-surface border-t border-outline-variant shadow-[0_-4px_20px_rgba(45,49,48,0.05)] h-20 pb-safe px-2 flex justify-around items-center">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-3 py-1 transition-all ${
            activePath === '/'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="font-label-md text-[10px]">Home</span>
        </Link>

        {/* Unified Recipes Trigger Node */}
        <button
          type="button"
          onClick={() => setIsSheetOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-3 py-1 transition-all cursor-pointer ${
            isRecipesActive
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
          <span className="font-label-md text-[10px]">Recipes</span>
        </button>

        {/* Meal Plans */}
        <Link
          to="/meal-plans"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-3 py-1 transition-all ${
            activePath === '/meal-plans'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          <span className="font-label-md text-[10px]">Meal Plans</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-3 py-1 transition-all ${
            activePath === '/settings'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-label-md text-[10px]">Settings</span>
        </Link>
      </nav>
    </>
  );
};

export default MobileNav;
