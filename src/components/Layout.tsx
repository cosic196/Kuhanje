import { NavLink, Outlet } from 'react-router-dom';
import {
  UtensilsCrossed, Layers, Tag, ShoppingBasket, Calendar,
  Settings, ChefHat, Globe, Moon, Sun,
} from 'lucide-react';
import { useLang } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

export default function Layout() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: '/', label: t.nav.plans, icon: Calendar, end: true },
    { to: '/jela', label: t.nav.meals, icon: UtensilsCrossed },
    { to: '/prilozi', label: t.nav.sides, icon: Layers },
    { to: '/kategorije', label: t.nav.categories, icon: Tag },
    { to: '/namirnice', label: t.nav.ingredients, icon: ShoppingBasket },
    { to: '/pravila', label: t.nav.rules, icon: Settings },
  ];

  const toggleLang = () => setLang(lang === 'hr' ? 'en' : 'hr');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top header */}
      <header className="bg-amber-600 text-white shadow-md print:hidden sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
          <ChefHat size={22} />
          <span className="text-lg font-bold tracking-tight flex-1">{t.appName}</span>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="flex items-center gap-1.5 text-sm bg-amber-700 hover:bg-amber-800 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={toggleLang}
            title={lang === 'hr' ? 'Switch to English' : 'Prebaci na Hrvatski'}
            className="flex items-center gap-1.5 text-sm bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Globe size={15} />
            {lang === 'hr' ? 'EN' : 'HR'}
          </button>
        </div>
      </header>

      {/* Main content - bottom padding accounts for mobile nav bar */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 py-4 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg print:hidden md:hidden z-40">
        <div className="grid grid-cols-6 h-16 safe-area-pb">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors pt-1 ${
                  isActive ? 'text-amber-600' : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-amber-50 dark:bg-amber-900/40' : ''}`}>
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
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-52 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm print:hidden">
        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
