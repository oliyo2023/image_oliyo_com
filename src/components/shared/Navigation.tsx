'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSelector from './LanguageSelector';

export default function Navigation() {
  const t = useTranslations('Common');
  const { data: session } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push(`/${locale}`);
  };

  return (
    <nav className="bg-[#0F1115] border-b border-[#2B3036] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}/`} className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 shadow-glow">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-[#E6E8EA]">Oliyo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href={`/${locale}/`}
                className="text-[#9BA1A6] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-[#9BA1A6] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('about')}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="text-[#9BA1A6] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('pricing')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-[#9BA1A6] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('contact')}
              </Link>
            </div>
          </div>

          {/* Right side - Language Selector and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/dashboard`}
                  className="bg-[#10B981] text-[#0F1115] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-[#9BA1A6] hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/${locale}/login`}
                  className="text-[#9BA1A6] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="bg-[#10B981] text-[#0F1115] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#9BA1A6] hover:text-white hover:bg-[#23262B] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1A1D22]">
            <Link
              href={`/${locale}/`}
              className="text-[#9BA1A6] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-[#9BA1A6] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('about')}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="text-[#9BA1A6] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('pricing')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-[#9BA1A6] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('contact')}
            </Link>
            
            {session ? (
              <div className="border-t border-[#2B3036] pt-4">
                <Link
                  href={`/${locale}/dashboard`}
                  className="bg-[#10B981] text-[#0F1115] block px-3 py-2 rounded-md text-base font-semibold hover:bg-[#059669]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-[#9BA1A6] hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="border-t border-[#2B3036] pt-4 space-y-1">
                <Link
                  href={`/${locale}/login`}
                  className="text-[#9BA1A6] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="bg-[#10B981] text-[#0F1115] block px-3 py-2 rounded-md text-base font-semibold hover:bg-[#059669]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}