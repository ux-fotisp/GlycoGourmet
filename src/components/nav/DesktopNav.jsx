import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavPill from './NavPill';

export const DesktopNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const parentBtnRef = useRef(null);

  // Check active route matches for parent highlight
  const isRecipesActive =
    activePath === '/recipes' ||
    activePath === '/' ||
    activePath === '/my-recipes' ||
    activePath.startsWith('/recipe/');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsRecipesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Navigation: ArrowDown, ArrowUp, Escape, Enter
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-screen sticky left-0 w-64 top-0 bg-surface-container-low border-r border-outline-variant py-md space-y-xs z-50">
      {/* Brand Header */}
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

      {/* Main Navigation Links */}
      <nav className="flex-1 px-sm space-y-1">
        {/* Unified "Recipes" Parent Menu Node */}
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
                : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
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

          {/* Sub-menu Dropdown */}
          {isRecipesOpen && (
            <div className="pl-6 pt-1 space-y-1 animate-fade-in">
              <Link
                to="/recipes/all"
                onClick={() => setIsRecipesOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-r-full text-xs font-bold transition-all ${
                  activePath === '/recipes/all' || activePath === '/recipes' || activePath === '/'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'
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
                    : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>My Recipes</span>
              </Link>
            </div>
          )}
        </div>

        {/* Meal Plans */}
        <NavPill
          to="/meal-plans"
          icon="calendar_today"
          label="Meal Plans"
          isActive={activePath === '/meal-plans'}
        />

        {/* Profile Settings */}
        <NavPill
          to="/settings"
          icon="settings"
          label="Profile Settings"
          isActive={activePath === '/settings'}
        />
      </nav>

      {/* Persistent Bottom Profile Container */}
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
  );
};

export default DesktopNav;
