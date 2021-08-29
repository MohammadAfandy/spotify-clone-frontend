import AuthProvider from './context/auth-context';

import MainPage from './pages/MainPage';

function App() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
}

export default App;
