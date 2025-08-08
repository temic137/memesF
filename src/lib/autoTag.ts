// AI-powered auto-tagging utility for memes with enhanced search optimization
export interface AutoTagResult {
  tags: string[];
  confidence: number;
  category?: string;
  description?: string;
  primaryTags?: string[]; // Most important tags for search
  secondaryTags?: string[]; // Supporting tags
  searchKeywords?: string[]; // Additional search terms
  template?: string; // Recognized meme template
  emotions?: string[]; // Detected emotions
  topics?: string[]; // Main topics/themes
}

// Enhanced tag categories for better search
export interface TagCategory {
  name: string;
  weight: number; // Search priority (0-1)
  synonyms: string[]; // Alternative terms
  related: string[]; // Related categories
}

// Tag hierarchy for better search organization
export const TAG_HIERARCHY: Record<string, TagCategory> = {
  // Primary meme templates (highest search priority)
  'drake-pointing': { name: 'drake-pointing', weight: 0.95, synonyms: ['drake', 'pointing', 'choice'], related: ['decision', 'comparison'] },
  'distracted-boyfriend': { name: 'distracted-boyfriend', weight: 0.95, synonyms: ['distracted', 'temptation', 'cheating'], related: ['relationship', 'drama'] },
  'expanding-brain': { name: 'expanding-brain', weight: 0.95, synonyms: ['galaxy-brain', 'smart', 'intelligence'], related: ['evolution', 'progress'] },
  'change-my-mind': { name: 'change-my-mind', weight: 0.95, synonyms: ['debate', 'argument', 'prove'], related: ['discussion', 'opinion'] },
  'this-is-fine': { name: 'this-is-fine', weight: 0.95, synonyms: ['fire', 'burning', 'denial'], related: ['stress', 'denial'] },
  'surprised-pikachu': { name: 'surprised-pikachu', weight: 0.95, synonyms: ['pikachu', 'surprised', 'shocked'], related: ['reaction', 'shock'] },
  'woman-yelling-at-cat': { name: 'woman-yelling-at-cat', weight: 0.95, synonyms: ['yelling', 'argument', 'confusion'], related: ['misunderstanding', 'drama'] },
  'wojak': { name: 'wojak', weight: 0.9, synonyms: ['doomer', 'bloomer', 'coomer'], related: ['mood', 'personality'] },
  'pepe': { name: 'pepe', weight: 0.9, synonyms: ['frog', 'rare-pepe'], related: ['mascot', 'culture'] },
  'chad-vs-virgin': { name: 'chad-vs-virgin', weight: 0.9, synonyms: ['chad', 'virgin', 'comparison'], related: ['stereotype', 'comparison'] },
  
  // Emotions and reactions (high search priority)
  'funny': { name: 'funny', weight: 0.8, synonyms: ['humor', 'comedy', 'hilarious'], related: ['entertainment', 'joy'] },
  'surprised': { name: 'surprised', weight: 0.8, synonyms: ['shocked', 'amazed', 'astonished'], related: ['reaction', 'emotion'] },
  'confused': { name: 'confused', weight: 0.8, synonyms: ['puzzled', 'baffled', 'perplexed'], related: ['thinking', 'uncertainty'] },
  'angry': { name: 'angry', weight: 0.8, synonyms: ['mad', 'furious', 'rage'], related: ['emotion', 'frustration'] },
  'sad': { name: 'sad', weight: 0.8, synonyms: ['depressed', 'melancholy', 'gloomy'], related: ['emotion', 'mood'] },
  'happy': { name: 'happy', weight: 0.8, synonyms: ['joyful', 'cheerful', 'delighted'], related: ['emotion', 'positive'] },
  'wholesome': { name: 'wholesome', weight: 0.8, synonyms: ['pure', 'innocent', 'sweet'], related: ['positive', 'feel-good'] },
  'cursed': { name: 'cursed', weight: 0.8, synonyms: ['disturbing', 'weird', 'strange'], related: ['dark-humor', 'bizarre'] },
  'blessed': { name: 'blessed', weight: 0.8, synonyms: ['amazing', 'wonderful', 'fantastic'], related: ['positive', 'excellent'] },
  'cringe': { name: 'cringe', weight: 0.8, synonyms: ['awkward', 'embarrassing', 'uncomfortable'], related: ['reaction', 'discomfort'] },
  'based': { name: 'based', weight: 0.8, synonyms: ['cool', 'awesome', 'great'], related: ['positive', 'approval'] },
  
  // Topics and themes (medium search priority)
  'gaming': { name: 'gaming', weight: 0.7, synonyms: ['game', 'gamer', 'videogame'], related: ['entertainment', 'hobby'] },
  'programming': { name: 'programming', weight: 0.7, synonyms: ['code', 'developer', 'software'], related: ['tech', 'work'] },
  'work': { name: 'work', weight: 0.7, synonyms: ['office', 'job', 'career'], related: ['professional', 'adult-life'] },
  'school': { name: 'school', weight: 0.7, synonyms: ['education', 'student', 'learning'], related: ['academic', 'youth'] },
  'relationship': { name: 'relationship', weight: 0.7, synonyms: ['love', 'dating', 'romance'], related: ['personal', 'social'] },
  'food': { name: 'food', weight: 0.7, synonyms: ['eating', 'hungry', 'delicious'], related: ['lifestyle', 'pleasure'] },
  'animals': { name: 'animals', weight: 0.7, synonyms: ['pet', 'cute', 'wildlife'], related: ['nature', 'companionship'] },
  'sports': { name: 'sports', weight: 0.7, synonyms: ['athletic', 'fitness', 'competition'], related: ['physical', 'activity'] },
  'politics': { name: 'politics', weight: 0.7, synonyms: ['government', 'election', 'policy'], related: ['current-events', 'society'] },
  'technology': { name: 'technology', weight: 0.7, synonyms: ['tech', 'digital', 'innovation'], related: ['modern', 'progress'] },
  
  // Relatable content (medium search priority)
  'relatable': { name: 'relatable', weight: 0.6, synonyms: ['relatable', 'everyday', 'common'], related: ['universal', 'shared-experience'] },
  'mood': { name: 'mood', weight: 0.6, synonyms: ['feeling', 'vibe', 'state'], related: ['emotion', 'attitude'] },
  'weekend': { name: 'weekend', weight: 0.6, synonyms: ['friday', 'saturday', 'sunday'], related: ['leisure', 'free-time'] },
  'monday': { name: 'monday', weight: 0.6, synonyms: ['workday', 'weekday', 'routine'], related: ['work', 'responsibility'] },
  'stress': { name: 'stress', weight: 0.6, synonyms: ['anxiety', 'pressure', 'overwhelmed'], related: ['mental-health', 'challenge'] },
  'tired': { name: 'tired', weight: 0.6, synonyms: ['exhausted', 'sleepy', 'fatigued'], related: ['physical', 'rest'] },
  'social-media': { name: 'social-media', weight: 0.6, synonyms: ['internet', 'online', 'digital'], related: ['modern', 'communication'] },
  
  // Quality indicators (lower search priority)
  'high-quality': { name: 'high-quality', weight: 0.4, synonyms: ['premium', 'excellent', 'top-tier'], related: ['quality', 'standard'] },
  'low-effort': { name: 'low-effort', weight: 0.4, synonyms: ['simple', 'basic', 'minimal'], related: ['effort', 'complexity'] },
  'original': { name: 'original', weight: 0.4, synonyms: ['unique', 'creative', 'innovative'], related: ['creativity', 'uniqueness'] },
  'template': { name: 'template', weight: 0.4, synonyms: ['format', 'structure', 'pattern'], related: ['reusable', 'standard'] },
  'deep-fried': { name: 'deep-fried', weight: 0.4, synonyms: ['over-processed', 'exaggerated', 'intense'], related: ['style', 'aesthetic'] },
  'meta': { name: 'meta', weight: 0.4, synonyms: ['self-referential', 'aware', 'commentary'], related: ['self-awareness', 'commentary'] }
};

