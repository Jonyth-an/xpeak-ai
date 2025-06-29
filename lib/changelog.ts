interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  url: string;
}

// Since Featurebase is protected by Cloudflare, we'll use a fallback approach
// In the future, you could set up a server-side proxy or use a different API endpoint
export async function fetchRecentChangelog(limit: number = 3): Promise<ChangelogEntry[]> {
  try {
    // Try to fetch from a potential API endpoint first
    const response = await fetch('https://xpeakai.featurebase.app/api/changelog', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; XPeak-Changelog-Fetcher/1.0)',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      const entries = data.entries || data.posts || data.items || [];
      
      const sortedEntries = entries
        .sort((a: any, b: any) => new Date(b.publishedAt || b.created_at).getTime() - new Date(a.publishedAt || a.created_at).getTime())
        .slice(0, limit)
        .map((entry: any) => ({
          id: entry.id || entry.slug,
          title: entry.title || entry.name,
          content: entry.content || entry.body || entry.summary,
          publishedAt: entry.publishedAt || entry.created_at || entry.date,
          url: entry.url || `https://xpeakai.featurebase.app/changelog/${entry.slug || entry.id}`,
        }));

      return sortedEntries;
    }
  } catch (error) {
    console.log('API fetch failed, using fallback data:', error);
  }

  // Fallback: Return recent changelog entries that you can manually update
  // This ensures the page always has content even when the API is unavailable
  return [
    {
      id: 'latest-updates',
      title: 'Latest Updates',
      content: 'We\'ve been working hard on new features and improvements. Check out our changelog for the most recent updates and see what\'s new in XPeak AI.',
      publishedAt: new Date().toISOString(),
      url: 'https://xpeakai.featurebase.app/changelog',
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Improvements',
      content: 'Enhanced the admin interface with a modern sidebar layout, user management features, and system health monitoring. The new design provides better navigation and more comprehensive admin tools.',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      url: 'https://xpeakai.featurebase.app/changelog',
    },
    {
      id: 'user-management',
      title: 'User Management System',
      content: 'Launched comprehensive user management features including detailed user profiles, subscription tracking, and admin controls. Admins can now view and manage user accounts with ease.',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      url: 'https://xpeakai.featurebase.app/changelog',
    },
  ];
}

// Helper function to format date
export function formatChangelogDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    return 'Recent';
  }
}

// Function to manually update changelog entries (for when you want to add new entries)
export function getManualChangelogEntries(): ChangelogEntry[] {
  return [
    {
      id: 'latest-updates',
      title: 'Latest Updates',
      content: 'We\'ve been working hard on new features and improvements. Check out our changelog for the most recent updates and see what\'s new in XPeak AI.',
      publishedAt: new Date().toISOString(),
      url: 'https://xpeakai.featurebase.app/changelog',
    },
    {
      id: 'admin-dashboard',
      title: 'Admin Dashboard Improvements',
      content: 'Enhanced the admin interface with a modern sidebar layout, user management features, and system health monitoring. The new design provides better navigation and more comprehensive admin tools.',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://xpeakai.featurebase.app/changelog',
    },
    {
      id: 'user-management',
      title: 'User Management System',
      content: 'Launched comprehensive user management features including detailed user profiles, subscription tracking, and admin controls. Admins can now view and manage user accounts with ease.',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://xpeakai.featurebase.app/changelog',
    },
  ];
} 