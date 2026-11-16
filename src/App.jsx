import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeContext";

const LandingPage = lazy(() => import("@/components/landing/LandingPage"));
const FeaturesPage = lazy(() => import("@/components/landing/pages/FeaturesPage"));
const AgentsPage = lazy(() => import("@/components/landing/pages/AgentsPage"));
const HowItWorksPage = lazy(() => import("@/components/landing/pages/HowItWorksPage"));
const WhyPage = lazy(() => import("@/components/landing/pages/WhyPage"));
const RolesPage = lazy(() => import("@/components/landing/pages/RolesPage"));
const PricingPage = lazy(() => import("@/components/landing/pages/PricingPage"));
const FaqPage = lazy(() => import("@/components/landing/pages/FaqPage"));
const PrivacyPage = lazy(() => import("@/components/landing/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/components/landing/pages/TermsPage"));
const SecurityPage = lazy(() => import("@/components/landing/pages/SecurityPage"));

const MARKETING_PAGES = {
  features: FeaturesPage,
  agents: AgentsPage,
  how: HowItWorksPage,
  why: WhyPage,
  roles: RolesPage,
  pricing: PricingPage,
  faq: FaqPage,
  privacy: PrivacyPage,
  terms: TermsPage,
  security: SecurityPage,
};

const CenteredLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Marketing = ({ Component }) => {
  const navigate = useNavigate();
  return (
    <Component
      onGetStarted={() => {}}
      onNavigate={(id) => navigate(`/${id}`)}
      onHome={() => navigate("/")}
    />
  );
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <Routes>
        <Route path="/" element={<Marketing Component={LandingPage} />} />
        {Object.entries(MARKETING_PAGES).map(([id, Component]) => (
          <Route key={id} path={`/${id}`} element={<Marketing Component={Component} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
    <Toaster />
  </ThemeProvider>
);

export default App;
