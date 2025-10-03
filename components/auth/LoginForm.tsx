import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t('errors.emailAndPasswordRequired'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(t('errors.loginFailed'));
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-component">
      <h2>{t('login')}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">{t('email')}:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholders.email')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t('password')}:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('placeholders.password')}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? t('loggingIn') : t('login')}
        </button>
      </form>
      
      {onSwitchToRegister && (
        <div className="form-switch">
          <p>{t('noAccount')} <button onClick={onSwitchToRegister} className="switch-button">{t('register')}</button></p>
        </div>
      )}
      
      <div className="auth-options">
        <a href="#" className="forgot-password">{t('forgotPassword')}</a>
      </div>
    </div>
  );
};

export default LoginForm;