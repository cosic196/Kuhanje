import { NavLink, Outlet } from 'react-router-dom';
import {
  UtensilsCrossed, Layers, Tag, ShoppingBasket, Calendar,
  Settings, ChefHat
} from 'lucide-react';

const links = [
  { to: '/', label: 'Planovi', icon: Calendar, end: true },
  { to: '/jela', label: 'Jela', icon: UtensilsCrossed },
  { to: '/dodaci', label: 'Dodaci', icon: Layers },
  { to: '/kategorije', label: 'Kategorije', icon: Tag },
  { to: '/sastojci', label: 'Sastojci', icon: ShoppingBasket },
  { to: '/pravila', label: 'Pravila', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top header */}
      <header className="bg-amber-600 text-white shadow-md print:hidden sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
          <ChefHat size={22} />
          <span className="text-lg font-bold tracking-tight">Planer obroka</span>
        </div>
      </header>

      {/* Main content - bottom padding accounts for mobile nav bar */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 py-4 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg print:hidden md:hidden z-40">
        <div className="grid grid-cols-6 h-16 safe-area-pb">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors pt-1 ${
                  isActive ? 'text-amber-600' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-amber-50' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar nav */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-52 bg-white border-r shadow-sm print:hidden">
        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop content offset for sidebar */}
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: 13rem; }
        }
      `}</style>
    </div>
  );
}
