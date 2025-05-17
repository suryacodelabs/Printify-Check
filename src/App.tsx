
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from './pages/Index';
import Home from './pages/Home';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import CheckDetails from './pages/CheckDetails';
import AdvancedPdfTools from './pages/AdvancedPdfTools';
import PdfAccessibility from './pages/pdf-accessibility';
import ComplianceCheck from './pages/compliance-check';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import Auth from './pages/Auth';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import PdfImageExtraction from './pages/PdfImageExtraction';
import PdfPrintOptimization from './pages/PdfPrintOptimization';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="printify-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Helmet
            titleTemplate="%s - PrintifyCheck"
            defaultTitle="PrintifyCheck - PDF Preflight and Correction"
          >
            <meta
              name="description"
              content="Professional PDF preflighting and correction tool for print professionals"
            />
          </Helmet>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/check/:id" element={<ProtectedRoute><CheckDetails /></ProtectedRoute>} />
            <Route path="/advanced-tools" element={<ProtectedRoute><AdvancedPdfTools /></ProtectedRoute>} />
            <Route path="/pdf-accessibility" element={<ProtectedRoute><PdfAccessibility /></ProtectedRoute>} />
            <Route path="/compliance-check" element={<ProtectedRoute><ComplianceCheck /></ProtectedRoute>} />
            <Route path="/pdf-image-extraction" element={<ProtectedRoute><PdfImageExtraction /></ProtectedRoute>} />
            <Route path="/pdf-print-optimization" element={<ProtectedRoute><PdfPrintOptimization /></ProtectedRoute>} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