// Convert image file to base64 for API
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Enhanced AI-powered image analysis with better categorization
async function analyzeImageWithAI(file: File): Promise<AutoTagResult> {
  try {
    const base64Image = await fileToBase64(file);

    const response = await fetch('/api/analyze-meme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        mimeType: file.type
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Process and categorize tags for better search
    const processedTags = processTagsForSearch(result.tags || []);
    
    return {
      tags: processedTags.allTags,
      confidence: result.confidence || 0.9,
      category: result.category,
      description: result.description,
      primaryTags: processedTags.primaryTags,
      secondaryTags: processedTags.secondaryTags,
      searchKeywords: processedTags.searchKeywords,
      template: processedTags.template,
      emotions: processedTags.emotions,
      topics: processedTags.topics
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
}

// Process tags for optimal search performance
function processTagsForSearch(rawTags: string[]): {
  allTags: string[];
  primaryTags: string[];
  secondaryTags: string[];
  searchKeywords: string[];
  template?: string;
  emotions: string[];
  topics: string[];
} {
  const allTags = new Set<string>();
  const primaryTags = new Set<string>();
  const secondaryTags = new Set<string>();
  const searchKeywords = new Set<string>();
  const emotions = new Set<string>();
  const topics = new Set<string>();
  let template: string | undefined;

  // Process each raw tag
  rawTags.forEach(tag => {
    const cleanTag = tag.toLowerCase().trim();
    allTags.add(cleanTag);

    // Check if it's a known template
    if (TAG_HIERARCHY[cleanTag] && TAG_HIERARCHY[cleanTag].weight >= 0.9) {
      template = cleanTag;
      primaryTags.add(cleanTag);
      // Add synonyms for better search
      TAG_HIERARCHY[cleanTag].synonyms.forEach(synonym => {
        searchKeywords.add(synonym);
      });
    }
    // Check if it's a high-priority emotion
    else if (TAG_HIERARCHY[cleanTag] && TAG_HIERARCHY[cleanTag].weight >= 0.8) {
      primaryTags.add(cleanTag);
      emotions.add(cleanTag);
      TAG_HIERARCHY[cleanTag].synonyms.forEach(synonym => {
        searchKeywords.add(synonym);
      });
    }
    // Check if it's a topic/theme
    else if (TAG_HIERARCHY[cleanTag] && TAG_HIERARCHY[cleanTag].weight >= 0.7) {
      primaryTags.add(cleanTag);
      topics.add(cleanTag);
      TAG_HIERARCHY[cleanTag].synonyms.forEach(synonym => {
        searchKeywords.add(synonym);
      });
    }
    // Check if it's relatable content
    else if (TAG_HIERARCHY[cleanTag] && TAG_HIERARCHY[cleanTag].weight >= 0.6) {
      secondaryTags.add(cleanTag);
      TAG_HIERARCHY[cleanTag].synonyms.forEach(synonym => {
        searchKeywords.add(synonym);
      });
    }
    // Everything else goes to secondary tags
    else {
      secondaryTags.add(cleanTag);
    }
  });

  // Ensure we have at least some primary tags
  if (primaryTags.size === 0 && allTags.size > 0) {
    const firstTag = Array.from(allTags)[0];
    primaryTags.add(firstTag);
  }

  return {
    allTags: Array.from(allTags),
    primaryTags: Array.from(primaryTags),
    secondaryTags: Array.from(secondaryTags),
    searchKeywords: Array.from(searchKeywords),
    template,
    emotions: Array.from(emotions),
    topics: Array.from(topics)
  };
}

// Common meme patterns and keywords
const MEME_PATTERNS = {
  // Text-based detection patterns
  textPatterns: [
    { pattern: /\b(lol|lmao|rofl|haha|funny)\b/i, tags: ['funny', 'humor'] },
    { pattern: /\b(cat|kitten|kitty|feline)\b/i, tags: ['cat', 'animal'] },
    { pattern: /\b(dog|puppy|doggo|pupper)\b/i, tags: ['dog', 'animal'] },
    { pattern: /\b(reaction|mood|feel|when)\b/i, tags: ['reaction'] },
    { pattern: /\b(fails?|epic fail|oops)\b/i, tags: ['fail', 'funny'] },
    { pattern: /\b(drake|pointing|choose)\b/i, tags: ['drake', 'choice'] },
    { pattern: /\b(stonks|money|profit)\b/i, tags: ['stonks', 'finance'] },
    { pattern: /\b(surprised|shocked|pikachu)\b/i, tags: ['surprised', 'reaction'] },
    { pattern: /\b(distracted|boyfriend|girlfriend)\b/i, tags: ['distracted-boyfriend'] },
    { pattern: /\b(this is fine|fire|burning)\b/i, tags: ['this-is-fine', 'stress'] },
    { pattern: /\b(brain|galaxy|expanding)\b/i, tags: ['expanding-brain', 'smart'] },
    { pattern: /\b(change my mind|prove me wrong)\b/i, tags: ['change-my-mind', 'debate'] },
    { pattern: /\b(wojak|doomer|bloomer|coomer)\b/i, tags: ['wojak'] },
    { pattern: /\b(pepe|frog|rare pepe)\b/i, tags: ['pepe', 'frog'] },
    { pattern: /\b(chad|virgin|vs)\b/i, tags: ['chad', 'virgin-vs-chad'] },
    { pattern: /\b(gaming|gamer|game)\b/i, tags: ['gaming'] },
    { pattern: /\b(programming|code|developer|bug)\b/i, tags: ['programming', 'tech'] },
    { pattern: /\b(work|office|boss|job)\b/i, tags: ['work', 'office'] },
    { pattern: /\b(school|student|teacher|exam)\b/i, tags: ['school', 'education'] },
    { pattern: /\b(weekend|monday|friday)\b/i, tags: ['weekend', 'relatable'] },
    { pattern: /\b(covid|pandemic|mask|vaccine)\b/i, tags: ['covid', 'pandemic'] },
    { pattern: /\b(2024|2025|new year)\b/i, tags: ['current-year'] },
  ],
  
  // File name patterns
  filenamePatterns: [
    { pattern: /funny/i, tags: ['funny'] },
    { pattern: /cat/i, tags: ['cat'] },
    { pattern: /dog/i, tags: ['dog'] },
    { pattern: /reaction/i, tags: ['reaction'] },
    { pattern: /drake/i, tags: ['drake'] },
    { pattern: /stonks/i, tags: ['stonks'] },
    { pattern: /pikachu/i, tags: ['pikachu', 'surprised'] },
    { pattern: /wojak/i, tags: ['wojak'] },
    { pattern: /pepe/i, tags: ['pepe'] },
    { pattern: /chad/i, tags: ['chad'] },
  ],

  // Common meme formats/templates
  templates: [
    'drake-pointing',
    'distracted-boyfriend',
    'expanding-brain',
    'change-my-mind',
    'this-is-fine',
    'surprised-pikachu',
    'stonks',
    'wojak',
    'pepe',
    'chad-vs-virgin',
    'galaxy-brain',
    'two-buttons',
    'epic-handshake',
    'woman-yelling-at-cat',
    'always-has-been',
  ]
};

// Popular tag suggestions based on current trends
const TRENDING_TAGS = [
  'relatable',
  'mood',
  'funny',
  'reaction',
  'wholesome',
  'cursed',
  'blessed',
  'cringe',
  'based',
  'sus',
  'meta',
  'deep-fried',
  'low-effort',
  'high-quality',
  'original',
  'template',
];

export async function analyzeImageForTags(file: File): Promise<AutoTagResult> {
  try {
    // Try AI analysis first
    return await analyzeImageWithAI(file);
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error);
    // Fall back to pattern matching
    return fallbackAnalysis(file);
  }
}

// Enhanced fallback analysis using pattern matching with tag hierarchy
function fallbackAnalysis(file: File): AutoTagResult {
  const tags = new Set<string>();
  let confidence = 0.3;

  // Analyze filename
  const filename = file.name.toLowerCase();
  MEME_PATTERNS.filenamePatterns.forEach(({ pattern, tags: patternTags }) => {
    if (pattern.test(filename)) {
      patternTags.forEach(tag => tags.add(tag));
      confidence += 0.2;
    }
  });

  // Add some trending tags based on current date/context
  const currentYear = new Date().getFullYear();
  if (filename.includes(currentYear.toString())) {
    tags.add('current-year');
    confidence += 0.1;
  }

  // Always ensure we have at least some basic tags
  if (tags.size === 0) {
    tags.add('funny');
    tags.add('relatable');
    confidence = 0.5;
  }

  // Process tags through the hierarchy system
  const processedTags = processTagsForSearch(Array.from(tags));

  return {
    tags: processedTags.allTags,
    confidence: Math.min(confidence, 1.0),
    category: 'pattern_matched',
    primaryTags: processedTags.primaryTags,
    secondaryTags: processedTags.secondaryTags,
    searchKeywords: processedTags.searchKeywords,
    template: processedTags.template,
    emotions: processedTags.emotions,
    topics: processedTags.topics
  };
}

// Enhanced tag suggestions based on tag hierarchy and relationships
export function suggestAdditionalTags(existingTags: string[]): string[] {
  const suggestions = new Set<string>();
  const existingSet = new Set(existingTags.map(t => t.toLowerCase()));

  // Suggest related tags based on existing ones using tag hierarchy
  existingTags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    
    // Check if tag exists in hierarchy
    if (TAG_HIERARCHY[tagLower]) {
      const category = TAG_HIERARCHY[tagLower];
      
      // Add synonyms
      category.synonyms.forEach(synonym => {
        if (!existingSet.has(synonym)) suggestions.add(synonym);
      });
      
      // Add related categories
      category.related.forEach(related => {
        if (!existingSet.has(related)) suggestions.add(related);
      });
    }
    
    // Legacy category-based suggestions
    if (['cat', 'dog', 'animal'].some(t => tagLower.includes(t))) {
      ['cute', 'pet', 'wholesome'].forEach(s => {
        if (!existingSet.has(s)) suggestions.add(s);
      });
    }
    
    if (['funny', 'humor', 'lol'].some(t => tagLower.includes(t))) {
      ['comedy', 'hilarious', 'joke'].forEach(s => {
        if (!existingSet.has(s)) suggestions.add(s);
      });
    }
    
    if (['gaming', 'game'].some(t => tagLower.includes(t))) {
      ['gamer', 'videogame', 'esports'].forEach(s => {
        if (!existingSet.has(s)) suggestions.add(s);
      });
    }
    
    if (['work', 'office', 'job'].some(t => tagLower.includes(t))) {
      ['relatable', 'monday', 'stress'].forEach(s => {
        if (!existingSet.has(s)) suggestions.add(s);
      });
    }
  });

  // Add trending suggestions if we don't have many
  if (suggestions.size < 2) {
    TRENDING_TAGS.forEach(tag => {
      if (!existingSet.has(tag) && suggestions.size < 3) {
        suggestions.add(tag);
      }
    });
  }

  return Array.from(suggestions).slice(0, 3);
}

