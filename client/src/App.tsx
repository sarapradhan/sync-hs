import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/navigation/top-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import Dashboard from "@/pages/dashboard";
import Assignments from "@/pages/assignments";
import Calendar from "@/pages/calendar";
import Subjects from "@/pages/subjects";
import { Settings } from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { AssignmentForm } from "@/components/assignments/assignment-form";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 font-roboto">
          <TopNav onAddAssignment={handleOpenForm} />
          <Router />
          <MobileNav />
          <AssignmentForm 
            open={isFormOpen} 
            onClose={handleCloseForm} 
          />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
