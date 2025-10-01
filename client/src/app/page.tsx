"use client";

import ConfigurationPanel from "@/components/configuration-panel";
import { Header } from "@/components/header";
import StandupDisplay, { StandupData } from "@/components/standup-display";
import { useEffect, useState } from "react";
import { validateGithubToken, fetchRepos, generateStandupAction } from "./actions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function StandupGenerator() {
  const [repos, setRepos] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [standup, setStandup] = useState<StandupData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);

  useEffect(() => {
    const savedRepos = JSON.parse(localStorage.getItem('selectedRepos') || '[]');
    const savedUsername = localStorage.getItem('githubUsername') || '';
    const savedToken = localStorage.getItem('githubToken') || '';
    const savedInstructions = localStorage.getItem('additionalInstructions') || '';

    setSelectedRepos(savedRepos);
    setUsername(savedUsername);
    setGithubToken(savedToken);
    setAdditionalInstructions(savedInstructions);

    if (savedToken) validateToken(savedToken);
    else setLoadingRepos(false);
  }, []);

  useEffect(() => { localStorage.setItem('selectedRepos', JSON.stringify(selectedRepos)); }, [selectedRepos]);
  useEffect(() => { localStorage.setItem('githubUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem('githubToken', githubToken); }, [githubToken]);
  useEffect(() => { localStorage.setItem('additionalInstructions', additionalInstructions); }, [additionalInstructions]);

  const validateToken = async (token: string) => {
    setValidatingToken(true);
    const valid = await validateGithubToken(token);
    setTokenValid(valid);
    if (!valid) setError('Invalid GitHub token');
    else {
      setError('');
      const repoList = await fetchRepos(token);
      setRepos(repoList);
    }
    setLoadingRepos(false);
    setValidatingToken(false);
  };

  const toggleRepo = (repo: string) => {
    setSelectedRepos(prev => prev.includes(repo) ? prev.filter(r => r !== repo) : [...prev, repo]);
  };

  const generateStandup = async () => {
    if (!username.trim()) return setError('Please enter your GitHub username');
    if (selectedRepos.length === 0) return setError('Please select at least one repository');

    setLoading(true);
    setError('');
    setStandup(null);

    const result = await generateStandupAction({
      repos: selectedRepos,
      github_username: username,
      github_token: githubToken,
      additional_instructions: additionalInstructions,
    });

    if (result) setStandup(result);
    else setError('Failed to generate standup. Please try again.');
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!standup) return;

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let text = `${today}:\n\n`;
    standup.projects.forEach(project => {
      text += `[${project.name}]\n`;
      project.tasks.forEach(task => text += `- ${task}\n`);
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Token Modal */}
      {!tokenValid && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h2 className="text-2xl font-semibold mb-2">GitHub Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your GitHub Personal Access Token to continue.{" "}
              <Link
                href="https://github.com/settings/tokens/new?scopes=repo&description=Standup%20Generator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                Generate a new token here <ExternalLink className="w-4 h-4" />
              </Link>
              .
            </p>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex h-10 w-full rounded-md border px-3 py-2"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
              />
              {error && <div className="text-destructive text-sm">{error}</div>}
              <button
                disabled={validatingToken || !githubToken.trim()}
                onClick={() => validateToken(githubToken)}
                className="w-full bg-primary text-white py-2 rounded-md"
              >
                {validatingToken ? 'Validating...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tokenValid && (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfigurationPanel
              repos={repos}
              selectedRepos={selectedRepos}
              username={username}
              githubToken={githubToken}
              additionalInstructions={additionalInstructions}
              loading={loading}
              loadingRepos={loadingRepos}
              error={error}
              onUsernameChange={setUsername}
              onTokenChange={setGithubToken}
              onInstructionsChange={setAdditionalInstructions}
              onRepoToggle={toggleRepo}
              onGenerate={generateStandup}
            />
            <StandupDisplay
              standup={standup}
              loading={loading}
              onCopy={copyToClipboard}
              copied={copied}
            />
          </div>
        </div>
      )}
    </div>
  );
}
