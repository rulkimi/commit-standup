// app/actions.ts
"use server";

export async function validateGithubToken(token: string) {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) throw new Error('Invalid token');
    return true;
  } catch {
    return false;
  }
}

export async function fetchRepos(token: string) {
  try {
    const res = await fetch(`${process.env.API_URL}/repos?github_token=${token}`);
    if (!res.ok) throw new Error('Failed to fetch repos');
    const data = await res.json();
    return data.repositories || [];
  } catch {
    return [];
  }
}

export async function generateStandupAction({
  repos,
  github_username,
  github_token,
  additional_instructions,
  since,
  until,
}: {
  repos: string[];
  github_username: string;
  github_token: string;
  additional_instructions: string;
  since?: string;
  until?: string;
}) {
  try {
    const res = await fetch(`${process.env.API_URL}/generate-standup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repos, github_username, github_token, additional_instructions, since, until }),
    });
    const data = await res.json();
    if (data.data.error) {
      return {
        "error": data.data.error
      }
    }
    return data.data;
  } catch {
    return null;
  }
}

export async function sendDiscordNotification({
  message,
  username,
  avatar_url
}: {
  message: string;
  username?: string;
  avatar_url?: string;
}) {
  try {
    const res = await fetch(`${process.env.API_URL}/notify-discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, username, avatar_url }),
    });

    const data = await res.json();

    if (data.status !== "success") {
      return { error: data.details || "Failed to send Discord message" };
    }

    return { success: true };
  } catch {
    return { error: "Network Error" };
  }
}
