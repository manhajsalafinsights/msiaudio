import * as React from "react";
import { cn } from "@/utils/cn";

interface TabsProps {
  value: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const tabsContext = React.useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={tabsContext}>
      <div className={cn("flex flex-col gap-2", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: selected, onValueChange } = React.useContext(TabsContext)!;
  const selectedValue = selected === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selectedValue}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
        "transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        selectedValue
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selected } = React.useContext(TabsContext)!;
  if (selected !== value) return null;

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={cn("mt-2", className)}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange?: (value: string) => void;
} | null>(null);
