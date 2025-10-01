import { Loader2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface RepositoryListProps {
  repos: string[];
  selectedRepos: string[];
  onToggle: (repo: string) => void;
  loading: boolean;
}

export default function RepositoryList({ repos, selectedRepos, onToggle, loading }: RepositoryListProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Select Repositories
      </label>
      <div className="border rounded-md bg-background max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            <p className="text-sm mt-2">Loading repositories...</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No repositories found
          </div>
        ) : (
          repos.map(repo => (
            <label
              key={repo}
              className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
            >
              <Checkbox
                checked={selectedRepos.includes(repo)}
                onCheckedChange={() => onToggle(repo)}
              />
              <span className="text-sm font-mono">{repo}</span>
            </label>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedRepos.map(repo => (
          <span
            key={repo}
            className="px-2 py-0.5 bg-accent text-xs rounded font-mono"
          >
            {repo}
          </span>
        ))}
      </div>
    </div>
  );
}