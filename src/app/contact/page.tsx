// src/app/contact/page.tsx
export default function Contact() {
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
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', textAlign: 'center' }}>
            Contact Us
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Get in Touch
              </h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Have questions about our AI image generation platform? Need help with your account or a specific feature? 
                Our team is here to help you.
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ 
                    minWidth: '40px', 
                    height: '40px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>📧</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Email Support
                    </h3>
                    <p style={{ color: '#4b5563' }}>
                      support@oliyo.com
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ 
                    minWidth: '40px', 
                    height: '40px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>💬</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Live Chat
                    </h3>
                    <p style={{ color: '#4b5563' }}>
                      Available Mon-Fri, 9AM-5PM EST
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ 
                    minWidth: '40px', 
                    height: '40px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>📱</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                      Social Media
                    </h3>
                    <p style={{ color: '#4b5563' }}>
                      @oliyo_ai on Twitter, Instagram, Facebook
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fffbeb', 
                borderRadius: '0.5rem',
                border: '1px solid #fbbf24'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  Emergency Support
                </h3>
                <p style={{ color: '#92400e' }}>
                  For urgent issues, email emergency@oliyo.com or call +1 (555) 123-4567
                </p>
              </div>
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Send us a Message
              </h2>
              
              <form style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem'
              }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select a subject</option>
                    <option value="account">Account Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Send Message
                </button>
              </form>
              
              <div style={{ 
                marginTop: '2rem',
                padding: '1rem', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '0.5rem',
                border: '1px solid #10b981'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
                  Response Time
                </h3>
                <p style={{ color: '#065f46' }}>
                  We typically respond to emails within 24 hours during business days. 
                  For urgent matters, please use our emergency contact information.
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div style={{ 
            marginTop: '3rem',
            padding: '2rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  How do I reset my password?
                </h3>
                <p style={{ color: '#4b5563' }}>
                  Visit the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your inbox.
                </p>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Why are my images taking so long to generate?
                </h3>
                <p style={{ color: '#4b5563' }}>
                  Image generation times depend on server load and AI model complexity. Most images generate within 30-60 seconds. 
                  If it's taking longer, please contact support.
                </p>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Can I get a refund for unused credits?
                </h3>
                <p style={{ color: '#4b5563' }}>
                  We offer refunds on a case-by-case basis for unused credits. Please contact our billing department at billing@oliyo.com 
                  with your request and account details.
                </p>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  How do I purchase more credits?
                </h3>
                <p style={{ color: '#4b5563' }}>
                  Log in to your account and visit the "Purchase Credits" section in your dashboard. 
                  You can buy credit packages of 100, 500, or 1000 credits.
                </p>
              </div>
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
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}