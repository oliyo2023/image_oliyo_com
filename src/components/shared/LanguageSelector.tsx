'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 从URL中检测当前语言
  useEffect(() => {
    const pathSegments = (pathname ?? '').split('/');
    const langFromPath = pathSegments[1];
    if (languages.some(lang => lang.code === langFromPath)) {
      setCurrentLang(langFromPath);
    }
  }, [pathname]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // 构建新的URL
    const pathSegments = (pathname ?? '').split('/');
    const isCurrentlyLocalized = languages.some(lang => lang.code === pathSegments[1]);
    
    let newPath;
    if (isCurrentlyLocalized) {
      // 替换现有的语言代码
      pathSegments[1] = langCode;
      newPath = pathSegments.join('/');
    } else {
      // 添加语言代码
      const currentPath = pathname ?? '';
      newPath = `/${langCode}${currentPath}`;
    }
    
    router.push(newPath);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-[#E6E8EA] bg-[#23262B] border border-[#2B3036] rounded-lg shadow-sm hover:bg-[#2B3036] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ease-in-out"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center space-x-2">
          <span className="text-lg" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
          <span className="hidden sm:inline-block">{currentLanguage.name}</span>
        </span>
        <ChevronDown 
          className={`ml-2 -mr-1 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* 下拉菜单 */}
      <div
        className={`absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg bg-[#23262B] shadow-lg ring-1 ring-[#2B3036] transition-all duration-200 ease-in-out ${
          isOpen
            ? 'transform opacity-100 scale-100'
            : 'transform opacity-0 scale-95 pointer-events-none'
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="language-menu"
      >
        <div className="py-1" role="none">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`group flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ease-in-out ${
                currentLang === language.code
                  ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                  : 'text-[#E6E8EA] hover:bg-[#2B3036] hover:text-white'
              }`}
              role="menuitem"
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="text-lg mr-3" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              <span className="flex-1 text-left">{language.name}</span>
              {currentLang === language.code && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}