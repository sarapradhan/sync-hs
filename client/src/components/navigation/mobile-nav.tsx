import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MATERIAL_ICONS } from "@/lib/constants";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: MATERIAL_ICONS.dashboard },
    { path: "/assignments", label: "Tasks", icon: MATERIAL_ICONS.assignment },
    { path: "/calendar", label: "Calendar", icon: MATERIAL_ICONS.calendar },
    { path: "/subjects", label: "Subjects", icon: "color_lens" },
    { path: "/settings", label: "Settings", icon: MATERIAL_ICONS.settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`flex flex-col items-center py-2 px-4 ${
                location === item.path 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-black'
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <span className="material-icons text-sm">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
