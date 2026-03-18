const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Resuelve el avatar a URL completa: soporta URLs externas, rutas de API, base64 legacy, y nombres de archivo simples
export function getAvatarUrl(avatarImage: string | undefined | null): string {
  if (!avatarImage) return '/root-images/default.png';

  if (avatarImage.startsWith('http://') || avatarImage.startsWith('https://')) {
    return avatarImage;
  }

  if (avatarImage.startsWith('data:image/')) {
    return avatarImage;
  }

  if (avatarImage.startsWith('/api/avatars/')) {
    return `${API_URL.replace('/api', '')}${avatarImage}`;
  }

  return `/root-images/${avatarImage}`;
}

export function getClassDefaultAvatar(className: string): string {
  return `${className.toLowerCase()}.png`;
}
