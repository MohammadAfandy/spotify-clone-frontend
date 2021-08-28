import AuthProvider from './context/auth-context';

import MainPage from './Pages/MainPage';

function App() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
}

export default App;
