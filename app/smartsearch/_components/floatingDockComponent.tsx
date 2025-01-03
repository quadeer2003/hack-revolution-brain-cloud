"use client"
import { FloatingDock } from "@/components/ui/floating-dock"
import React from 'react';

import { IconHome, IconSearch, IconEye, IconSquare } from '@tabler/icons-react';

export const dockItems = [
  { title: "Explore", icon: <IconHome />, href: "/explore" },
  { title: "Smart Search", icon: <IconSearch />, href: "/smartSearch" },
  { title: "Canvas", icon: <IconSquare />, href: "/canvas" },
  { title: "Visualize", icon: <IconEye />, href: "/visualize" },
];


function FloatingDockComponent() {
  return (
    <div>
      <FloatingDock items={dockItems} desktopClassName="" mobileClassName="bottom-0 right-0"/>
    </div>
  );
}

export default FloatingDockComponent;
