const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Resolves an avatar image value to a full displayable URL.
 *
 * Supports 3 formats:
 * - Full URL (http/https): returned as-is
 * - API path (/api/avatars/...): prefixed with API base URL
 * - Filename (e.g. "adventurer.png"): resolved to /root-images/{filename}
 * - Empty/null: returns default placeholder
 */
export function getAvatarUrl(avatarImage: string | undefined | null): string {
  if (!avatarImage) return '/root-images/default.png';

  // Full external URL
  if (avatarImage.startsWith('http://') || avatarImage.startsWith('https://')) {
    return avatarImage;
  }

  // Base64 data (legacy support)
  if (avatarImage.startsWith('data:image/')) {
    return avatarImage;
  }

  // API endpoint for uploaded avatars
  if (avatarImage.startsWith('/api/avatars/')) {
    return `${API_URL.replace('/api', '')}${avatarImage}`;
  }

  // Simple filename → class default image from public/root-images/
  return `/root-images/${avatarImage}`;
}

/**
 * Get the default avatar image filename for a given class name.
 * Maps class name to the corresponding image in public/root-images/
 */
export function getClassDefaultAvatar(className: string): string {
  return `${className.toLowerCase()}.png`;
}
