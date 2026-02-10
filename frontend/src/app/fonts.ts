import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

/**
 * Primary font: Space Grotesk
 * Distinctive geometric grotesque with modern technical feel
 * Used for headings, body text, UI elements
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

/**
 * Monospace font: JetBrains Mono
 * Used for code, metrics, technical data
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});
