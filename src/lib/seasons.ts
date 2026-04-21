export type Undertone = "warm" | "cool" | "neutral";

export type Season =
  | "Light Spring" | "True Spring" | "Bright Spring"
  | "Light Summer" | "True Summer" | "Soft Summer"
  | "Soft Autumn" | "True Autumn" | "Deep Autumn"
  | "Deep Winter" | "True Winter" | "Bright Winter";

export interface SeasonInfo {
  name: Season;
  family: "Spring" | "Summer" | "Autumn" | "Winter";
  undertone: Undertone;
  tagline: string;
  description: string;
  characteristics: string[];
  palette: string[]; // hex colors
  avoid: string[];
}

export const SEASONS: Record<Season, SeasonInfo> = {
  "Light Spring": {
    name: "Light Spring", family: "Spring", undertone: "warm",
    tagline: "Delicate, sun-kissed warmth",
    description: "Soft, light, and warm. Your colors glow like morning light through petals.",
    characteristics: ["Light hair (blonde, light brown)", "Light blue/green eyes", "Fair, peachy skin", "Low contrast features"],
    palette: ["#F4D6A0", "#FFB7A8", "#A8D8B9", "#FFE5B4", "#C9E4DE", "#F7C8C0", "#E8D5A0", "#B5D6A7"],
    avoid: ["Stark black", "Pure white", "Heavy jewel tones"],
  },
  "True Spring": {
    name: "True Spring", family: "Spring", undertone: "warm",
    tagline: "Vibrant warmth, golden glow",
    description: "Warm and bright. Think tulip fields, fresh citrus, and golden hour.",
    characteristics: ["Golden hair tones", "Warm green/hazel eyes", "Peachy/golden skin", "Medium contrast"],
    palette: ["#FF9A52", "#F7D547", "#7BC47F", "#FF6B6B", "#4FB3BF", "#E8743B", "#F4C430", "#FFA94D"],
    avoid: ["Cool pastels", "Black", "Burgundy"],
  },
  "Bright Spring": {
    name: "Bright Spring", family: "Spring", undertone: "warm",
    tagline: "Bright, clear, and electric",
    description: "Saturated, warm, and high contrast. Your colors should pop with clarity.",
    characteristics: ["Bright eyes (clear blue, green)", "High contrast features", "Warm undertone", "Vivid coloring"],
    palette: ["#FF4D6D", "#00C2A8", "#FFD60A", "#FF8500", "#7209B7", "#06AED5", "#F72585", "#80ED99"],
    avoid: ["Muted/dusty tones", "Beige", "Soft greys"],
  },
  "Light Summer": {
    name: "Light Summer", family: "Summer", undertone: "cool",
    tagline: "Cool watercolor softness",
    description: "Light, cool, and soft like a misty morning by the sea.",
    characteristics: ["Ash blonde / light brown hair", "Cool blue/grey eyes", "Cool, fair skin", "Low contrast"],
    palette: ["#C9D6E8", "#F5C2D6", "#A8C4D8", "#E0D7E5", "#B4D8C7", "#D4C4E0", "#F0D9D9", "#9DB8D4"],
    avoid: ["Orange", "Warm browns", "Black"],
  },
  "True Summer": {
    name: "True Summer", family: "Summer", undertone: "cool",
    tagline: "Cool, refined elegance",
    description: "Cool and medium. Think dusty rose, slate blue, and soft plum.",
    characteristics: ["Ash brown hair", "Cool blue/grey/green eyes", "Cool, rosy skin", "Medium contrast"],
    palette: ["#7B92B5", "#C2849B", "#5E8B7E", "#A485B3", "#6B8CAE", "#D4A5B0", "#8FA9C1", "#9F7AA8"],
    avoid: ["Orange", "Warm yellow", "Tomato red"],
  },
  "Soft Summer": {
    name: "Soft Summer", family: "Summer", undertone: "neutral",
    tagline: "Muted, foggy mystique",
    description: "Soft, cool-leaning neutral. Like a watercolor fog rolling over the hills.",
    characteristics: ["Ash brown hair", "Soft hazel/grey eyes", "Neutral-cool skin", "Low contrast, blended"],
    palette: ["#A89BAA", "#B3A99C", "#7E96A0", "#C2A4A4", "#8B9D83", "#A39DB0", "#9C8B7C", "#B5A0A8"],
    avoid: ["Bright/saturated colors", "Pure black", "Pure white"],
  },
  "Soft Autumn": {
    name: "Soft Autumn", family: "Autumn", undertone: "neutral",
    tagline: "Warm, blended, earthen",
    description: "Soft and warm. Sun-faded leaves, raw silk, and golden honey.",
    characteristics: ["Soft brown hair", "Hazel/soft green eyes", "Warm-neutral skin", "Low contrast"],
    palette: ["#C9A87C", "#A8896C", "#8B9D6B", "#D4A574", "#B07D5C", "#9C8B5C", "#C4956C", "#7D8B6B"],
    avoid: ["Icy pastels", "Pure black", "Cool jewel tones"],
  },
  "True Autumn": {
    name: "True Autumn", family: "Autumn", undertone: "warm",
    tagline: "Rich, spiced warmth",
    description: "Warm and medium-deep. Pumpkin spice, rust, mustard, and forest moss.",
    characteristics: ["Auburn/chestnut hair", "Warm brown/green eyes", "Warm golden skin", "Medium contrast"],
    palette: ["#B5651D", "#8B4513", "#556B2F", "#CD853F", "#8B7355", "#A0522D", "#6B8E23", "#D2691E"],
    avoid: ["Cool pinks", "Icy blues", "Black"],
  },
  "Deep Autumn": {
    name: "Deep Autumn", family: "Autumn", undertone: "warm",
    tagline: "Deep, smoldering warmth",
    description: "Dark, warm, and rich. Think mahogany, espresso, and burning embers.",
    characteristics: ["Dark brown/black hair", "Deep brown eyes", "Warm, deep skin", "High contrast"],
    palette: ["#5D2E0E", "#8B0000", "#3D2817", "#704214", "#2C1810", "#7B3F00", "#4A1C1C", "#6B4423"],
    avoid: ["Pastels", "Cool greys", "Light icy tones"],
  },
  "Deep Winter": {
    name: "Deep Winter", family: "Winter", undertone: "cool",
    tagline: "Bold, dramatic depth",
    description: "Dark, cool, and rich. Midnight, ruby, and forest pine.",
    characteristics: ["Dark hair (black, dark brown)", "Deep cool eyes", "Cool-neutral deep skin", "Very high contrast"],
    palette: ["#1B1B3A", "#5C0826", "#0F3D3E", "#2C2C54", "#7A0B2E", "#1E3A5F", "#3D1E3D", "#0D1B2A"],
    avoid: ["Warm pastels", "Orange", "Beige"],
  },
  "True Winter": {
    name: "True Winter", family: "Winter", undertone: "cool",
    tagline: "Cool, crisp, and striking",
    description: "Cool and bright. Icy royals, true red, pure white, and jet black.",
    characteristics: ["Dark cool hair", "Cool clear eyes", "Cool skin", "High contrast"],
    palette: ["#000000", "#FFFFFF", "#C8102E", "#003DA5", "#702082", "#00B2A9", "#E40046", "#1B365D"],
    avoid: ["Warm earth tones", "Orange", "Mustard"],
  },
  "Bright Winter": {
    name: "Bright Winter", family: "Winter", undertone: "cool",
    tagline: "Electric, jewel-bright clarity",
    description: "Bright, cool-leaning, and saturated. Sapphire, fuchsia, emerald, ice.",
    characteristics: ["Dark hair, bright eyes", "Very high contrast", "Cool-neutral undertone", "Vivid coloring"],
    palette: ["#FF006E", "#3A86FF", "#8338EC", "#06FFA5", "#FB5607", "#FFBE0B", "#00F5FF", "#E0AAFF"],
    avoid: ["Muted/dusty tones", "Earthy browns"],
  },
};

export const SEASON_LIST = Object.keys(SEASONS) as Season[];
