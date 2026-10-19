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

export const USER = { id: 1, username: 'alex', default_currency_code: 'MXN' };

export function signIn(user = USER) {
  localStorage.setItem('auth_user', JSON.stringify(user));
}
