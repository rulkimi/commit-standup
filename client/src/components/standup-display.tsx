"use client"

import { Check, Copy, Github, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { sendDiscordNotification } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

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
  githubUsername: string;
}

function formatStandupAsText(standup: StandupData | null) {
  if (!standup) return "";

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `${dateStr}\n\n` + standup.projects
    .map(
      (project) =>
        `**${project.name}**\n` +
        project.tasks.map((task) => `• ${task}`).join("\n")
    )
    .join("\n\n");
}

export default function StandupDisplay({ standup, loading, onCopy, copied, error, githubUsername }: StandupDisplayProps) {
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  async function handlePostToDiscord() {
    if (!standup) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const isBefore530 = hours < 17 || (hours === 17 && minutes < 30);

    if (isBefore530) {
      setShowTimeWarning(true);
      return;
    }

    await actuallyPost();
  }

  async function actuallyPost() {
    setPosting(true);
    setPostError(null);

    const res = await sendDiscordNotification({
      message: formatStandupAsText(standup!),
      username: githubUsername || "Standup Bot",
    });

    setPosting(false);

    if (res.error) {
      setPostError(res.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Generated Standup</CardTitle>
            <CardDescription>
              {standup ? "Your daily standup summary" : "Results will appear here"}
            </CardDescription>
          </div>

          {standup && !error && (
            <Button onClick={onCopy} variant="outline" size="sm">
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

      <CardContent className="space-y-6">
        {/* Error State */}
        {error && (
          <div className="text-center py-12 text-destructive">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!standup && !loading && !error && (
          <div className="text-center py-12 text-muted-foreground">
            <Github className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Configure your settings and click &quot;Generate Standup&quot;</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your commits...</p>
          </div>
        )}

        {/* Standup */}
        {standup && !error && (
          <>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
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
          </>
        )}
      </CardContent>

      {/* Footer Actions */}
      {standup && !error && (
        <div className="border-t p-4 flex flex-col gap-2">
          {postError && (
            <div className="text-destructive text-sm">
              ❌ Failed to post to Discord: {postError}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handlePostToDiscord}
              variant="outline"
              size="sm"
              disabled={posting}
            >
              {posting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Image
                  src="https://img.icons8.com/?size=100&id=2mIgusGquJFz&format=png&color=000000"
                  alt="Discord"
                  width={24}
                  height={24}
                  className="w-4 h-4 mr-2"
                />
              )}
              {posting ? "Posting..." : "Post to Discord"}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post before 5:30 PM?</AlertDialogTitle>
            <AlertDialogDescription>
              It’s currently{" "}
              {new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              . Are you sure you want to post to Discord now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowTimeWarning(false);
                actuallyPost();
              }}
            >
              Post Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
