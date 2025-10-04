'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('zh');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 从路径中获取当前语言（usePathname 可能为 null，需要做空值保护）
    const safePathname = pathname ?? '';
    const pathSegments = safePathname.split('/');
    const localeFromPath = pathSegments[1];
    if (languages.find(lang => lang.code === localeFromPath)) {
      setCurrentLocale(localeFromPath);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const safePathname = pathname ?? '';
    const pathSegments = safePathname.split('/');
    if (pathSegments.length > 1) {
      pathSegments[1] = langCode;
      const newPath = pathSegments.join('/');
      router.push(newPath);
    } else {
      router.push(`/${langCode}`);
    }
    setIsOpen(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLocale) || languages[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 text-white hover:scale-105"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{getCurrentLanguage().flag}</span>
        <span className="hidden sm:inline text-sm font-medium">
          {getCurrentLanguage().name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                currentLocale === language.code 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' 
                  : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {currentLocale === language.code && (
                <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}