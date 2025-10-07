import './../index.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Shield,
  Settings,
  ChevronRight
} from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'User Management', icon: Users },
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/restrictions', label: 'Restrictions', icon: Shield },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    // Special case for User Management - should be active for both /users and /user/:id
    if (path === '/users') {
      return location.pathname.startsWith('/users') || location.pathname.startsWith('/user/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="h-20 bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl border-b border-white/20 shadow-2xl z-50">
        <div className="flex items-center justify-between h-full px-8">
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Right: User Status & Actions */}
          <div className="flex items-center space-x-6">
            {/* User Status */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-white">{user?.username || 'Admin User'}</p>
                <div className="flex items-center justify-end">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm text-green-400 font-semibold">Online</span>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-3 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-300 group transform hover:scale-105"
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
              <span className="text-sm font-semibold text-red-400 group-hover:text-red-300 hidden sm:block">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </header>
          
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 lg:w-80 md:w-72 sm:w-64 bg-white/8 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-4 lg:p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-bold text-white">Navigation</h2>
                  <p className="text-xs text-blue-300/70">Quick access menu</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 lg:p-4 space-y-2 lg:space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} to={item.path}>
                    <div className={`
                        flex items-center justify-between p-3 lg:p-4 rounded-2xl transition-all duration-300 group transform hover:scale-[1.02] hover:shadow-lg
                      ${active 
                          ? 'bg-gradient-to-r from-blue-500/50 to-purple-500/50 border border-blue-400/70 shadow-xl shadow-blue-500/25 backdrop-blur-sm' 
                          : 'hover:bg-white/20 border border-transparent hover:border-white/40 hover:shadow-md'
                      }
                    `}>
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <div className={`
                            p-2 lg:p-3 rounded-xl transition-all duration-300 transform group-hover:scale-110
                          ${active 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                              : 'bg-white/20 text-gray-400 group-hover:bg-blue-500/40 group-hover:text-blue-300'
                          }
                        `}>
                          <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`
                              font-semibold transition-all duration-300 truncate
                              ${active ? 'text-white text-sm lg:text-base' : 'text-gray-300 group-hover:text-white text-sm group-hover:text-base'}
                          `}>
                            {item.label}
                          </span>
                          <span className={`
                              text-xs transition-all duration-300 truncate hidden sm:block
                              ${active ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-300'}
                          `}>
                            {item.path === '/' ? 'Overview & Analytics' :
                             item.path === '/users' ? 'Manage Users & Accounts' :
                             item.path === '/billing' ? 'Subscriptions & Payments' :
                             item.path === '/restrictions' ? 'Access Control & Security' : ''}
                          </span>
                        </div>
                      </div>
                      {active && (
                          <div className="flex items-center ml-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 lg:p-4 border-t border-white/10">
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-3 lg:p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.username || 'Admin User'}</p>
                    <p className="text-xs text-green-300 hidden sm:block">System Administrator</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}

export default Layout;