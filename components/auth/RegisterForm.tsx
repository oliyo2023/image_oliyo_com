import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface RegisterFormProps {
  onRegister: (email: string, password: string, confirmPassword: string) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError(t('errors.allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordsDoNotMatch'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onRegister(email, password, confirmPassword);
    } catch (err) {
      setError(t('errors.registrationFailed'));
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form-component">
      <h2>{t('register')}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="reg-email">{t('email')}:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholders.email')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="reg-password">{t('password')}:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('placeholders.password')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirm-password">{t('confirmPassword')}:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('placeholders.confirmPassword')}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? t('registering') : t('register')}
        </button>
      </form>
      
      <div className="terms">
        <p>{t('termsAgreement')}</p>
      </div>
      
      {onSwitchToLogin && (
        <div className="form-switch">
          <p>{t('alreadyHaveAccount')} <button onClick={onSwitchToLogin} className="switch-button">{t('login')}</button></p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;