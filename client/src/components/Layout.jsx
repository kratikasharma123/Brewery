import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard,
  Package,
  CalendarDays, 
  LogOut, 
  Beer, 
  User as UserIcon,
  ShoppingCart,
  Menu,
  X,
  UsersRound,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { getDashboardPath } from '../utils/authRoutes';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isStaffOrAdmin = user?.role === 'Admin' || user?.role === 'Staff';
  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { name: 'Dashboard', path: getDashboardPath(user), icon: LayoutDashboard },
    ...(isStaffOrAdmin ? [{ name: 'Inventory', path: '/inventory', icon: Package }] : []),
    { name: isStaffOrAdmin ? 'Orders' : 'My Order', path: '/orders', icon: ClipboardList },
    ...(isAdmin ? [{ name: 'Staff', path: '/staff', icon: UsersRound }] : []),
    { name: 'Bookings', path: '/bookings', icon: CalendarDays },
    ...(!isStaffOrAdmin ? [
      { name: 'Shop', path: '/shop', icon: ShoppingCart },
      { name: 'Cart', path: '/cart', icon: ShoppingCart },
    ] : []),
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Staff':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <Beer className="h-7 w-7 text-amber-500 animate-pulse" />
          <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Brewery Inventory
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-amber-500 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 flex flex-col pt-24 px-6 gap-6">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto mb-8 border-t border-slate-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-slate-500 max-w-44 truncate" title={user?.email}>
                  {user?.email}
                </p>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800 p-6 shrink-0 justify-between">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Beer className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wide leading-none bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                BREWERY
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase mt-0.5">
                Inventory & Booking
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-amber-600/15 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500/10 to-amber-500/30 flex items-center justify-center border border-amber-500/20 shadow-md">
              <UserIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="font-bold text-sm truncate leading-tight" title={user?.name}>
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={user?.email}>
                {user?.email}
              </p>
              <div className="flex mt-1">
                <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all border border-red-500/10 hover:border-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-semibold text-xs uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden max-h-screen">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto min-h-full flex flex-col">
            <div className="flex-1">
            {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
