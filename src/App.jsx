import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Welcome from './pages/Welcome';
import LanguageSelection from './pages/LanguageSelection';
import Compiler from './pages/Compiler';
import Documentation from './pages/Documentation';
import About from './pages/About';

function CompilerRedirect() {
  const lastLang = localStorage.getItem('cj.lang') || 'c';
  return <Navigate to={`/compiler/${lastLang}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/languages" element={<LanguageSelection />} />
          <Route path="/compiler/:language" element={<Compiler />} />
          <Route path="/compiler" element={<CompilerRedirect />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
