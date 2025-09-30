// src/app/faq/page.tsx
export default function FAQ() {
  const faqs = [
    {
      question: "How do credits work?",
      answer: "When you sign up, you'll receive 100 free credits. Each time you generate or edit an image, credits are deducted based on the AI model used. qwen-image-edit costs 5 credits per generation, while gemini-flash-image costs 3 credits per generation. You can purchase additional credits in packages of 100, 500, or 1000."
    },
    {
      question: "What file formats are supported for image editing?",
      answer: "You can upload and edit images in JPEG, PNG, GIF, and WebP formats. Maximum file size is 50MB."
    },
    {
      question: "How long does it take to generate an image?",
      answer: "Most images are generated within 10-30 seconds, depending on the complexity of your prompt and current system load. Image editing typically takes slightly longer, around 15-45 seconds."
    },
    {
      question: "Can I download the generated images?",
      answer: "Yes! All generated and edited images can be downloaded in their original resolution. You'll find a download button on each image in your gallery."
    },
    {
      question: "Are my images private?",
      answer: "Absolutely. Your images are stored securely and are only accessible to you. We never share, sell, or use your images for training purposes without your explicit consent."
    },
    {
      question: "What if I'm not satisfied with the generated image?",
      answer: "You can regenerate the image with a different prompt or try editing it. We're constantly improving our AI models to provide better results. If you continue to have issues, please contact our support team."
    },
    {
      question: "Do you offer refunds for purchased credits?",
      answer: "We offer refunds on a case-by-case basis for unused credits. Please contact our support team with your request, and we'll do our best to assist you."
    },
    {
      question: "Can I use the generated images commercially?",
      answer: "Yes, all images generated on our platform are yours to use however you wish, including commercial use. However, please ensure that your use complies with our Terms of Service and applicable laws."
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
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', textAlign: 'center' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: '2rem' }}>
            Find answers to common questions about our AI image platform
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem' 
          }}>
            {faqs.map((faq, index) => (
              <div 
                key={index}
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '1rem'
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {faq.question}
                </h2>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '3rem',
            padding: '2rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              Still Have Questions?
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
              Can't find the answer you're looking for? Our support team is here to help you.
            </p>
            <div>
              <a
                href="mailto:support@oliyo.com"
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  fontWeight: 'bold', 
                  borderRadius: '0.25rem',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Contact Support
              </a>
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