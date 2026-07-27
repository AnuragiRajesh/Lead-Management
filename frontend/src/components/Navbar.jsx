import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import {
  ChartBarIcon,
  UserGroupIcon,
  PlusCircleIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const NavLink = ({ to, icon: Icon, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'bg-white/15 text-white'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-6">
            {/* Brand */}
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">LeadManager</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              <NavLink to="/dashboard" icon={ChartBarIcon}>Dashboard</NavLink>
              <NavLink to="/leads" icon={UserGroupIcon}>Leads</NavLink>
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/leads/create" icon={PlusCircleIcon}>New Lead</NavLink>
                  <NavLink to="/users" icon={UsersIcon}>Users</NavLink>
                </>
              )}
            </div>

            {/* User info + logout */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.name?.[0]}
                </div>
                <div className="text-right leading-tight">
                  <p className="text-white text-xs font-medium">{user?.name}</p>
                  <p className="text-slate-400 text-[10px] capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-auto text-slate-300 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-700/50 px-4 pb-4 pt-2 flex flex-col gap-1">
            <NavLink to="/dashboard" icon={ChartBarIcon}>Dashboard</NavLink>
            <NavLink to="/leads" icon={UserGroupIcon}>Leads</NavLink>
            {user?.role === 'admin' && (
              <>
                <NavLink to="/leads/create" icon={PlusCircleIcon}>New Lead</NavLink>
                <NavLink to="/users" icon={UsersIcon}>Users</NavLink>
              </>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors w-full text-left mt-1"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </nav>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign out"
          message="Are you sure you want to log out?"
          confirmLabel="Logout"
          danger
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default Navbar;
