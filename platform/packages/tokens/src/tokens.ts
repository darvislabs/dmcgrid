export const colors = {
  primary: {
    midnight: '#0B0F14',
    slate: '#1F2937',
    sandGold: '#D4B483',
    ivory: '#F7F3E9',
    stone: '#9CA3AF',
    earth: '#3A3F36',
  },
  neutral: {
    50: '#F3F5F7',
    100: '#E8ECF0',
    200: '#D2D9DF',
    300: '#B4BDC5',
    400: '#9CA3AF',
    500: '#71808B',
    600: '#55636E',
    700: '#3E4A54',
    800: '#2A3441',
    850: '#232D39',
    900: '#1F2937',
    950: '#0B0F14',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    teal: '#0EA5A3',
    sunset: '#F97316',
  },
  surface: {
    line: '#2A3441',
    lineSoft: '#232D39',
    lineLight: '#D6E0E3',
  },
} as const;

export const radii = {
  card: '14px',
  btn: '9px',
  input: '9px',
  pill: '999px',
} as const;

export const typography = {
  fonts: {
    primary: "'Satoshi', 'Cabinet Grotesk', Inter, system-ui, sans-serif",
    secondary: "'Cabinet Grotesk', 'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
  scale: {
    h1: '56px',
    h2: '40px',
    h3: '28px',
    h4: '20px',
    bodyL: '18px',
    body: '16px',
    cap: '14px',
    over: '12px',
  },
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
} as const;

export const motion = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  buttonDuration: '160ms',
} as const;
