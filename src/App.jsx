import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import CheckingPage from './pages/CheckingPage';
import Register from './pages/register';
import Login from './pages/Login';
import Detection from './pages/Detection';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const handleNavigateToCheck = () => {
    setCurrentPage('checking');
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToDetection = () => {
    setCurrentPage('detection');
  };

  return (
    <>
      {currentPage === 'landing' ? (
        <LandingPage onNavigateToCheck={handleNavigateToCheck} onNavigateToRegister={handleNavigateToRegister} onNavigateToLogin={handleNavigateToLogin} />
      ) : currentPage === 'checking' ? (
        <CheckingPage onBackToHome={handleBackToHome} />
      ) : currentPage === 'register' ? (
        <Register onBackToHome={handleBackToHome} onNavigateToLogin={handleNavigateToLogin} onNavigateToDetection={handleNavigateToDetection} />
      ) : currentPage === 'login' ? (
        <Login onBackToHome={handleBackToHome} onNavigateToRegister={handleNavigateToRegister} onNavigateToDetection={handleNavigateToDetection} />
      ) : (
        <Detection onBackToHome={handleBackToHome} />
      )}
    </>
  );
}

export default App;
