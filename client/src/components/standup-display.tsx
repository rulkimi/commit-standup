"use client";

import { Check, Copy, Github, Loader2, Pencil, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
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
import DatePicker from "./date-picker";

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
  error: string;
  githubUsername: string;
}

export default function StandupDisplay({
  standup,
  loading,
  error,
  githubUsername,
}: StandupDisplayProps) {
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [text, setText] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [bodyText, setBodyText] = useState("");
  const [renderProjects, setRenderProjects] = useState<Project[] | null>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarValid, setAvatarValid] = useState<boolean | null>(null);

  // Load avatar from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("standup_avatar");
      if (stored) setAvatarUrl(stored);
    }
  }, []);

  // Save avatar to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (avatarUrl) {
        localStorage.setItem("standup_avatar", avatarUrl);
      } else {
        localStorage.removeItem("standup_avatar");
      }
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (!avatarUrl) {
      setAvatarValid(null);
      return;
    }
    const img = new window.Image();
    img.src = avatarUrl;
    img.onload = () => setAvatarValid(true);
    img.onerror = () => setAvatarValid(false);
  }, [avatarUrl]);

  function formatToReadable(date: Date) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function rebuildText() {
    setText(`${formatToReadable(date)}:\n\n${bodyText.trim()}`);
  }

  function parseBodyText(rawText: string): Project[] {
    const lines = rawText.split("\n");
    const projects: Project[] = [];
    let currentProject: Project | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const projectMatch = trimmed.match(/^\[(.+)\]$/);
      if (projectMatch) {
        if (currentProject?.tasks.length) {
          projects.push(currentProject);
        }
        currentProject = { name: projectMatch[1], tasks: [] };
      } else if (currentProject) {
        const task = trimmed.replace(/^[-*]\s*/, "");
        if (task) currentProject.tasks.push(task);
      }
    }

    if (currentProject?.tasks.length) {
      projects.push(currentProject);
    }

    return projects;
  }

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handlePostToDiscord() {
    if (!text) return;

    const now = new Date();
    const isBefore530 = now.getHours() < 17 || (now.getHours() === 17 && now.getMinutes() < 30);

    if (isBefore530) {
      setShowTimeWarning(true);
      return;
    }

    await actuallyPost();
  }

  async function actuallyPost() {
    setPosting(true);
    setPostError(null);
    setCopiedSuccess(false);

    const res = await sendDiscordNotification({
      message: text,
      username: githubUsername || "Standup Bot",
      avatar_url: avatarUrl && avatarValid ? avatarUrl : "",
    });

    setPosting(false);

    if (res.error) {
      setPostError(res.error);
    } else {
      // ✅ Auto copy standup
      navigator.clipboard.writeText(text);
      setCopiedSuccess(true);

      // Hide the copied banner after 2-3 seconds
      setTimeout(() => {
        setCopiedSuccess(false);
        // ✅ Redirect to HR portal in new tab
        window.open("https://hrp.ewbg.eu/task-tracker/create", "_blank");
      }, 3000);
    }
  }


  useEffect(() => {
    if (standup) {
      const today = new Date();
      setDate(today);

      let formatted = `${formatToReadable(today)}:\n\n`;
      standup.projects.forEach((project) => {
        formatted += `[${project.name}]\n`;
        project.tasks.forEach((task) => {
          formatted += `- ${task}\n`;
        });
        formatted += `\n`;
      });

      const full = formatted.trim();
      setText(full);

      const lines = full.split("\n");
      setBodyText(lines.slice(2).join("\n"));

      setRenderProjects(standup.projects);
    }
  }, [standup]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary">Generated Standup</CardTitle>
            <CardDescription>
              {standup ? "Your daily standup summary" : "Results will appear here"}
            </CardDescription>
          </div>

          {standup && !error && (
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    rebuildText();
                    setRenderProjects(parseBodyText(bodyText));
                  }
                  setIsEditing((prev) => !prev);
                }}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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
          <>
            {isEditing ? (
              <>
                <DatePicker
                  label="Date"
                  date={date}
                  onChange={(d) => {
                    if (d) setDate(d);
                  }}
                />

                <Textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">{formatToReadable(date)}</div>

                {(renderProjects ?? standup.projects).map((project, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-semibold text-primary mb-2 font-mono">[{project.name}]</h3>
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
          </>
        )}
      </CardContent>

      {standup && !error && (
        <div className="border-t p-4 flex flex-col gap-3">
          {postError && <div className="text-destructive text-sm">❌ {postError}</div>}

          {copiedSuccess && (
            <div className="flex items-start gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-green-700 text-sm animate-fade-in">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">✅ Standup posted to Discord and copied to clipboard!</p>
                <p className="animate-pulse">Redirecting to your HR portal...</p>
              </div>
            </div>
          )}

          {/* Avatar input section */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="avatarUrl">Discord Avatar (optional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.png"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1"
              />
              {avatarUrl && avatarValid && (
                <Image
                  src={avatarUrl}
                  alt="Avatar preview"
                  width={32}
                  height={32}
                  className="rounded-full border object-cover"
                />
              )}
            </div>
            {avatarUrl && avatarValid === false && (
              <p className="text-xs text-destructive">❌ Could not load image. Please check the URL.</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave blank to use the default bot avatar. You can find free icons at{" "}
              <a
                href="https://icons8.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Icons8
              </a>.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePostToDiscord} variant="outline" size="sm" disabled={posting}>
              {posting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Image
                  src="https://img.icons8.com/?size=100&id=2mIgusGquJFz&format=png&color=000000"
                  alt="Discord"
                  width={24}
                  height={24}
                  className="w-4 h-4 mr-1"
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
