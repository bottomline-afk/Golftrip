export const theme = {
  colors: {
    void: '#0a0a1a',
    surface: '#1a1a2e',
    surfaceLight: '#2a2a4e',
    neonPink: '#ff00ff',
    neonCyan: '#00ffff',
    neonGreen: '#39ff14',
    neonYellow: '#ffff00',
    neonOrange: '#ff6600',
    retroPurple: '#6b00b3',
    white: '#ffffff',
    dimWhite: '#b0b0c0',
  },
  fonts: {
    heading: "'Press Start 2P', monospace",
    body: "'VT323', monospace",
  },
  glows: {
    pink: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff',
    cyan: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
    green: '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 40px #39ff14',
    yellow: '0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 40px #ffff00',
    orange: '0 0 10px #ff6600, 0 0 20px #ff6600, 0 0 40px #ff6600',
  },
} as const;

export const teamColors = {
  team1: { primary: theme.colors.neonCyan, bg: 'bg-neon-cyan/10', text: 'text-neon-cyan', border: 'border-neon-cyan' },
  team2: { primary: theme.colors.neonPink, bg: 'bg-neon-pink/10', text: 'text-neon-pink', border: 'border-neon-pink' },
} as const;
