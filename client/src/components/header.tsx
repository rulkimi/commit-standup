import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8" />
          <h1 className="text-xl font-semibold">Daily Standup Generator</h1>
        </div>
      </div>
    </header>
  );
}