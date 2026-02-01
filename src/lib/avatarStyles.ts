export interface AvatarStyle {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export const AVATAR_STYLES: AvatarStyle[] = [
  {
    id: 'glossy-poster',
    label: 'Glossy Poster',
    description: 'Sports trading card with airbrushed highlights',
    prompt:
      "Create a high-energy golf avatar portrait based on my reference photo. Half-body, facing camera with a confident smile, wearing my golf hat and athletic hoodie. Stylize as a glossy sports poster / trading-card illustration: airbrushed highlights, subtle halftone texture, vibrant gradient background with diagonal light streaks, crisp rim lighting, and a faint vignette. Add a minimal badge shape behind the head and soft bokeh flares. No text, no dates, no explicit decade references. Ultra-clean edges, print-ready. 512x512.",
  },
  {
    id: 'cinematic-chrome',
    label: 'Cinematic Chrome',
    description: 'Bold cinematic lighting with chrome geometric accents',
    prompt:
      "Generate a stylized golf avatar from my photo with bold, cinematic lighting. Use a vibrant teal-to-magenta gradient backdrop with soft glow and lens flare. Add airbrush-style shading and a slight halftone grain. Include chrome-like geometric accents (thin lines, triangles) and a subtle motion-streak pattern. Keep face likeness and hat shape recognizable. No words or numbers. Poster-like finish, high contrast, sharp. 512x512.",
  },
  {
    id: 'airbrushed-print',
    label: 'Airbrushed Print',
    description: 'Premium sports poster with smooth blended shading',
    prompt:
      "Turn my golf photo into an airbrushed illustration with smooth blended shading and glossy highlights, like a premium sports poster print. Warm skin tones, crisp eyes, slightly exaggerated clean contours. Background: luminous gradient with soft clouds of color and faint diagonal streaks. Add a subtle paper grain + halftone texture overlay. No text. Clean composition, centered subject. 512x512.",
  },
  {
    id: 'heroic-dramatic',
    label: 'Heroic Dramatic',
    description: 'Low-angle heroic poster with dramatic light beams',
    prompt:
      "Create a dynamic golf avatar from my photo with a heroic poster composition: slightly low camera angle, strong rim light, dramatic gradient backdrop with light beams and mild fog. Airbrushed highlights, halftone grain, subtle vignette. Keep outfit and hat, enhance athletic silhouette. No text, no logos, no dates. 512x512.",
  },
  {
    id: 'cartoon-sitcom',
    label: 'Cartoon Sitcom',
    description: 'Bright cartoon character with warm cel shading',
    prompt:
      "512x512. Create a golf avatar based on my reference photo. Stylize as a bright, prime-time cartoon sitcom character: warm yellow-toned skin, bold clean outlines, simplified facial features, slightly enlarged eyes, soft cel shading, minimal texture. Keep my recognizable smile and hat silhouette. Background: simple pastel gradient with a few minimal shapes. No text, no logos, no brand marks. Crisp vector-like finish.",
  },
  {
    id: 'paper-cutout',
    label: 'Paper Cutout',
    description: 'Comedic cutout-paper style with flat colors',
    prompt:
      "512x512. Turn my reference photo into a comedic cutout-paper style avatar: very simple rounded shapes, flat colors, minimal shading, thick black outlines, small dot eyes, and a simplified mouth expression that still resembles my smile. Keep the hat and hoodie as simplified blocks of color. Background: flat solid color with a subtle paper texture. No text, no logos.",
  },
  {
    id: 'game-select',
    label: 'Game Select',
    description: 'Character select screen with painterly game key-art',
    prompt:
      '512x512. Create a stylized "character select" golf avatar from my reference photo: dynamic three-quarter pose, confident grin, dramatic rim lighting, high-contrast shading, and painterly-but-clean edges. Add energetic motion streaks and a bold gradient background with subtle particle sparks. Keep facial likeness and hat shape recognizable. No text, no UI labels, no logos, no numbers. Polished game key-art look.',
  },
];

export const STYLE_MAP: Record<string, AvatarStyle> = Object.fromEntries(
  AVATAR_STYLES.map((s) => [s.id, s])
);
