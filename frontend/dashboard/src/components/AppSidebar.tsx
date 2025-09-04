
import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Settings, 
  CreditCard, 
  HelpCircle,
  LogOut,
  Bell,
  Search,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter 
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: TrendingUp,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Payment Links",
    url: "/payment-links",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <Sidebar variant="sidebar" collapsible="icon" collapsed={collapsed} className="flex flex-col">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className={`text-lg font-semibold ${collapsed ? 'hidden' : ''}`}>sBTCPay</div>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setCollapsed(!collapsed)}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <nav className="flex flex-col space-y-2">
          {navigationItems.map((item) => (
            <Button key={item.title} variant="ghost" className="justify-start" onClick={() => window.location.href = item.url}>
              <item.icon className="mr-2 h-4 w-4" />
              <span className={collapsed ? 'hidden' : ''}>{item.title}</span>
            </Button>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className={`flex items-center gap-2 ${collapsed ? 'hidden' : ''}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">admin@sbtcpay.com</span>
          </div>
        </div>
        <Button variant="outline" className={`w-full ${collapsed ? 'hidden' : ''}`} onClick={() => {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
