import { Lightbulb } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-bold">CodeLeap</h1>
        </div>
        {/* Placeholder for potential future actions like theme toggle or user profile */}
      </div>
    </header>
  );
}