// Get popular tags for quick selection
export function getQuickTagSuggestions(): string[] {
  // Return high-weight tags from hierarchy for quick selection
  const highPriorityTags = Object.entries(TAG_HIERARCHY)
    .filter(([_, category]) => category.weight >= 0.8)
    .map(([tag, _]) => tag)
    .slice(0, 10);
  
  return [...highPriorityTags, ...TRENDING_TAGS.slice(0, 5)];
}

// Get related tags for search suggestions
export function getRelatedTags(tag: string): string[] {
  const tagLower = tag.toLowerCase();
  
  if (TAG_HIERARCHY[tagLower]) {
    return TAG_HIERARCHY[tagLower].related;
  }
  
  return [];
}

// Get tag synonyms for search expansion
export function getTagSynonyms(tag: string): string[] {
  const tagLower = tag.toLowerCase();
  
  if (TAG_HIERARCHY[tagLower]) {
    return TAG_HIERARCHY[tagLower].synonyms;
  }
  
  return [];
}

// Get tag weight for search ranking
export function getTagWeight(tag: string): number {
  const tagLower = tag.toLowerCase();
  
  if (TAG_HIERARCHY[tagLower]) {
    return TAG_HIERARCHY[tagLower].weight;
  }
  
  return 0.5; // Default weight for unknown tags
}

// Get all available tags for search autocomplete
export function getAllAvailableTags(): string[] {
  return Object.keys(TAG_HIERARCHY);
}

// Get tags by category for filtering
export function getTagsByCategory(category: 'templates' | 'emotions' | 'topics' | 'relatable' | 'quality'): string[] {
  const categoryWeights = {
    templates: 0.9,
    emotions: 0.8,
    topics: 0.7,
    relatable: 0.6,
    quality: 0.4
  };
  
  const targetWeight = categoryWeights[category];
  
  return Object.entries(TAG_HIERARCHY)
    .filter(([_, tagCategory]) => Math.abs(tagCategory.weight - targetWeight) < 0.1)
    .map(([tag, _]) => tag);
}
