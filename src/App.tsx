import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import SubmitQuestion from "./pages/SubmitQuestion";
import Admin from "./pages/Admin";
import Report from "./pages/Report"
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import NotFound from "./pages/NotFound";
import AdminStatus from "./pages/AdminStatus";
import AuthCallback from "@/pages/AuthCallback";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import FeedbackModal from "@/components/FeedbackModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const SecurityBanner = () => {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-green-500/10 backdrop-blur supports-[backdrop-filter]:bg-green-500/10">
      <div className="flex items-center justify-center gap-3 px-4 py-3 text-sm">

        <Info className="h-5 w-5 text-green-600 shrink-0" />

        <p className="text-center text-green-800 dark:text-green-300">
          <span className="font-semibold">Update:</span>{" "}
          Questions now show full dates (DD/MM/YYYY) based on feedback.
        </p>
      </div>
    </div>
  );
};

const App = () => {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if(prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    if(savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      applySystemTheme();
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (localStorage.getItem("theme") === "system") {
        applySystemTheme();
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SecurityBanner />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/questions" element={<Questions />} />
            <Route path='/submit' element={<SubmitQuestion />} />
            <Route path='/admin' element={<Admin />} />
            <Route path="/admin/status" element={<AdminStatus />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path ="/report" element={<Report />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Analytics />
          <FeedbackModal />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
