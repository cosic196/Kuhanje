import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { useLang } from '../LanguageContext';
import type { Language } from '../i18n';

export default function LanguageSelect() {
  const { setLang } = useLang();
  const [selected, setSelected] = useState<Language>('hr');

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 rounded-full p-4">
            <ChefHat size={40} className="text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Meal Planner</h1>
        <p className="text-gray-500 mb-8 text-sm">Choose your language / Odaberite jezik</p>

        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={() => setSelected('hr')}
            className={`w-full py-4 rounded-xl border-2 font-medium text-base transition-colors flex items-center justify-center gap-3 ${
              selected === 'hr'
                ? 'border-amber-600 bg-amber-50 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">🇭🇷</span>
            Hrvatski
          </button>
          <button
            onClick={() => setSelected('en')}
            className={`w-full py-4 rounded-xl border-2 font-medium text-base transition-colors flex items-center justify-center gap-3 ${
              selected === 'en'
                ? 'border-amber-600 bg-amber-50 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">🇬🇧</span>
            English
          </button>
        </div>

        <button
          onClick={() => setLang(selected)}
          className="w-full bg-amber-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-amber-700 active:scale-95 transition-transform"
        >
          {selected === 'hr' ? 'Nastavi' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
