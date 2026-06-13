import { NavLink, Outlet } from 'react-router-dom';
import {
  UtensilsCrossed, Layers, Tag, ShoppingBasket, Calendar,
  Settings, Menu, X, ChefHat
} from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Planovi', icon: Calendar, end: true },
  { to: '/jela', label: 'Jela', icon: UtensilsCrossed },
  { to: '/dodaci', label: 'Dodaci', icon: Layers },
  { to: '/kategorije', label: 'Kategorije', icon: Tag },
  { to: '/sastojci', label: 'Sastojci', icon: ShoppingBasket },
  { to: '/pravila', label: 'Pravila', icon: Settings },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="bg-amber-600 text-white shadow-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <ChefHat size={24} />
          <span className="text-xl font-bold tracking-tight flex-1">Planer obroka</span>
          <button
            className="md:hidden p-1 rounded hover:bg-amber-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className="hidden md:flex gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-amber-700' : 'hover:bg-amber-700 text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {open && (
          <nav className="md:hidden flex flex-col border-t border-amber-500">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-amber-800' : 'hover:bg-amber-700'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
