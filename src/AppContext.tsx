import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppData } from './types';
import { loadData, saveData } from './storage';

interface AppContextValue {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => loadData());

  const setData = useCallback((updater: (prev: AppData) => AppData) => {
    setDataState((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{ data, setData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
