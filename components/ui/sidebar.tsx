"use client"

import { useState, ReactNode } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Settings, 
  Users, 
  FileText,
  Search,
  LogOut,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface SubmenuItem {
  id: string;
  label: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  badge?: string;
  submenu?: SubmenuItem[];
}

interface MenuItemProps {
  item: MenuItem;
  isOpen: boolean;
  activeMenu: string;
  expandedMenus: string[];
  onNavigate: (path: string) => void;
  toggleSubmenu: (id: string) => void;
}

interface ModernSidebarProps {
  children?: ReactNode;
}

const MenuItemComponent = ({ 
  item, 
  isOpen, 
  activeMenu, 
  expandedMenus, 
  onNavigate,
  toggleSubmenu 
}: MenuItemProps) => {
  const isActive = activeMenu === item.id || activeMenu.startsWith(`${item.id}-`);
  const isExpanded = expandedMenus.includes(item.id) || activeMenu.startsWith(`${item.id}-`);
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = () => {
    if (hasSubmenu) {
      toggleSubmenu(item.id);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-lg
          transition-all duration-200 group relative
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          }
          ${!isOpen && 'justify-center'}
        `}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
          {isOpen && (
            <span className="font-medium text-sm">{item.label}</span>
          )}
        </div>
        
        {isOpen && (
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </div>
        )}

        {!isOpen && item.badge && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {hasSubmenu && isExpanded && isOpen && (
        <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-800 space-y-1">
          {item.submenu!.map((subItem) => (
            <button
              key={subItem.id}
              onClick={() => onNavigate(subItem.path)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm
                transition-all duration-200
                ${activeMenu === subItem.id
                  ? 'bg-gray-800 text-blue-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }
              `}
            >
              {subItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ModernSidebar = ({ children }: ModernSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Set active menu based on current pathname
  const getActiveMenu = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/andon-monitoring')) return 'andon-monitoring';
    if (pathname.startsWith('/material')) return 'material';
    if (pathname.startsWith('/operator')) return 'operator';
    if (pathname.startsWith('/schedule')) return 'schedule';
    if (pathname.startsWith('/production-progress')) return 'production-workstation';
    if (pathname.startsWith('/production/logs')) return 'production-log';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeMenu = getActiveMenu();

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/'
    },
    {
      id: 'andon-monitoring',
      label: 'Andon Monitoring',
      icon: Activity,
      path: '/andon-monitoring'
    },
    {
      id: 'material',
      label: 'Material',
      icon: Database,
      path: '/material'
    },
    {
      id: 'operator',
      label: 'Operator',
      icon: Users,
      path: '/operator'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: FileText,
      path: '/schedule'
    },
    {
      id: 'production',
      label: 'Production',
      icon: Activity,
      submenu: [
        {
          id: 'production-workstation',
          label: 'Lantai 3',
          path: '/production-progress/timeline'
        },
        {
          id: 'production-log',
          label: 'Riwayat Data Kanban',
          path: '/production/logs'
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <aside 
        className={`
          ${isOpen ? 'w-64' : 'w-20'} 
          bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50
          transition-all duration-300 ease-in-out
          flex flex-col relative shadow-2xl
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-center">
          {isOpen ? (
            <Image src="/assets/logo/logoxreka.png" alt="Andon Logo" width={200} height={60} className="object-contain" />
          ) : (
            <Image src="/assets/logo/logoxreka.png" alt="Andon Logo" width={50} height={50} className="object-contain" />
          )}
        </div>

        {/* Search Bar */}
        {/* {isOpen && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {isOpen && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Main Menu
            </div>
          )}
          {menuItems.map((item) => (
            <MenuItemComponent 
              key={item.id} 
              item={item}
              isOpen={isOpen}
              activeMenu={activeMenu}
              expandedMenus={expandedMenus}
              onNavigate={(path) => router.push(path)}
              toggleSubmenu={toggleSubmenu}
            />
          ))}

          {isOpen && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-3 px-3">
              System
            </div>
          )}
          <MenuItemComponent 
            item={{ id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }}
            isOpen={isOpen}
            activeMenu={activeMenu}
            expandedMenus={expandedMenus}
            onNavigate={(path) => router.push(path)}
            toggleSubmenu={toggleSubmenu}
          />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50">
          {isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  AD
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Admin PPO</p>
                  <p className="text-gray-400 text-xs">admin-ppo@ptrekaindo.co.id</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-all text-sm">
                  <HelpCircle className="w-4 h-4" />
                  Help
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all text-sm">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button className="w-full p-2 hover:bg-gray-800 rounded-lg transition-all flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <button className="w-full p-2 hover:bg-red-500/20 rounded-lg transition-all flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all z-50"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children || (
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Andon Dashboard</h2>
              <p className="text-gray-400">Sistem monitoring produksi enterprise</p>
            </div>

            {/* Demo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Production Line {i}</h3>
                  <p className="text-gray-400 text-sm mb-4">Efficiency: 95% | Status: Running</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ModernSidebar;