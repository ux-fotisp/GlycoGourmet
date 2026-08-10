import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    { label: 'My Recipes', path: '/my-recipes', icon: 'edit_note' },
    { label: 'Meal Plans', path: '/meal-plans', icon: 'calendar_today' },
    { label: 'Profile Settings', path: '/settings', icon: 'settings' },
  ];

  const getLinkClass = (path) => {
    const isActive = activePath === path;
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-r-full font-bold transition-all active:scale-95"
      : "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 rounded-r-full transition-transform hover:translate-x-1 active:scale-95";
  };

  return (
    <>
      {/* Desktop Side Navigation */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 w-64 top-0 bg-surface-container-low border-r border-outline-variant py-md space-y-xs z-50">
        <div className="px-md mb-lg">
          <Link to="/" className="block">
            <h1 className="font-display text-headline-md text-primary tracking-tight font-bold">GlycoGourmet Admin</h1>
          </Link>
          <p className="text-on-surface-variant font-label-md mt-1 opacity-70">Managing Blood Sugar & Flavor</p>
        </div>

        <nav className="flex-1 px-sm">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.path} className={getLinkClass(link.path)}>
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-body-md text-body-md">{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Persistent bottom profile container */}
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
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-tertiary hover:underline cursor-pointer py-1"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden w-full sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm h-16 flex justify-between items-center px-edge-margin">
        <Link to="/">
          <h1 className="font-display text-lg text-primary tracking-tight font-bold">GlycoGourmet Admin</h1>
        </Link>
        <div className="flex gap-2">
          <button className="material-symbols-outlined text-primary p-2 cursor-pointer">
            notifications
          </button>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="material-symbols-outlined text-tertiary p-2 cursor-pointer"
          >
            logout
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface border-t border-outline-variant shadow-[0_-4px_20px_rgba(45,49,48,0.05)] h-20 pb-safe px-xs flex justify-around items-center">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
            activePath === '/'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md text-[10px]">Home</span>
        </Link>
        <Link
          to="/my-recipes"
          className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
            activePath === '/my-recipes'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined">edit_note</span>
          <span className="font-label-md text-[10px]">My Recipes</span>
        </Link>
        <Link
          to="/meal-plans"
          className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
            activePath === '/meal-plans'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="font-label-md text-[10px]">Meal Plans</span>
        </Link>
        <Link
          to="/settings"
          className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
            activePath === '/settings'
              ? 'bg-primary-container text-on-primary-container rounded-full scale-95'
              : 'text-on-surface-variant hover:text-primary active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-[10px]">Settings</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
