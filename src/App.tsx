import { Route } from 'react-router-dom';
import AuthProvider from './context/auth-context';

import MainPage from './Pages/MainPage';
import LoginPage from './Pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <MainPage />
    </AuthProvider>
  );
}

export default App;
