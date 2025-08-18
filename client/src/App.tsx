import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/navigation/top-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Assignments from "@/pages/assignments";
import Calendar from "@/pages/calendar";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { AssignmentForm } from "@/components/assignments/assignment-form";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/calendar" component={Calendar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UnauthenticatedRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={Login} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-material-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnauthenticatedRouter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <TopNav onAddAssignment={handleOpenForm} />
      <AuthenticatedRouter />
      <MobileNav />
      <AssignmentForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
