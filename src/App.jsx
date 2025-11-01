import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeContextProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/layout.jsx';
import HomePage from './pages/HomePage';
import MaterialPage from './pages/MaterialPage';
import ContributePage from './pages/ContributePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeContextProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/material" element={<MaterialPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </ThemeContextProvider>
  );
}

export default App;
