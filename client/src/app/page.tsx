"use client"

import ConfigurationPanel from "@/components/configuration-panel";
import { Header } from "@/components/header";
import StandupDisplay, { StandupData } from "@/components/standup-display";
import { useEffect, useState } from "react";

export default function StandupGenerator() {
  const [repos, setRepos] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(true);
  const [standup, setStandup] = useState<StandupData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [validatingToken, setValidatingToken] = useState<boolean>(false);

  // Load saved state on mount
  useEffect(() => {
    const savedRepos = JSON.parse(localStorage.getItem('selectedRepos') || '[]');
    const savedUsername = localStorage.getItem('githubUsername') || '';
    const savedToken = localStorage.getItem('githubToken') || '';
    const savedInstructions = localStorage.getItem('additionalInstructions') || '';
    
    setSelectedRepos(savedRepos);
    setUsername(savedUsername);
    setGithubToken(savedToken);
    setAdditionalInstructions(savedInstructions);

    if (savedToken) {
      validateToken(savedToken);
    } else {
      setLoadingRepos(false);
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => { localStorage.setItem('selectedRepos', JSON.stringify(selectedRepos)); }, [selectedRepos]);
  useEffect(() => { localStorage.setItem('githubUsername', username); }, [username]);
  useEffect(() => { localStorage.setItem('githubToken', githubToken); }, [githubToken]);
  useEffect(() => { localStorage.setItem('additionalInstructions', additionalInstructions); }, [additionalInstructions]);

  // Validate GitHub token
  const validateToken = async (token: string) => {
    setValidatingToken(true);
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      if (res.ok) {
        setTokenValid(true);
        setError('');
        fetchRepos(token);
      } else {
        setTokenValid(false);
        setError('Invalid GitHub token');
        setLoadingRepos(false);
      }
    } catch (err) {
      setTokenValid(false);
      setError('Error validating token');
      setLoadingRepos(false);
    } finally {
      setValidatingToken(false);
    }
  }

  const fetchRepos = async (token: string) => {
    setLoadingRepos(true);
    try {
      const response = await fetch(`http://localhost:8000/repos?github_token=${token}`);
      const data = await response.json();
      setRepos(data.repositories || []);
    } catch (err) {
      setError('Failed to fetch repositories');
    } finally {
      setLoadingRepos(false);
    }
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

    const payload = {
      repos: selectedRepos,
      github_username: username,
      github_token: githubToken,
      additional_instructions: additionalInstructions
    };

    try {
      const response = await fetch('http://localhost:8000/generate-standup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setStandup(data.data);
    } catch (err) {
      setError('Failed to generate standup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!standup) return;

    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

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
              Enter your GitHub Personal Access Token to continue. This is required to fetch your repositories and commits.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="token" className="text-sm font-medium mb-2 block">
                  Personal Access Token
                </label>
                <input
                  id="token"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Need a token?</p>
                <p className="text-muted-foreground mb-2">
                  Create a token with <code className="bg-background px-1 py-0.5 rounded">repo</code> scope access.
                </p>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Standup%20Generator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Generate token on GitHub
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <button
                disabled={validatingToken || !githubToken.trim()}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onClick={() => validateToken(githubToken)}
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
