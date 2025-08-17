import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MATERIAL_ICONS } from "@/lib/constants";

interface TopNavProps {
  onAddAssignment: () => void;
}

export function TopNav({ onAddAssignment }: TopNavProps) {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: MATERIAL_ICONS.dashboard },
    { path: "/assignments", label: "Assignments", icon: MATERIAL_ICONS.assignment },
    { path: "/calendar", label: "Calendar", icon: MATERIAL_ICONS.calendar },
  ];

  return (
    <nav className="bg-material-blue-700 text-white shadow-material-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-2xl" data-testid="logo-icon">
                {MATERIAL_ICONS.school}
              </span>
              <h1 className="text-xl font-medium" data-testid="app-title">StudySync</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-material-blue-500 transition-colors text-white hover:text-white ${
                    location === item.path ? 'bg-material-blue-500' : ''
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <span className="material-icons text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full hover:bg-material-blue-500 transition-colors text-white hover:text-white"
              onClick={() => setShowNotifications(!showNotifications)}
              data-testid="button-notifications"
            >
              <span className="material-icons">{MATERIAL_ICONS.notifications}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 bg-material-green-500">
                <AvatarFallback className="text-white text-sm font-medium">
                  JS
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm" data-testid="text-username">Jane Student</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
