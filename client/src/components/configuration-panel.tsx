import { Loader2, AlertTriangle } from "lucide-react";
import RepositoryList from "./repository-list";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import DatePicker from "./date-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";

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
  additionalInstructions,
  loading,
  loadingRepos,
  error,
  since,
  until,
  onUsernameChange,
  onInstructionsChange,
  onRepoToggle,
  onGenerate,
  onSinceChange,
  onUntilChange
}: ConfigurationPanelProps) {
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Calculate date range in days
  const getDateRangeDays = () => {
    if (!since || !until) return 0;
    const diffTime = Math.abs(until.getTime() - since.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleGenerateClick = () => {
    const rangeDays = getDateRangeDays();
    
    // Show warning if date range exceeds 7 days
    if (rangeDays > 7) {
      setShowWarningDialog(true);
    } else {
      onGenerate();
    }
  };

  const handleConfirmGenerate = () => {
    setShowWarningDialog(false);
    onGenerate();
  };

  return (
    <>
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

          {getDateRangeDays() > 7 && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Date range exceeds 7 days ({getDateRangeDays()} days selected). This may take longer to generate.
              </AlertDescription>
            </Alert>
          )}

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
            onClick={handleGenerateClick}
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

      {/* Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Long Date Range Selected
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p>
                You&apos;ve selected a date range of <strong>{getDateRangeDays()} days</strong>, which is longer than a week.
              </p>
              <p>
                <strong>Please note:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>This may take significantly longer to generate your commits</li>
                <li>The response might be very long and could exceed Discord&apos;s character limit (2000 characters)</li>
                <li>If Discord fails to send the message, consider choosing a shorter date range or adding additional instructions to make the output more concise</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGenerate}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}