import { Check, Copy, Github, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";


export interface Project {
  name: string;
  tasks: string[];
}

export interface StandupData {
  projects: Project[];
}

interface StandupDisplayProps {
  standup: StandupData | null;
  loading: boolean;
  onCopy: () => void;
  copied: boolean;
  error: string;
}

export default function StandupDisplay({ standup, loading, onCopy, copied, error }: StandupDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Standup</CardTitle>
            <CardDescription>
              {standup ? 'Your daily standup summary' : 'Results will appear here'}
            </CardDescription>
          </div>
          {standup && !error && (
            <Button
              onClick={onCopy}
              variant="outline"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center py-12 text-destructive">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!standup && !loading && !error && (
          <div className="text-center py-12 text-muted-foreground">
            <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Configure your settings and click &quot;Generate Standup&quot;</p>
          </div>
        )}

        {loading && !error && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your commits...</p>
          </div>
        )}

        {standup && !error && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            {standup.projects.map((project, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <h3 className="font-semibold text-primary mb-2 font-mono">
                  [{project.name}]
                </h3>
                <ul className="space-y-1">
                  {project.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} className="text-sm flex items-start">
                      <span className="mr-2 text-muted-foreground">-</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
