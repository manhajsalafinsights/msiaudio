"use client";

import { cn } from "@/utils/cn";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ items, activeTab, onTabChange }: TabsProps) {
  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Tab buttons */}
      <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "tab-button shrink-0",
              activeTab === item.id && "active",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={activeTab}
        className="animate-fade-in"
      >
        {activeItem?.content}
      </div>
    </div>
  );
}
