import { Dock, DockIcon } from "@/components/ui/dock";
import { 
  BookOpen, 
  Search, 
  PenLine, 
  Share2, 
  FolderTree, 
  Palette,
  Network,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useMotionValue } from "framer-motion";

interface FloatingDockProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { name: "Knowledge Base", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Smart Search", icon: <Search className="w-5 h-5" /> },
  { name: "Published Notes", icon: <Share2 className="w-5 h-5" /> },
  { name: "Add New Thought", icon: <PenLine className="w-5 h-5" /> },
  { name: "Canvas", icon: <Palette className="w-5 h-5" /> },
  { name: "Graph View", icon: <Network className="w-5 h-5" /> },
];

export default function FloatingDock({ activeSection, setActiveSection }: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <TooltipProvider>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <Dock className="!flex-col !h-auto !w-[58px] !mt-0">
          {menuItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <DockIcon
                  mouseX={mouseX}
                  className={`${
                    activeSection === item.name.toLowerCase()
                      ? "bg-zinc-100 dark:bg-gray-900"
                      : "hover:bg-zinc-50 dark:hover:bg-gray-900/50"
                  }`}
                  onClick={() => setActiveSection(item.name.toLowerCase())}
                >
                  {item.icon}
                </DockIcon>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </Dock>
      </div>
    </TooltipProvider>
  );
} 