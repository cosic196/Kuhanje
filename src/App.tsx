import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { LanguageProvider, useLang } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import Layout from './components/Layout';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import Meals from './pages/Meals';
import Sides from './pages/Sides';
import Categories from './pages/Categories';
import Ingredients from './pages/Ingredients';
import Rules from './pages/Rules';
import LanguageSelect from './pages/LanguageSelect';

function AppContent() {
  const { lang } = useLang();

  if (lang === null) {
    return <LanguageSelect />;
  }

  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Plans />} />
            <Route path="plan/:id" element={<PlanDetail />} />
            <Route path="jela" element={<Meals />} />
            <Route path="prilozi" element={<Sides />} />
            <Route path="kategorije" element={<Categories />} />
            <Route path="namirnice" element={<Ingredients />} />
            <Route path="pravila" element={<Rules />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
