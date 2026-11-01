import { render } from '@testing-library/react';
import { ToastProvider } from '../components/ui/Toast.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

export function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      <ToastProvider>{ui}</ToastProvider>
    </AuthProvider>
  );
}

export const USER = { id: 1, username: 'alex', default_currency_code: 'MXN', role: 'owner', token: 'tok-owner' };
export const REVIEWER = { id: 2, username: 'mama', default_currency_code: 'MXN', role: 'reviewer', token: 'tok-reviewer' };

export function signIn(user = USER) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}
