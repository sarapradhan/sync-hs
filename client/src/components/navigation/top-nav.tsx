import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MATERIAL_ICONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface TopNavProps {
  onAddAssignment: () => void;
}

export function TopNav({ onAddAssignment }: TopNavProps) {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/current"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const switchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", "/api/users/switch", { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/current"] });
    },
  });

  const handleUserSwitch = (userId: string) => {
    if (userId !== (currentUser as any)?.id) {
      switchUserMutation.mutate(userId);
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: MATERIAL_ICONS.dashboard },
    { path: "/assignments", label: "Assignments", icon: MATERIAL_ICONS.assignment },
    { path: "/calendar", label: "Calendar", icon: MATERIAL_ICONS.calendar },
    { path: "/subjects", label: "Subjects", icon: "color_lens" },
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
              <h1 className="text-xl font-medium" data-testid="app-title">Zoo</h1>
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
            {/* User Switcher */}
            <Select 
              value={(currentUser as any)?.id || ""} 
              onValueChange={handleUserSwitch}
            >
              <SelectTrigger className="w-auto bg-transparent border-none text-white hover:bg-material-blue-500 focus:ring-0 focus:ring-offset-0">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8 bg-material-green-500">
                    <AvatarFallback className="text-white text-sm font-medium">
                      {(currentUser as any)?.name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm" data-testid="text-username">
                    {(currentUser as any)?.name || "Loading..."}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {(users as User[]).map((user: User) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6 bg-material-green-500">
                        <AvatarFallback className="text-white text-xs font-medium">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full hover:bg-material-blue-500 transition-colors text-white hover:text-white"
              onClick={() => setShowNotifications(!showNotifications)}
              data-testid="button-notifications"
            >
              <span className="material-icons">{MATERIAL_ICONS.notifications}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
