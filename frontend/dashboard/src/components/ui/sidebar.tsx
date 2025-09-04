"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sidebarVariants = cva(
  "fixed top-0 z-50 h-full transition-transform duration-300 ease-in-out",
  {
    variants: {
      side: {
        left: "left-0",
        right: "right-0",
      },
      variant: {
        sidebar: "w-72 border-r bg-background",
        floating: "m-4 w-80 rounded-lg border bg-background shadow-lg",
        inset: "inset-y-4 left-4 w-80 rounded-lg border bg-background",
      },
      collapsible: {
        none: "",
        icon: "data-[collapsed=true]:w-16",
        offcanvas: "data-[collapsed=true]:-translate-x-full",
      },
    },
    defaultVariants: {
      side: "left",
      variant: "sidebar",
      collapsible: "offcanvas",
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsed: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, side, variant, collapsible, collapsed, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sidebarVariants({ side, variant, collapsible, className }))}
      data-collapsed={collapsed}
      style={{ backgroundColor: '#1a1a1a' }}
      {...props}
    />
  )
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky top-0 p-4", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-4", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky bottom-0 p-4", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter };