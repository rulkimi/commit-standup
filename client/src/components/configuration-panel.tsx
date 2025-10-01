import { Loader2 } from "lucide-react";
import RepositoryList from "./repository-list";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import DatePicker from "./date-picker";

interface ConfigurationPanelProps {
  repos: string[];
  selectedRepos: string[];
  username: string;
  additionalInstructions: string;
  loading: boolean;
  loadingRepos: boolean;
  error: string;
  since: Date | undefined;
  until: Date | undefined;
  onUsernameChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onRepoToggle: (repo: string) => void;
  onGenerate: () => void;
  onSinceChange: (date: Date | undefined) => void;
  onUntilChange: (date: Date | undefined) => void;
}


export default function ConfigurationPanel({
  repos,
  selectedRepos,
  username,
  // githubToken, // ✅ NEW
  additionalInstructions,
  loading,
  loadingRepos,
  error,
  since,
  until,
  onUsernameChange,
  // onTokenChange, // ✅ NEW
  onInstructionsChange,
  onRepoToggle,
  onGenerate,
  onSinceChange,
  onUntilChange
}: ConfigurationPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Select repositories and configure your standup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            GitHub Username
          </label>
          <Input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="octocat"
          />
        </div>
{/* 
        <div>
          <label className="block text-sm font-medium mb-2">
            GitHub Token (Optional, but recommended for private repos)
          </label>
          <Input
            type="password"
            value={githubToken}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxx"
          />
        </div> */}

        <RepositoryList
          repos={repos}
          selectedRepos={selectedRepos}
          onToggle={onRepoToggle}
          loading={loadingRepos}
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Since"
            date={since}
            onChange={onSinceChange}
          />
          <DatePicker
            label="Until"
            date={until}
            onChange={onUntilChange}
          />
        </div>


        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Instructions (Optional)
          </label>
          <Textarea
            value={additionalInstructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="e.g., Focus on user-facing features, mention ticket numbers..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          onClick={onGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Standup'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
