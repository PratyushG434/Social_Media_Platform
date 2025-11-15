export const getAccessToken = () => {
    return sessionStorage.getItem('accessToken');
}

export const getRefreshToken = () => {
    return sessionStorage.getItem('refreshToken');
}

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return '?'; 
  }
  const words = name.trim().split(' ');
  if (words.length > 1 && words[1]) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export const generateColorFromString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  const index = Math.abs(hash % colors.length);
  return colors[index];
};
