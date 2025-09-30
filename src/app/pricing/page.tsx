// src/app/pricing/page.tsx
export default function Pricing() {
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
      popular: true
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Oliyo AI Image Platform
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="/"
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              Home
            </a>
            <a
              href="/login"
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '2rem auto',
        padding: '0 1rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ color: '#4b5563', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Choose a plan that works for you. All plans include access to our full suite of AI models.
          </p>
        </div>

        {/* Pricing Plans */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {plans.map((plan, index) => (
            <div 
              key={index}
              style={{ 
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: plan.popular ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.1)',
                padding: '2rem',
                border: plan.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
                position: 'relative',
                transform: plan.popular ? 'scale(1.05)' : 'none',
                zIndex: plan.popular ? 1 : 'auto'
              }}
            >
              {plan.popular && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '0.25rem 1rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold'
                }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {plan.name}
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb' }}>${plan.price}</span>
                  <span style={{ color: '#4b5563' }}>/ {plan.period}</span>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                  {plan.description}
                </p>
                
                <ul style={{ 
                  textAlign: 'left', 
                  marginBottom: '2rem',
                  paddingLeft: '1rem'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{ 
                      marginBottom: '0.5rem', 
                      color: '#4b5563',
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ 
                        color: '#10b981', 
                        marginRight: '0.5rem',
                        fontSize: '1.25rem'
                      }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a
                  href={plan.popular ? "/register" : "/register"}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem 1rem', 
                    backgroundColor: plan.popular ? '#2563eb' : '#e5e7eb', 
                    color: plan.popular ? 'white' : '#1f2937', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    textAlign: 'center'
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packages */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem', textAlign: 'center' }}>
            Credit Packages
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {creditPackages.map((pkg, index) => (
              <div 
                key={index}
                style={{ 
                  border: pkg.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  position: 'relative'
                }}
              >
                {pkg.popular && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    right: '1rem',
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold'
                  }}>
                    Best Value
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {pkg.credits.toLocaleString()} Credits
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>${pkg.price}</span>
                  <span style={{ color: '#4b5563' }}> (${pkg.value.toFixed(2)}/credit)</span>
                </div>
                
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  {pkg.description}
                </p>
                
                <a
                  href="/dashboard/purchase-credits"
                  style={{ 
                    width: '100%',
                    padding: '0.75rem 1rem', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    textAlign: 'center'
                  }}
                >
                  Purchase Credits
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ 
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                What's the difference between plans?
              </h3>
              <p style={{ color: '#4b5563' }}>
                All plans include the same features, but higher-tier plans offer more credits, priority processing, and enhanced support.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Can I upgrade or downgrade my plan?
              </h3>
              <p style={{ color: '#4b5563' }}>
                Yes, you can change your plan at any time. Changes take effect immediately, and we prorate charges when upgrading.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Do credits expire?
              </h3>
              <p style={{ color: '#4b5563' }}>
                No, your credits never expire as long as your account is active. Unused credits roll over month to month.
              </p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                What payment methods do you accept?
              </h3>
              <p style={{ color: '#4b5563' }}>
                We accept all major credit cards including Visa, Mastercard, American Express, and Discover.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ 
        width: '100%', 
        padding: '2rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>About</a>
            <a href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>Pricing</a>
            <a href="/faq" style={{ color: '#6b7280', textDecoration: 'none' }}>FAQ</a>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}