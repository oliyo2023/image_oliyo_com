// src/app/pricing/page.tsx
'use client';
import { useLocale } from 'next-intl';

export default function Pricing() {
  const locale = useLocale();

  // 轻量本地化映射（保留之前逻辑）
  const tr = (s: string) => {
    if (locale === 'zh') {
      const map: Record<string, string> = {
        'Oliyo AI Image Platform': 'Oliyo AI 图像平台',
        'Home': '首页',
        'Sign In': '登录',
        'Simple, Transparent Pricing': '简单、透明的定价',
        'Choose a plan that works for you. All plans include access to our full suite of AI models.': '选择适合你的套餐，所有套餐均可使用我们的完整 AI 模型能力。',
        'Most Popular': '最受欢迎',
        'Free': '免费',
        'Starter': '入门版',
        'Professional': '专业版',
        'Unlimited': '无限版',
        'month': '每月',
        'forever': '永久免费',
        'Perfect for getting started': '适合入门体验',
        'Great for casual creators': '适合轻度创作者',
        'For serious creators and professionals': '适合严肃创作者与专业人士',
        'For power users and businesses': '适合重度用户与企业',
        '100 free credits': '100 个免费积分',
        'Access to both AI models': '可访问两种 AI 模型',
        'Basic image generation (5 credits/model use)': '基础图像生成（每次使用消耗 5 积分）',
        'Community support': '社区支持',
        'Standard image quality': '标准图像质量',
        '500 credits ($0.02/credit value)': '500 积分（约 $0.02/积分）',
        'Priority generation queue': '优先生成队列',
        'Email support': '邮件支持',
        '2500 credits ($0.018/credit value)': '2500 积分（约 $0.018/积分）',
        'Highest priority generation queue': '最高优先级生成队列',
        'Priority email & chat support': '优先邮件与聊天支持',
        'Enhanced image quality': '增强的图像质量',
        'Early access to new features': '新功能优先体验',
        '5000 credits ($0.018/credit value)': '5000 积分（约 $0.018/积分）',
        '24/7 priority support': '7×24 小时优先支持',
        'Early access to all new features': '所有新功能优先体验',
        'Custom model training (coming soon)': '自定义模型训练（即将上线）',
        'Sign Up Free': '免费注册',
        'Get Started': '开始使用',
        'Choose Professional': '选择专业版',
        'Go Unlimited': '选择无限版',
        'Credit Packages': '积分套餐',
        'Best Value': '最佳价值',
        'Frequently Asked Questions': '常见问题',
        "What's the difference between plans?": '各个套餐有什么区别？',
        'All plans include the same features, but higher-tier plans offer more credits, priority processing, and enhanced support.': '所有套餐具备同样的核心功能，更高档位提供更多积分、优先处理与增强支持。',
        'Can I upgrade or downgrade my plan?': '我可以升级或降级我的套餐吗？',
        'Yes, you can change your plan at any time. Changes take effect immediately, and we prorate charges when upgrading.': '可以，您可以随时更改套餐；变更立即生效，升级时我们按比例计费。',
        'Do credits expire?': '积分会过期吗？',
        'No, your credits never expire as long as your account is active. Unused credits roll over month to month.': '不会，只要账户活跃，积分永久有效，未用积分会自动结转。',
        'What payment methods do you accept?': '支持哪些支付方式？',
        'We accept all major credit cards including Visa, Mastercard, American Express, and Discover.': '我们支持主流信用卡，包括 Visa、Mastercard、American Express 与 Discover。',
        'About': '关于',
        'Pricing': '定价',
        'FAQ': '问答',
        'Contact': '联系',
        'All rights reserved.': '保留所有权利。',
        'Purchase Credits': '购买积分',
        'Credits': '积分',
        'Save': '立省',
        'per month': '每月',
      };
      return map[s] ?? s;
    }
    return s;
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "100 free credits",
        "Access to both AI models",
        "Basic image generation (5 credits/model use)",
        "Community support",
        "Standard image quality"
      ],
      cta: "Sign Up Free",
      popular: false
    },
    {
      name: "Starter",
      price: "9.99",
      period: "month",
      description: "Great for casual creators",
      features: [
        "500 credits ($0.02/credit value)",
        "Access to both AI models",
        "Priority generation queue",
        "Email support",
        "Standard image quality"
      ],
      cta: "Get Started",
      popular: true,
      ribbon: { text: tr('Most Popular'), color: '#2563eb' }
    },
    {
      name: "Professional",
      price: "44.99",
      period: "month",
      description: "For serious creators and professionals",
      features: [
        "2500 credits ($0.018/credit value)",
        "Access to both AI models",
        "Highest priority generation queue",
        "Priority email & chat support",
        "Enhanced image quality",
        "Early access to new features"
      ],
      cta: "Choose Professional",
      popular: false
    },
    {
      name: "Unlimited",
      price: "89.99",
      period: "month",
      description: "For power users and businesses",
      features: [
        "5000 credits ($0.018/credit value)",
        "Access to both AI models",
        "Highest priority generation queue",
        "24/7 priority support",
        "Enhanced image quality",
        "Early access to all new features",
        "Custom model training (coming soon)"
      ],
      cta: "Go Unlimited",
      popular: false
    }
  ];

  const creditPackages = [
    {
      credits: 100,
      price: 9.99,
      value: 0.10,
      description: "Perfect for trying out the platform"
    },
    {
      credits: 500,
      price: 44.99,
      value: 0.09,
      description: "Best value package",
      popular: true
    },
    {
      credits: 1000,
      price: 89.99,
      value: 0.09,
      description: "For heavy users"
    }
  ];

  // 颜色与样式工具
  const colors = {
    bgGradient: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 35%, #ffffff 100%)',
    cardBorder: '#e5e7eb',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    primary: '#2563eb',
    success: '#10b981',
  };

  const container: React.CSSProperties = {
    minHeight: '100vh',
    background: colors.bgGradient,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
  };

  const header: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottom: '1px solid #eef2ff',
    zIndex: 50
  };

  const maxW: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  };

  const navRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.25rem'
  };

  const brand: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.textPrimary,
    letterSpacing: '0.2px'
  };

  const navBtn = (filled?: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all .2s ease',
    backgroundColor: filled ? colors.primary : '#eef2ff',
    color: filled ? '#fff' : colors.textPrimary,
    boxShadow: filled ? '0 6px 16px rgba(37,99,235,.25)' : 'none'
  });

  const hero: React.CSSProperties = {
    textAlign: 'center',
    padding: '2.5rem 1rem 1.25rem'
  };

  const heroTitle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: colors.textPrimary,
    marginBottom: '0.75rem'
  };

  const heroSub: React.CSSProperties = {
    fontSize: '1.125rem',
    color: colors.textSecondary,
    maxWidth: '720px',
    margin: '0 auto'
  };

  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    ...maxW,
    padding: '0 1rem',
    marginBottom: '2rem'
  };

  const planCard = (highlight?: boolean): React.CSSProperties => ({
    backgroundColor: '#fff',
    borderRadius: '1rem',
    border: `1px solid ${colors.cardBorder}`,
    boxShadow: highlight ? '0 20px 40px rgba(37,99,235,.18)' : '0 8px 20px rgba(2,6,23,.06)',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    transform: highlight ? 'translateY(-4px)' : 'none',
    transition: 'transform .2s ease, box-shadow .2s ease'
  });

  const priceRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '0.5rem',
    margin: '0.5rem 0 1rem'
  };

  const priceNum: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: colors.primary
  };

  const periodText: React.CSSProperties = {
    color: colors.textSecondary
  };

  const ribbon: React.CSSProperties = {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    boxShadow: '0 8px 16px rgba(37,99,235,.3)'
  };

  const featureList: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0 1.25rem',
  };

  const featureItem: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    color: colors.textSecondary,
    marginBottom: '0.5rem'
  };

  const checkIcon: React.CSSProperties = {
    color: colors.success,
    fontWeight: 900
  };

  const ctaBtn = (primary?: boolean): React.CSSProperties => ({
    display: 'inline-block',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'transform .15s ease, box-shadow .15s ease',
    backgroundColor: primary ? colors.primary : '#eef2ff',
    color: primary ? '#fff' : colors.textPrimary,
    boxShadow: primary ? '0 10px 24px rgba(37,99,235,.25)' : 'none'
  });

  const sectionTitle: React.CSSProperties = {
    ...heroTitle,
    fontSize: '1.75rem',
    marginTop: '0.5rem'
  };

  const sectionCard: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '1rem',
    border: `1px solid ${colors.cardBorder}`,
    boxShadow: '0 8px 20px rgba(2,6,23,.06)',
    padding: '1.5rem',
    ...maxW,
    margin: '0 auto 2rem',
    width: 'calc(100% - 2rem)'
  };

  return (
    <div style={container}>
      {/* Header */}
      <header style={header}>
        <div style={{ ...maxW }}>
          <div style={navRow}>
            <div style={brand}>{tr('Oliyo AI Image Platform')}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`/${locale}/`} style={navBtn(false)}>{tr('Home')}</a>
              <a href={`/${locale}/login`} style={navBtn(true)}>{tr('Sign In')}</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={hero}>
        <h1 style={heroTitle}>{tr('Simple, Transparent Pricing')}</h1>
        <p style={heroSub}>
          {tr('Choose a plan that works for you. All plans include access to our full suite of AI models.')}
        </p>
      </section>

      {/* Plans */}
      <section style={grid}>
        {plans.map((plan, index) => {
          const isPopular = !!plan.popular;
          return (
            <div
              key={index}
              style={planCard(isPopular)}
              onMouseEnter={(e) => ((e.currentTarget.style.transform = 'translateY(-6px)'), (e.currentTarget.style.boxShadow = '0 24px 48px rgba(2,6,23,.12)'))}
              onMouseLeave={(e) => ((e.currentTarget.style.transform = isPopular ? 'translateY(-4px)' : 'none'), (e.currentTarget.style.boxShadow = isPopular ? '0 20px 40px rgba(37,99,235,.18)' : '0 8px 20px rgba(2,6,23,.06)'))}
            >
              {plan.ribbon && (
                <div style={{ ...ribbon, backgroundColor: plan.ribbon.color }}>{plan.ribbon.text}</div>
              )}

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary }}>{tr(plan.name)}</h3>
                <div style={priceRow}>
                  <span style={priceNum}>${plan.price}</span>
                  <span style={periodText}>/ {tr(plan.period)}</span>
                </div>
                <p style={{ color: colors.textSecondary }}>{tr(plan.description)}</p>

                <ul style={featureList}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={featureItem}>
                      <span style={checkIcon}>✓</span>
                      <span>{tr(feature)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`/${locale}/register`}
                  style={ctaBtn(isPopular)}
                >
                  {tr(plan.cta)}
                </a>
              </div>
            </div>
          );
        })}
      </section>

      {/* Credit Packages */}
      <section style={sectionCard}>
        <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{tr('Credit Packages')}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          {creditPackages.map((pkg, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#fafafc',
                boxShadow: '0 6px 16px rgba(2,6,23,.06)'
              }}
            >
              {pkg.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '1rem',
                    backgroundColor: colors.primary,
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    boxShadow: '0 8px 16px rgba(37,99,235,.3)'
                  }}
                >
                  {tr('Best Value')}
                </div>
              )}

              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: colors.textPrimary }}>
                {pkg.credits.toLocaleString()} {locale === 'zh' ? '积分' : 'Credits'}
              </h3>

              <div style={{ margin: '0.5rem 0' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.primary }}>${pkg.price}</span>
                <span style={{ color: colors.textSecondary }}>
                  {' '}
                  ({locale === 'zh' ? `\$${pkg.value.toFixed(2)}/积分` : `\$${pkg.value.toFixed(2)}/credit`})
                </span>
              </div>

              <p style={{ color: colors.textSecondary, marginBottom: '0.75rem' }}>{tr(pkg.description)}</p>

              <a
                href={`/${locale}/dashboard/purchase-credits`}
                style={{
                  ...ctaBtn(true),
                  width: '100%'
                }}
              >
                {tr('Purchase Credits')}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={sectionCard}>
        <h2 style={{ ...sectionTitle, textAlign: 'center' }}>{tr('Frequently Asked Questions')}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: colors.textPrimary }}>
              {tr("What's the difference between plans?")}
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {tr('All plans include the same features, but higher-tier plans offer more credits, priority processing, and enhanced support.')}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: colors.textPrimary }}>
              {tr('Can I upgrade or downgrade my plan?')}
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {tr('Yes, you can change your plan at any time. Changes take effect immediately, and we prorate charges when upgrading.')}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: colors.textPrimary }}>
              {tr('Do credits expire?')}
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {tr('No, your credits never expire as long as your account is active. Unused credits roll over month to month.')}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: colors.textPrimary }}>
              {tr('What payment methods do you accept?')}
            </h3>
            <p style={{ color: colors.textSecondary }}>
              {tr('We accept all major credit cards including Visa, Mastercard, American Express, and Discover.')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          width: '100%',
          padding: '2rem 1rem',
          backgroundColor: '#fff',
          borderTop: `1px solid ${colors.cardBorder}`,
          marginTop: 'auto'
        }}
      >
        <div style={{ ...maxW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={`/${locale}/`} style={{ color: colors.textSecondary, textDecoration: 'none' }}>{tr('Home')}</a>
            <a href={`/${locale}/about`} style={{ color: colors.textSecondary, textDecoration: 'none' }}>{tr('About')}</a>
            <a href={`/${locale}/pricing`} style={{ color: colors.textSecondary, textDecoration: 'none' }}>{tr('Pricing')}</a>
            <a href={`/${locale}/faq`} style={{ color: colors.textSecondary, textDecoration: 'none' }}>{tr('FAQ')}</a>
            <a href={`/${locale}/contact`} style={{ color: colors.textSecondary, textDecoration: 'none' }}>{tr('Contact')}</a>
          </div>
          <p style={{ color: colors.textSecondary }}>
            © {new Date().getFullYear()} {tr('Oliyo AI Image Platform')}. {locale === 'zh' ? tr('All rights reserved.') : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}