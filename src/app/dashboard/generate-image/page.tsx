'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

type TabKey = 'text' | 'reference' | 'style';
type MediaTab = 'all' | 'image' | 'video' | 'audio' | 'favorite';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

export default function GenerateImage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 左侧表单状态
  const [activeTab, setActiveTab] = useState<TabKey>('text');
  const [prompt, setPrompt] = useState('');
  const [quality2k, setQuality2k] = useState(true);
  const [ar, setAr] = useState<'9:16' | '4:3'>('9:16');

  // 推荐标签
  const suggestions = ['粘土蛋糕师', '猫耳少年', '午后心事', '慢帧胶片'];

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('GenerateImage');
  const tc = useTranslations('Common');

  // 映射比例到分辨率
  const { width, height } = useMemo(() => {
    const baseShort = quality2k ? 1080 : 768;
    const map: Record<typeof ar, [number, number]> = {
      '9:16': [Math.round(baseShort * 0.5625), baseShort],
      '4:3': [baseShort, Math.round(baseShort * 0.75)],
    };
    const [w, h] = map[ar];
    return { width: w, height: h };
  }, [ar, quality2k]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((data: UserProfile | { message?: string }) => {
        if ((data as UserProfile).id) setUser(data as UserProfile);
        else {
          localStorage.removeItem('token');
          router.push(`/${locale}/login`);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.push(`/${locale}/login`);
      });
  }, [router, locale]);

  const submitGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      setMessage('请输入创意描述');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          model: 'qwen-image-edit',
          width,
          height,
          style: 'realistic',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('图片生成已开始');
      } else {
        setMessage(data.message || '图片生成失败');
      }
    } catch {
      setMessage('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <p className="text-[#999999]">{tc('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-1">
      {/* 左侧边栏 - 完全按照设计稿精确配色 */}
      <div className="w-80 bg-[#1C1C1C] border-r border-[#2C2C2C] flex flex-col flex-shrink-0 shadow-2xl">
          <div className="h-14 bg-[#1C1C1C] border-b border-[#2C2C2C] flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-md transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="20" y2="18"/>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">图片生成</h1>
                <div className="px-2 py-0.5 bg-[#2A2A2A] rounded-md text-xs text-[#999999]">Beta 2.1</div>
                <div className="flex items-center">
                  <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                    <path d="M1 1L4 4L7 1" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span className="text-xs text-[#999999]">开始阅读指南，解锁专业生成技巧</span>
              </div>
              <div className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333333] rounded-md text-sm text-white font-medium cursor-pointer">
                打开
              </div>
            </div>
          </div>
          
          {/* 主标签页 */}
          <div className="bg-[#161616] border-b border-[#2C2C2C]">
            <div className="flex px-6 gap-2">
              <div 
                className="px-4 py-3 text-base font-medium text-white border-b-2 border-[#00D563] cursor-pointer transition-all duration-300 hover:bg-[#2A2A2A]/50"
                onClick={() => setActiveTab('text')}
              >
                文生图
              </div>
              <div 
                className="px-4 py-3 text-base font-medium text-[#999999] hover:text-white hover:bg-[#2A2A2A] transition-all duration-300 rounded-t cursor-pointer"
                onClick={() => setActiveTab('reference')}
              >
                参考图
              </div>
              <div 
                className="px-4 py-3 text-base font-medium text-[#999999] hover:text-white hover:bg-[#2A2A2A] transition-all duration-300 rounded-t cursor-pointer"
                onClick={() => setActiveTab('style')}
              >
                风格绘
              </div>
            </div>
          </div>

        {/* 左侧导航图标 */}
          <div className="flex-1 flex">
            <div className="w-20 bg-[#1C1C1C] border-r border-[#2C2C2C] flex flex-col items-center py-6 gap-6">
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#FFFFFF]">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
              <div className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
            </div>

          {/* 主内容区域 */}
          <div className="flex-1 flex flex-col">
            {/* 创意描述区域 */}
            <div className="p-6 flex-1">
              <form onSubmit={submitGenerate} className="h-full flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-base font-medium text-white">创意描述</span>
                  <span className="text-sm text-[#FF4444]">(必填)</span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 w-full resize-none bg-[#0A0A0A] border border-[#2C2C2C] rounded-lg px-4 py-4 text-base text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#00D563] transition-all duration-300 shadow-lg"
                  style={{ minHeight: '280px' }}
                  placeholder="请描述您想生成的图片内容，或使用DeepSeek反馈描述图片，也可查看使用指南提升生成效果"
                />

                {/* 底部工具栏 */}
                <div className="flex items-center justify-between py-3 border-t border-[#2C2C2C] mt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-md">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-md">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A2A] rounded-full cursor-pointer hover:bg-[#333333] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#999999]">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                      <span className="text-xs text-white font-medium">DeepSeek</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* 推荐标签 */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[#999999]">推荐：</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#2C2C2C] to-[#333333] text-[#CCCCCC] text-sm rounded-full cursor-pointer hover:from-[#3C3C3C] hover:to-[#444444] transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-[#3C3C3C]"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
                    <div className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-[#2A2A2A] rounded-full">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 警告文本 */}
                <div className="text-xs text-[#808080] mt-4 border-t border-[#2C2C2C] pt-3">
                  内容创作仅供娱乐，请勿用于商业用途或其他活动
                </div>
              </form>
            </div>

            {/* 底部控制区 */}
              <div className="p-6 border-t border-[#2C2C2C]">
                <div className="flex items-center gap-3 mb-4">
                  {/* 比例按钮 */}
                  <div 
                    className={`px-4 py-2 text-sm rounded-lg ${ 
                      ar === '9:16' 
                        ? 'bg-gradient-to-r from-[#00D563] to-[#00C455] text-black shadow-lg'
                        : 'bg-[#2C2C2C] text-[#CCCCCC] hover:bg-[#3C3C3C] hover:text-white'
                  } transition-all duration-300 transform hover:scale-105 font-medium`}
                    onClick={() => setAr('9:16')}
                  >
                    9:16
                  </div>
                  <div 
                    className={`px-4 py-2 text-sm rounded-lg ${ 
                      ar === '4:3' 
                        ? 'bg-gradient-to-r from-[#00D563] to-[#00C455] text-black shadow-lg'
                        : 'bg-[#2C2C2C] text-[#CCCCCC] hover:bg-[#3C3C3C] hover:text-white'
                  } transition-all duration-300 transform hover:scale-105 font-medium`}
                    onClick={() => setAr('4:3')}
                  >
                    4:3
                  </div>
                  {/* 2K高清按钮 */}
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={quality2k}
                      onChange={(e) => setQuality2k(e.target.checked)}
                      className="w-5 h-5 rounded accent-[#00D563] transition-all duration-300"
                    />
                    <span className="text-[#CCCCCC] text-sm group-hover:text-white transition-colors">2K高清</span>
                  </label>
                </div>

                {/* 生成按钮 */}
                <div 
                  className="w-full bg-gradient-to-r from-[#00D563] to-[#00C455] hover:from-[#00C455] hover:to-[#00B347] text-black font-bold py-4 px-6 rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  onClick={submitGenerate}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {loading ? (
                    <span className="font-bold text-lg">生成中...</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">4</span>
                      <span className="font-bold text-lg">生成</span>
                    </>
                  )}
                </div>
              
                {message && (
                  <div className={`mt-4 p-3 rounded text-sm text-center ${ 
                    message.includes('开始')
                      ? 'bg-[#00D563]/10 text-[#00D563] border border-[#00D563]/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                    {message}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 bg-gradient-to-br from-[#0A0A0A] to-[#121212] flex flex-col">
        {/* 顶部导航栏 */}
        <div className="h-14 bg-[#1C1C1C] border-b border-[#2C2C2C] flex items-center justify-between px-8 shadow-lg">
          <div className="flex items-center gap-8">
            <div className="text-base text-white cursor-pointer font-medium border-b-2 border-[#00D563] pb-1">全部</div>
            <div className="text-base text-[#999999] hover:text-white cursor-pointer transition-colors duration-300">图片</div>
            <div className="text-base text-[#999999] hover:text-white cursor-pointer transition-colors duration-300">视频</div>
            <div className="text-base text-[#999999] hover:text-white cursor-pointer transition-colors duration-300">音频</div>
            <div className="text-base text-[#999999] hover:text-white cursor-pointer transition-colors duration-300">我收藏的</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-base text-[#999999] hover:text-white cursor-pointer transition-colors duration-300">资产管理</div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2A2A2A] to-[#333333] rounded-lg shadow-md">
              <div className="w-3 h-3 bg-[#00D563] rounded-full animate-pulse"></div>
              <span className="text-base text-white font-bold">{user.creditBalance}</span>
            </div>
          </div>
        </div>

        {/* 右侧主内容区 */}
        <div className="flex-1 p-12 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-gradient-to-br from-[#161616] to-[#1C1C1C] rounded-2xl border border-[#2C2C2C] overflow-hidden shadow-2xl">
              {/* 空状态提示 */}
              <div className="p-20 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[#00D563] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#404040] relative z-10">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-[#00D563] to-[#00C455] rounded-full flex items-center justify-center shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-[#FFFFFF] text-center mb-4 text-2xl font-bold">释放你的创造力</h3>
                <p className="text-[#999999] text-center mb-4 text-lg">体验AI的魔力，创造无限可能</p>
                <p className="text-[#666666] text-center text-base max-w-md leading-relaxed">输入你的创意描述，点击生成按钮开始创作。让我们一起探索AI艺术的无限魅力！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}