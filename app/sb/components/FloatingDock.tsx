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

interface FloatingDockProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
    { name: "Canvas", icon: <Palette className="w-5 h-5" /> },
  { name: "PARA Space", icon: <FolderTree className="w-5 h-5" /> },
  { name: "Graph View", icon: <Network className="w-5 h-5" /> },
];

export default function FloatingDock({ activeSection, setActiveSection }: FloatingDockProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <Dock className="!flex-col !h-auto !w-[58px] !mt-0">
        {menuItems.map((item) => (
          <DockIcon
            key={item.name}
            className={`${
              activeSection === item.name.toLowerCase()
                ? "bg-zinc-100 dark:bg-gray-900"
                : "hover:bg-zinc-50 dark:hover:bg-gray-900/50"
            }`}
            onClick={() => setActiveSection(item.name.toLowerCase())}
          >
            {item.icon}
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
} 