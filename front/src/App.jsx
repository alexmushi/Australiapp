import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import LoginPage from './pages/LoginPage.jsx';
// import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';

function Content() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return <HomePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Content />
      </ToastProvider>
    </AuthProvider>
  );
}
