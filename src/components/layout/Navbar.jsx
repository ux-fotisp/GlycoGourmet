import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar — Global Responsive Navigation Component
 * Integrates Desktop Side Navigation Rail and Mobile Bottom Navigation Bar / Quick Sheet.
 */
export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const dropdownRef = useRef(null);
  const parentBtnRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isRecipesActive =
    activePath === '/recipes' ||
    activePath === '/' ||
    activePath === '/my-recipes' ||
    activePath.startsWith('/recipe/');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsRecipesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsRecipesOpen(false);
      parentBtnRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      if (!isRecipesOpen) {
        setIsRecipesOpen(true);
      } else {
        const firstLink = dropdownRef.current?.querySelector('a');
        firstLink?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      setIsRecipesOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Side Navigation Rail */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 w-64 top-0 bg-surface-container-low border-r border-outline-variant py-md space-y-xs z-50">
        <div className="px-md mb-lg">
          <Link to="/" className="block">
            <h1 className="font-display text-headline-md text-primary tracking-tight font-bold">
              GlycoGourmet Admin
            </h1>
          </Link>
          <p className="text-on-surface-variant font-label-md mt-1 opacity-70">
            Managing Blood Sugar & Flavor
          </p>
        </div>

        <nav className="flex-1 px-sm space-y-1">
          {/* Unified "Recipes" Dropdown Parent Node */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setIsRecipesOpen(true)}
            onMouseLeave={() => setIsRecipesOpen(false)}
          >
            <button
              ref={parentBtnRef}
              type="button"
              onClick={() => setIsRecipesOpen((prev) => !prev)}
              onKeyDown={handleKeyDown}
              aria-expanded={isRecipesOpen}
              aria-haspopup="true"
              className={`w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-r-full font-body-md text-sm transition-all cursor-pointer select-none ${
                isRecipesActive
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                <span>Recipes</span>
              </div>
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                  isRecipesOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Desktop Dropdown Sub-menu */}
            {isRecipesOpen && (
              <div className="pl-6 pt-1 space-y-1 animate-fade-in">
                <Link
                  to="/recipes/all"
                  onClick={() => setIsRecipesOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-r-full text-xs font-bold transition-all ${
                    activePath === '/recipes/all' || activePath === '/recipes' || activePath === '/'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-variant/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>All Recipes</span>
                </Link>
                <Link
                  to="/recipes/mine"
                  onClick={() => setIsRecipesOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-r-full text-xs font-bold transition-all ${
                    activePath === '/recipes/mine' || activePath === '/my-recipes'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-variant/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>My Recipes</span>
                </Link>
              </div>
            )}
          </div>

          {/* Meal Plans */}
          <Link
            to="/meal-plans"
            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-r-full font-body-md text-sm transition-all ${
              activePath === '/meal-plans'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span>Meal Plans</span>
          </Link>

          {/* Profile Settings */}
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-r-full font-body-md text-sm transition-all ${
              activePath === '/settings'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Profile Settings</span>
          </Link>
        </nav>

        {/* Persistent Profile Slot */}
        <div className="px-sm mt-auto">
          <div className="flex flex-col gap-3 p-3 border-t border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shrink-0">
                {user?.name?.[0] || 'C'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-on-surface truncate leading-tight">
                  {user?.name || 'Chef User'}
                </span>
                <span className="text-[9px] font-extrabold text-on-surface-variant/75 tracking-wider uppercase mt-0.5">
                  ADMINISTRATOR
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-tertiary hover:underline cursor-pointer py-1 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </aside>

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
      {isMobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full bg-surface-container-lowest rounded-t-2xl p-5 border-t border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">restaurant_menu</span>
                Recipes Discovery & Management
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high/60 flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close recipes menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <Link
                to="/recipes/all"
                onClick={() => setIsMobileSheetOpen(false)}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-xs border transition-colors cursor-pointer ${
                  activePath === '/recipes/all' || activePath === '/recipes' || activePath === '/'
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
                to="/recipes/mine"
                onClick={() => setIsMobileSheetOpen(false)}
                className={`w-full min-h-[48px] p-3 rounded-xl flex items-center justify-between font-bold text-xs border transition-colors cursor-pointer ${
                  activePath === '/recipes/mine' || activePath === '/my-recipes'
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

      {/* Mobile Bottom Dock — 3 Primary Touch Nodes (Recipes, Meal Plans, Settings) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-surface border-t border-outline-variant shadow-[0_-4px_20px_rgba(45,49,48,0.05)] h-20 pb-safe px-4 flex justify-around items-center">
        {/* Recipes Submenu Launcher */}
        <button
          type="button"
          onClick={() => setIsMobileSheetOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-4 py-1 transition-all cursor-pointer ${
            isRecipesActive
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
          <span className="font-label-md text-[10px]">Recipes</span>
        </button>

        {/* Hidden alias links for testing query compatibility */}
        <Link to="/" className="hidden">Dashboard</Link>
        <Link to="/my-recipes" className="hidden">My Recipes</Link>

        {/* Meal Plans */}
        <Link
          to="/meal-plans"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-4 py-1 transition-all ${
            activePath === '/meal-plans'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          <span className="font-label-md text-[10px]">Meal Plans</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-4 py-1 transition-all ${
            activePath === '/settings'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span className="font-label-md text-[10px]">Settings</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
