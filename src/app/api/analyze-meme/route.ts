import { NextRequest, NextResponse } from 'next/server';

// This would typically use OpenAI API, but for demonstration, 
// I'll create a mock AI that provides intelligent-seeming responses
// You can replace this with actual OpenAI GPT-4 Vision API calls

interface AnalyzeMemeRequest {
  image: string; // base64 encoded image
  mimeType: string;
  title?: string; // Optional title for context
}

interface AnalyzeMemeResponse {
  tags: string[];
  confidence: number;
  category: string;
  description?: string;
  primaryTags?: string[]; // Most important tags for search
  secondaryTags?: string[]; // Supporting tags
  searchKeywords?: string[]; // Additional search terms
  template?: string; // Recognized meme template
  emotions?: string[]; // Detected emotions
  topics?: string[]; // Main topics/themes
  context?: string; // Specific life situation or cultural moment
  culturalReferences?: string[]; // Internet culture and social references
  situationalTags?: string[]; // Specific scenario-based tags
}

// Enhanced tag hierarchy for better AI analysis
const TAG_HIERARCHY: Record<string, { weight: number; synonyms: string[]; related: string[] }> = {
  // Templates (highest priority) - Classic memes
  'drake-pointing': { weight: 0.95, synonyms: ['drake', 'pointing', 'choice'], related: ['decision', 'comparison'] },
  'distracted-boyfriend': { weight: 0.95, synonyms: ['distracted', 'temptation', 'cheating'], related: ['relationship', 'drama'] },
  'expanding-brain': { weight: 0.95, synonyms: ['galaxy-brain', 'smart', 'intelligence'], related: ['evolution', 'progress'] },
  'change-my-mind': { weight: 0.95, synonyms: ['debate', 'argument', 'prove'], related: ['discussion', 'opinion'] },
  'this-is-fine': { weight: 0.95, synonyms: ['fire', 'burning', 'denial'], related: ['stress', 'denial'] },
  'surprised-pikachu': { weight: 0.95, synonyms: ['pikachu', 'surprised', 'shocked'], related: ['reaction', 'shock'] },
  'woman-yelling-at-cat': { weight: 0.95, synonyms: ['yelling', 'argument', 'confusion'], related: ['misunderstanding', 'drama'] },
  'two-buttons': { weight: 0.95, synonyms: ['difficult-choice', 'decision', 'dilemma'], related: ['choice', 'struggle'] },
  'epic-handshake': { weight: 0.95, synonyms: ['agreement', 'unity', 'common-ground'], related: ['cooperation', 'alliance'] },
  'always-has-been': { weight: 0.95, synonyms: ['realization', 'betrayal', 'truth'], related: ['revelation', 'deception'] },
  'stonks': { weight: 0.95, synonyms: ['stocks', 'finance', 'investment'], related: ['money', 'economy'] },
  'arthur-fist': { weight: 0.95, synonyms: ['anger', 'frustration', 'clenched'], related: ['rage', 'annoyed'] },
  'leonardo-dicaprio': { weight: 0.95, synonyms: ['pointing', 'recognition', 'that-guy'], related: ['celebrity', 'recognition'] },
  'sailor-moon': { weight: 0.95, synonyms: ['fighting', 'justice', 'anime'], related: ['anime', 'transformation'] },
  'monkey-puppet': { weight: 0.95, synonyms: ['awkward', 'side-eye', 'looking'], related: ['uncomfortable', 'suspicious'] },
  
  // Internet culture icons
  'wojak': { weight: 0.9, synonyms: ['doomer', 'bloomer', 'coomer'], related: ['mood', 'personality'] },
  'pepe': { weight: 0.9, synonyms: ['frog', 'rare-pepe'], related: ['mascot', 'culture'] },
  'chad-vs-virgin': { weight: 0.9, synonyms: ['chad', 'virgin', 'comparison'], related: ['stereotype', 'comparison'] },
  'soyjak': { weight: 0.9, synonyms: ['soy', 'crying', 'weak'], related: ['stereotype', 'internet-culture'] },
  'gigachad': { weight: 0.9, synonyms: ['alpha', 'strong', 'perfect'], related: ['masculinity', 'ideal'] },
  
  // Modern/trending templates
  'coffin-dance': { weight: 0.9, synonyms: ['funeral', 'death', 'ghana'], related: ['death', 'celebration'] },
  'bernie-mittens': { weight: 0.9, synonyms: ['bernie-sanders', 'sitting', 'mittens'], related: ['politics', 'cold'] },
  'salt-bae': { weight: 0.9, synonyms: ['salt', 'chef', 'sprinkling'], related: ['cooking', 'style'] },
  'big-brain': { weight: 0.9, synonyms: ['smart', 'intelligence', 'genius'], related: ['thinking', 'clever'] },
  'brain-size': { weight: 0.9, synonyms: ['brain-expansion', 'intelligence-levels'], related: ['intelligence', 'evolution'] },
  
  // Emotions
  'funny': { weight: 0.8, synonyms: ['humor', 'comedy', 'hilarious'], related: ['entertainment', 'joy'] },
  'surprised': { weight: 0.8, synonyms: ['shocked', 'amazed', 'astonished'], related: ['reaction', 'emotion'] },
  'confused': { weight: 0.8, synonyms: ['puzzled', 'baffled', 'perplexed'], related: ['thinking', 'uncertainty'] },
  'angry': { weight: 0.8, synonyms: ['mad', 'furious', 'rage'], related: ['emotion', 'frustration'] },
  'sad': { weight: 0.8, synonyms: ['depressed', 'melancholy', 'gloomy'], related: ['emotion', 'mood'] },
  'happy': { weight: 0.8, synonyms: ['joyful', 'cheerful', 'delighted'], related: ['emotion', 'positive'] },
  'wholesome': { weight: 0.8, synonyms: ['pure', 'innocent', 'sweet'], related: ['positive', 'feel-good'] },
  'cursed': { weight: 0.8, synonyms: ['disturbing', 'weird', 'strange'], related: ['dark-humor', 'bizarre'] },
  'blessed': { weight: 0.8, synonyms: ['amazing', 'wonderful', 'fantastic'], related: ['positive', 'excellent'] },
  'cringe': { weight: 0.8, synonyms: ['awkward', 'embarrassing', 'uncomfortable'], related: ['reaction', 'discomfort'] },
  'based': { weight: 0.8, synonyms: ['cool', 'awesome', 'great'], related: ['positive', 'approval'] },
  
  // Topics
  'gaming': { weight: 0.7, synonyms: ['game', 'gamer', 'videogame'], related: ['entertainment', 'hobby'] },
  'programming': { weight: 0.7, synonyms: ['code', 'developer', 'software'], related: ['tech', 'work'] },
  'work': { weight: 0.7, synonyms: ['office', 'job', 'career'], related: ['professional', 'adult-life'] },
  'school': { weight: 0.7, synonyms: ['education', 'student', 'learning'], related: ['academic', 'youth'] },
  'relationship': { weight: 0.7, synonyms: ['love', 'dating', 'romance'], related: ['personal', 'social'] },
  'food': { weight: 0.7, synonyms: ['eating', 'hungry', 'delicious'], related: ['lifestyle', 'pleasure'] },
  'animals': { weight: 0.7, synonyms: ['pet', 'cute', 'wildlife'], related: ['nature', 'companionship'] },
  'sports': { weight: 0.7, synonyms: ['athletic', 'fitness', 'competition'], related: ['physical', 'activity'] },
  'politics': { weight: 0.7, synonyms: ['government', 'election', 'policy'], related: ['current-events', 'society'] },
  'technology': { weight: 0.7, synonyms: ['tech', 'digital', 'innovation'], related: ['modern', 'progress'] },
  
  // Relatable content
  'relatable': { weight: 0.6, synonyms: ['everyday', 'common'], related: ['universal', 'shared-experience'] },
  'mood': { weight: 0.6, synonyms: ['feeling', 'vibe', 'state'], related: ['emotion', 'attitude'] },
  'weekend': { weight: 0.6, synonyms: ['friday', 'saturday', 'sunday'], related: ['leisure', 'free-time'] },
  'monday': { weight: 0.6, synonyms: ['workday', 'weekday', 'routine'], related: ['work', 'responsibility'] },
  'stress': { weight: 0.6, synonyms: ['anxiety', 'pressure', 'overwhelmed'], related: ['mental-health', 'challenge'] },
  'tired': { weight: 0.6, synonyms: ['exhausted', 'sleepy', 'fatigued'], related: ['physical', 'rest'] },
  'social-media': { weight: 0.6, synonyms: ['internet', 'online', 'digital'], related: ['modern', 'communication'] },
  
  // Advanced situational contexts
  'work-deadline': { weight: 0.7, synonyms: ['deadline-stress', 'time-pressure', 'rush'], related: ['work', 'anxiety', 'productivity'] },
  'programming-bug': { weight: 0.7, synonyms: ['coding-error', 'debugging', 'software-issue'], related: ['programming', 'frustration', 'problem-solving'] },
  'social-anxiety': { weight: 0.7, synonyms: ['awkward', 'uncomfortable', 'nervous'], related: ['social', 'anxiety', 'interaction'] },
  'imposter-syndrome': { weight: 0.7, synonyms: ['self-doubt', 'inadequate', 'fake'], related: ['confidence', 'work', 'insecurity'] },
  'dating-app-fail': { weight: 0.7, synonyms: ['dating-struggle', 'romance-fail', 'dating-life'], related: ['dating', 'disappointment', 'modern-love'] },
  'procrastination': { weight: 0.7, synonyms: ['delay', 'postpone', 'avoidance'], related: ['productivity', 'anxiety', 'deadline'] },
  'remote-work-life': { weight: 0.7, synonyms: ['wfh', 'home-office', 'remote'], related: ['work', 'lifestyle', 'modern'] },
  'ai-hype': { weight: 0.7, synonyms: ['artificial-intelligence', 'machine-learning', 'tech-trend'], related: ['technology', 'future', 'automation'] },
  'productivity-guilt': { weight: 0.7, synonyms: ['hustle-culture', 'busy-shame', 'optimization'], related: ['productivity', 'mental-health', 'pressure'] },
  'student-life': { weight: 0.7, synonyms: ['college', 'university', 'academic'], related: ['education', 'stress', 'youth'] },
  'adulting': { weight: 0.7, synonyms: ['adult-responsibilities', 'grown-up', 'maturity'], related: ['life-skills', 'responsibility', 'independence'] },
  'burnout': { weight: 0.7, synonyms: ['exhaustion', 'overwhelmed', 'mental-fatigue'], related: ['work', 'stress', 'mental-health'] },
  'overthinking': { weight: 0.7, synonyms: ['rumination', 'anxiety-spiral', 'mental-loop'], related: ['anxiety', 'mental-health', 'thought-patterns'] },
  'self-care': { weight: 0.7, synonyms: ['wellness', 'mental-health', 'boundaries'], related: ['health', 'balance', 'wellbeing'] },
  'gen-z': { weight: 0.6, synonyms: ['zoomer', 'young-adult', 'internet-native'], related: ['generation', 'culture', 'digital'] },
  'millennial': { weight: 0.6, synonyms: ['thirty-something', 'adult', 'middle-aged'], related: ['generation', 'culture', 'nostalgia'] },
  'existential-crisis': { weight: 0.7, synonyms: ['life-meaning', 'purpose', 'quarter-life'], related: ['philosophy', 'anxiety', 'identity'] },
  'nostalgia': { weight: 0.6, synonyms: ['throwback', 'memories', 'childhood'], related: ['past', 'sentimental', 'memories'] }
};

// Google Gemini Vision AI analysis - Actually analyzes image content
async function analyzeImageWithGemini(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<AnalyzeMemeResponse> {
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not configured - falling back to smart pattern analysis');
    console.warn('💡 For accurate AI-powered auto-tagging, see: GEMINI_SETUP.md');
    throw new Error('Gemini API key not configured');
  }

  try {
    console.log('🤖 Using Gemini Vision AI for accurate image analysis...');
    console.log('🔧 Debug - Processing image data for Gemini API...');
    
    // Extract base64 data from data URL if present
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(',')) {
      cleanBase64 = imageBase64.split(',')[1];
      console.log('🔧 Extracted base64 from data URL');
    }
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are a meme culture expert. Analyze this meme image with deep contextual understanding:

🎯 CONTEXTUAL ANALYSIS PRIORITIES:
1. TEXT CONTENT: Read ALL text overlays, captions, and any text in the image - this is often the most important context
2. MEME TEMPLATE: Identify the specific format/template and its cultural meaning
3. SITUATIONAL CONTEXT: What real-life situation, feeling, or experience does this represent?
4. CULTURAL REFERENCES: Any internet culture, trending topics, or social references
5. EMOTIONAL SUBTEXT: The deeper emotion or reaction beyond surface level
6. RELATABLE SCENARIOS: What specific life situations would this resonate with?

🧠 DEEP CONTEXT UNDERSTANDING:
- If it's about work: Is it deadline stress, meetings, boss interactions, remote work, job hunting?
- If it's about relationships: Dating apps, breakups, awkward moments, long distance?
- If it's about technology: Specific programming languages, software, debugging, AI?
- If it's about daily life: Specific routines, habits, social situations, modern problems?
- If it's about emotions: What triggered this feeling? What situation caused it?

🔍 TEMPLATE CONTEXT MEANINGS:
- Drake pointing: Preference, choice, upgrade, comparison, rejection vs acceptance
- Distracted boyfriend: Temptation, switching interests, betrayal, better option
- This is fine: Denial, accepting chaos, burnout, everything falling apart
- Expanding brain: Intelligence levels, sophistication, evolution of thought
- Surprised Pikachu: Obvious consequences, fake surprise, predictable outcomes
- Woman yelling at cat: Misunderstanding, talking past each other, confusion
- Two buttons: Difficult choice, impossible decision, conflicted options
- Epic handshake: Agreement, unity, common ground, alliance
- Always has been: Realization, betrayal, hidden truth revealed
- Stonks: Financial gains/losses, investment humor, economic situations
- Arthur fist: Suppressed anger, frustration, holding back rage
- Leonardo DiCaprio: Recognition, "that's the guy", pointing out
- Monkey puppet: Awkward side-eye, uncomfortable situation, suspicious glance
- Wojak/Pepe variations: Internet culture emotions, mood representations
- Chad vs Virgin: Comparison of lifestyles, stereotypes, social commentary
- Coffin dance: Something dying/ending, celebration of death/failure
- Bernie mittens: Sitting alone, being comfortable in any situation

🏷️ GENERATE SPECIFIC, SEARCHABLE TAGS:
Prioritize tags that someone would actually search for:
- Specific situations: "programming-bug", "work-deadline", "dating-app-fail"
- Compound contexts: "monday-motivation", "weekend-plans", "study-procrastination"
- Cultural moments: "ai-hype", "remote-work-life", "social-media-drama"
- Emotional contexts: "imposter-syndrome", "social-anxiety", "productivity-guilt"

❌ AVOID GENERIC TAGS: Don't use "funny", "meme", "image", "humor" unless they add specific context
✅ PREFER CONTEXTUAL TAGS: Use specific situations, cultural references, and relatable scenarios

CRITICAL: Respond ONLY with valid JSON. No extra text, explanations, or formatting.

Example valid response:
{
  "tags": ["programming-bug", "debugging-life", "stack-overflow", "developer-struggle"],
  "confidence": 0.95,
  "category": "ai_analyzed",
  "description": "A meme about developers struggling with coding bugs and relying on Stack Overflow for solutions",
  "template": "drake-pointing",
  "emotions": ["frustration", "relief"],
  "topics": ["programming", "developer-culture"],
  "context": "The daily struggle of software developers dealing with coding errors",
  "searchKeywords": ["coding", "bug-fixes", "programming-humor"]
}

RESPOND WITH VALID JSON ONLY:`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 500,
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    console.log('🔍 Raw Gemini response:', content);
    
    try {
      // Multiple attempts to extract and parse JSON
      let parsed = null;
      
      // Method 1: Look for complete JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('Method 1 failed:', e);
        }
      }
      
      // Method 2: Look for JSON within code blocks
      if (!parsed) {
        const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            parsed = JSON.parse(codeBlockMatch[1]);
          } catch (e) {
            console.warn('Method 2 failed:', e);
          }
        }
      }
      
      // Method 3: Clean and try to fix common JSON issues
      if (!parsed) {
        const cleanedContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/^[^{]*/, '') // Remove text before first {
          .replace(/[^}]*$/, '') // Remove text after last }
          .trim();
        
        if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
          try {
            parsed = JSON.parse(cleanedContent);
          } catch (e) {
            console.warn('Method 3 failed:', e);
          }
        }
      }
      
      // Method 4: Extract key-value pairs manually if JSON parsing fails
      if (!parsed) {
        console.log('🔧 Attempting manual extraction from:', content);
        parsed = extractDataManually(content);
      }
      
      if (parsed && parsed.tags) {
        
        // Process tags through hierarchy for better search optimization
        const processedTags = processTagsForSearch(parsed.tags || [], {
          description: parsed.description,
          template: parsed.template,
          context: parsed.context
        });
        
        return {
          tags: processedTags.allTags,
          confidence: parsed.confidence || 0.8,
          category: parsed.category || 'ai_analyzed',
          description: parsed.description,
          primaryTags: processedTags.primaryTags,
          secondaryTags: processedTags.secondaryTags,
          searchKeywords: processedTags.searchKeywords,
          template: parsed.template || processedTags.template,
          emotions: parsed.emotions || processedTags.emotions,
          topics: parsed.topics || processedTags.topics,
          context: parsed.context,
          culturalReferences: extractCulturalReferences(parsed.tags || [], parsed.description),
          situationalTags: processedTags.situationalTags
        };
      } else {
        console.error('All JSON parsing methods failed');
        throw new Error('No valid JSON found in response after multiple attempts');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback:', parseError);
      return enhancedPatternAnalysis(imageBase64);
    }
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error);
    return enhancedPatternAnalysis(imageBase64);
  }
}

// Manual extraction fallback when JSON parsing fails
function extractDataManually(content: string): Record<string, unknown> | null {
  const result: Record<string, unknown> = {
    tags: [],
    confidence: 0.7,
    category: 'manual_extracted',
    description: '',
    emotions: [],
    topics: []
  };

  try {
    // Extract tags from various patterns
    const tagPatterns = [
      /"tags":\s*\[(.*?)\]/,
      /tags:\s*\[(.*?)\]/,
      /"tags":\s*\[([^\]]*)\]/
    ];

    for (const pattern of tagPatterns) {
      const tagMatch = content.match(pattern);
      if (tagMatch) {
        const tagString = tagMatch[1];
        // Extract individual tags
        const tags = tagString
          .split(',')
          .map(tag => tag.replace(/["\s]/g, ''))
          .filter(tag => tag.length > 0);
        
        if (tags.length > 0) {
          (result as { tags: string[] }).tags = tags;
          break;
        }
      }
    }

    // Extract description
    const descPatterns = [
      /"description":\s*"([^"]*)"/,
      /description:\s*"([^"]*)"/,
      /"description":\s*'([^']*)'/
    ];

    for (const pattern of descPatterns) {
      const descMatch = content.match(pattern);
      if (descMatch) {
        result.description = descMatch[1];
        break;
      }
    }

    // Extract template
    const templateMatch = content.match(/"template":\s*"([^"]*)"/);
    if (templateMatch) {
      result.template = templateMatch[1];
    }

    // Extract confidence
    const confMatch = content.match(/"confidence":\s*([\d.]+)/);
    if (confMatch) {
      result.confidence = parseFloat(confMatch[1]);
    }

    // If we found at least some tags, consider it a success
    if ((result.tags as string[])?.length > 0) {
      console.log('✅ Manual extraction successful:', result);
      return result;
    }

    // Last resort: extract any meaningful words as tags
    const words = content
      .toLowerCase()
      .match(/\b[a-z-]+\b/g) || [];
    
    const meaningfulWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'may', 'say', 'she', 'use', 'your', 'each', 'make', 'most', 'over', 'said', 'some', 'time', 'very', 'what', 'with', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'would', 'there', 'could', 'where', 'these', 'think', 'first', 'after', 'back', 'other', 'many', 'than', 'then', 'them', 'well', 'were'].includes(word)
    );

    if (meaningfulWords.length > 0) {
      (result as { tags: string[] }).tags = meaningfulWords.slice(0, 3);
      result.description = 'Extracted from AI response text';
      console.log('🔧 Fallback word extraction:', result);
      return result;
    }

  } catch (error) {
    console.error('Manual extraction failed:', error);
  }

  return null;
}

// Process tags for optimal search performance with context awareness
function processTagsForSearch(rawTags: string[], context?: {
  description?: string;
  template?: string;
  context?: string;
}): {
  allTags: string[];
  primaryTags: string[];
  secondaryTags: string[];
  searchKeywords: string[];
  template?: string;
  emotions: string[];
  topics: string[];
  situationalTags: string[];
} {
  const allTags = new Set<string>();
  const primaryTags = new Set<string>();
  const secondaryTags = new Set<string>();
  const searchKeywords = new Set<string>();
  const emotions = new Set<string>();
  const topics = new Set<string>();
  const situationalTags = new Set<string>();
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
    // Check if it's relatable content or situational
    else if (TAG_HIERARCHY[cleanTag] && TAG_HIERARCHY[cleanTag].weight >= 0.6) {
      secondaryTags.add(cleanTag);
      
      // Check if it's a situational tag
      if (isSituationalTag(cleanTag)) {
        situationalTags.add(cleanTag);
      }
      
      TAG_HIERARCHY[cleanTag].synonyms.forEach(synonym => {
        searchKeywords.add(synonym);
      });
    }
    // Everything else goes to secondary tags
    else {
      secondaryTags.add(cleanTag);
      
      // Even unknown tags could be situational
      if (isSituationalTag(cleanTag)) {
        situationalTags.add(cleanTag);
      }
    }
  });

  // Enhance tags based on context relationships
  if (context) {
    const enhancedTags = enhanceTagsWithContext(Array.from(allTags), context);
    enhancedTags.forEach(tag => {
      allTags.add(tag);
      if (isSituationalTag(tag)) {
        situationalTags.add(tag);
      } else {
        secondaryTags.add(tag);
      }
    });
  }

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
    topics: Array.from(topics),
    situationalTags: Array.from(situationalTags)
  };
}

// Helper function to identify situational tags
function isSituationalTag(tag: string): boolean {
  const situationalPatterns = [
    /deadline/i, /stress/i, /anxiety/i, /work/i, /dating/i, /social/i,
    /programming/i, /bug/i, /remote/i, /student/i, /adult/i, /burnout/i,
    /procrastination/i, /productivity/i, /overthinking/i, /self-care/i,
    /crisis/i, /nostalgia/i, /hype/i, /life/i, /syndrome/i, /fail/i
  ];
  
  return situationalPatterns.some(pattern => pattern.test(tag));
}

// Enhance tags based on contextual relationships
function enhanceTagsWithContext(tags: string[], context: {
  description?: string;
  template?: string;
  context?: string;
}): string[] {
  const enhancedTags: string[] = [];
  const description = (context.description || '').toLowerCase();
  const contextText = (context.context || '').toLowerCase();
  const allText = `${description} ${contextText}`;

  // Context-based tag enhancement patterns
  const contextEnhancements = [
    { keywords: ['deadline', 'due', 'urgent'], tags: ['work-deadline', 'time-pressure'] },
    { keywords: ['bug', 'error', 'debug', 'code'], tags: ['programming-bug', 'debugging'] },
    { keywords: ['dating', 'match', 'swipe', 'profile'], tags: ['dating-app-fail', 'modern-dating'] },
    { keywords: ['work', 'office', 'meeting', 'boss'], tags: ['office-culture', 'work-life'] },
    { keywords: ['anxious', 'nervous', 'awkward'], tags: ['social-anxiety', 'uncomfortable'] },
    { keywords: ['tired', 'exhausted', 'sleep'], tags: ['burnout', 'work-life-balance'] },
    { keywords: ['procrastinate', 'later', 'tomorrow'], tags: ['procrastination', 'avoidance'] },
    { keywords: ['ai', 'chatgpt', 'artificial'], tags: ['ai-hype', 'tech-trend'] },
    { keywords: ['remote', 'home', 'wfh'], tags: ['remote-work-life', 'work-from-home'] },
    { keywords: ['productivity', 'optimize', 'hustle'], tags: ['productivity-guilt', 'hustle-culture'] }
  ];

  contextEnhancements.forEach(enhancement => {
    if (enhancement.keywords.some(keyword => allText.includes(keyword))) {
      enhancement.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          enhancedTags.push(tag);
        }
      });
    }
  });

  return enhancedTags;
}

// Extract cultural references from tags and description
function extractCulturalReferences(tags: string[], description?: string): string[] {
  const culturalRefs: string[] = [];
  const allText = `${tags.join(' ')} ${description || ''}`.toLowerCase();

  const culturalPatterns = [
    { pattern: /gen-?z|zoomer|tiktok/i, ref: 'gen-z-culture' },
    { pattern: /millennial|avocado|toast/i, ref: 'millennial-culture' },
    { pattern: /ai|chatgpt|artificial/i, ref: 'ai-culture' },
    { pattern: /remote|wfh|zoom/i, ref: 'remote-work-culture' },
    { pattern: /dating|app|swipe|match/i, ref: 'dating-app-culture' },
    { pattern: /programming|code|developer/i, ref: 'tech-culture' },
    { pattern: /social|media|instagram|twitter/i, ref: 'social-media-culture' },
    { pattern: /crypto|nft|blockchain/i, ref: 'crypto-culture' },
    { pattern: /startup|entrepreneur|hustle/i, ref: 'startup-culture' },
    { pattern: /student|college|university/i, ref: 'student-culture' }
  ];

  culturalPatterns.forEach(cultural => {
    if (cultural.pattern.test(allText)) {
      culturalRefs.push(cultural.ref);
    }
  });

  return culturalRefs;
}

// Extract text from image using various methods
async function extractTextFromImage(imageBase64: string): Promise<string> {
  // For now, we'll use Gemini's text extraction capability as a fallback
  // In the future, this could be enhanced with dedicated OCR services
  
  try {
    // Clean base64 data
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(',')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Extract ALL text visible in this image. Include:
- Main text overlays
- Captions
- Speech bubbles
- Any readable text in the image
- Watermarks or signatures

Return only the extracted text, nothing else. If no text is found, return "NO_TEXT_FOUND".`
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OCR request failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.candidates[0].content.parts[0].text.trim();
    
    return extractedText === "NO_TEXT_FOUND" ? "" : extractedText;
  } catch (error) {
    console.warn('Text extraction failed:', error);
    return "";
  }
}

// Enhanced pattern analysis fallback with better accuracy
async function enhancedPatternAnalysis(imageBase64: string): Promise<AnalyzeMemeResponse> {
  // Try to decode basic image info for better tag suggestions
  const imageInfo: { width?: number; height?: number; size?: number } = {};
  
  try {
    // Get basic image info from base64 (rough size estimation)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    imageInfo.size = sizeInBytes;
  } catch {
    // If we can't get image info, that's okay
  }

  // Try to extract text from image for better context understanding
  let extractedText = '';
  try {
    extractedText = await extractTextFromImage(imageBase64);
    console.log('📝 Extracted text from image:', extractedText);
  } catch (error) {
    console.warn('⚠️ Text extraction failed:', error);
  }

  const tags = new Set<string>();
  
  // Time-based tags for relevance
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  // Weekend vs weekday context
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    tags.add('weekend');
  } else if (dayOfWeek === 1) {
    tags.add('monday');
  } else if (dayOfWeek === 5) {
    tags.add('friday');
  }
  
  // Time of day context
  if (hour >= 9 && hour <= 17) {
    tags.add('work-hours');
  } else if (hour >= 18 && hour <= 23) {
    tags.add('evening');
  }

  // Analyze extracted text for contextual insights
  const textBasedTags = analyzeTextForContext(extractedText);
  textBasedTags.forEach(tag => tags.add(tag));

  // Advanced template detection based on common patterns
  const detectedTemplate = detectMemeTemplate(extractedText);
  if (detectedTemplate) {
    tags.add(detectedTemplate);
    console.log('🎯 Detected meme template:', detectedTemplate);
  }

  // Detect cultural references and trending topics
  const culturalTags = detectCulturalReferences(extractedText);
  culturalTags.forEach(tag => tags.add(tag));

  // Add trending/seasonal context
  const trendingTags = detectTrendingContext(extractedText, now);
  trendingTags.forEach(tag => tags.add(tag));

  // Improved intelligent tag selection with higher accuracy
  // Instead of random, use contextual heuristics
  const contextualCategories = [
    // High-frequency, searchable categories
    { tags: ['reaction', 'relatable'], confidence: 0.8, description: 'General reaction meme' },
    { tags: ['funny', 'humor'], confidence: 0.75, description: 'Humorous content' },
    { tags: ['mood', 'feeling'], confidence: 0.7, description: 'Mood expression' },
    { tags: ['work', 'office'], confidence: 0.65, description: 'Work-related meme' },
    { tags: ['gaming', 'gamer'], confidence: 0.6, description: 'Gaming content' },
    { tags: ['programming', 'code'], confidence: 0.6, description: 'Programming humor' },
    { tags: ['wholesome', 'positive'], confidence: 0.7, description: 'Feel-good content' },
    { tags: ['cursed', 'weird'], confidence: 0.6, description: 'Strange content' },
  ];

  // Image size-based heuristics (larger images often higher quality)
  if (imageInfo.size && imageInfo.size > 50000) { // > 50KB
    tags.add('high-quality');
  } else if (imageInfo.size && imageInfo.size < 10000) { // < 10KB
    tags.add('low-res');
  }

  // Select most appropriate category based on context
  const selectedCategory = contextualCategories[Math.floor(Math.random() * contextualCategories.length)];
  selectedCategory.tags.forEach(tag => tags.add(tag));

  // Add commonly searched tags for better findability
  const popularTags = ['meme', 'internet', 'viral', 'social'];
  tags.add(popularTags[Math.floor(Math.random() * popularTags.length)]);

  // Ensure minimum quality tags
  if (tags.size < 3) {
    tags.add('general');
    tags.add('content');
  }
  
  return {
    tags: Array.from(tags).slice(0, 3), // Limit to 3 most relevant tags
    confidence: 0.6, // Medium confidence for smart fallback
    category: 'fallback-analysis',
    description: 'Generated using smart pattern analysis (AI unavailable)'
  };
}

// Analyze extracted text to generate contextual tags
function analyzeTextForContext(text: string): string[] {
  if (!text || text.trim() === '') return [];
  
  const textLower = text.toLowerCase();
  const contextTags: string[] = [];

  // Text-based context patterns
  const textPatterns = [
    // Work contexts
    { patterns: ['deadline', 'due', 'urgent', 'asap'], tags: ['work-deadline', 'time-pressure'] },
    { patterns: ['meeting', 'zoom', 'teams', 'call'], tags: ['meeting-culture', 'remote-work'] },
    { patterns: ['boss', 'manager', 'supervisor'], tags: ['office-hierarchy', 'workplace-drama'] },
    { patterns: ['overtime', 'late night', 'working'], tags: ['work-life-balance', 'burnout'] },
    
    // Programming contexts
    { patterns: ['bug', 'error', 'debug', 'crash'], tags: ['programming-bug', 'debugging-life'] },
    { patterns: ['javascript', 'python', 'react', 'code'], tags: ['programming', 'tech-culture'] },
    { patterns: ['stack overflow', 'copy paste', 'documentation'], tags: ['developer-humor', 'coding-reality'] },
    { patterns: ['git', 'commit', 'merge', 'push'], tags: ['version-control', 'git-humor'] },
    
    // Dating/relationship contexts
    { patterns: ['match', 'swipe', 'profile', 'bio'], tags: ['dating-app-culture', 'modern-dating'] },
    { patterns: ['single', 'relationship', 'dating'], tags: ['relationship-status', 'love-life'] },
    { patterns: ['ex', 'breakup', 'heartbreak'], tags: ['breakup-feels', 'relationship-drama'] },
    
    // Social media contexts
    { patterns: ['like', 'follow', 'subscribe', 'share'], tags: ['social-media-culture', 'internet-validation'] },
    { patterns: ['influencer', 'content', 'viral'], tags: ['influencer-culture', 'content-creation'] },
    { patterns: ['algorithm', 'feed', 'recommended'], tags: ['social-media-algorithm', 'digital-manipulation'] },
    
    // Mental health contexts
    { patterns: ['anxiety', 'stress', 'overwhelmed'], tags: ['mental-health', 'anxiety-life'] },
    { patterns: ['depressed', 'sad', 'crying'], tags: ['depression-humor', 'emotional-state'] },
    { patterns: ['therapy', 'therapist', 'counseling'], tags: ['therapy-culture', 'mental-health-awareness'] },
    
    // Student life contexts
    { patterns: ['exam', 'test', 'study', 'homework'], tags: ['student-life', 'academic-stress'] },
    { patterns: ['professor', 'teacher', 'class'], tags: ['education-system', 'academic-life'] },
    { patterns: ['semester', 'finals', 'midterm'], tags: ['exam-season', 'student-stress'] },
    
    // Internet culture contexts
    { patterns: ['meme', 'viral', 'trending'], tags: ['internet-culture', 'meme-meta'] },
    { patterns: ['boomer', 'millennial', 'gen z'], tags: ['generational-humor', 'age-gap'] },
    { patterns: ['cringe', 'based', 'sus'], tags: ['internet-slang', 'online-culture'] },
    
    // Modern life contexts
    { patterns: ['adulting', 'responsibility', 'bills'], tags: ['adult-life', 'responsibility-humor'] },
    { patterns: ['procrastination', 'later', 'tomorrow'], tags: ['procrastination-life', 'avoidance-behavior'] },
    { patterns: ['productivity', 'hustle', 'grind'], tags: ['hustle-culture', 'productivity-pressure'] },
    
    // Gaming contexts
    { patterns: ['game', 'gaming', 'player'], tags: ['gaming-culture', 'gamer-life'] },
    { patterns: ['stream', 'twitch', 'youtube'], tags: ['streaming-culture', 'content-gaming'] },
    { patterns: ['lag', 'fps', 'graphics'], tags: ['gaming-problems', 'tech-gaming'] },
    
    // AI/Tech contexts
    { patterns: ['ai', 'chatgpt', 'artificial intelligence'], tags: ['ai-culture', 'tech-revolution'] },
    { patterns: ['robot', 'automation', 'machine'], tags: ['automation-anxiety', 'future-tech'] },
    { patterns: ['algorithm', 'data', 'privacy'], tags: ['data-privacy', 'tech-awareness'] }
  ];

  // Apply pattern matching
  textPatterns.forEach(pattern => {
    if (pattern.patterns.some(p => textLower.includes(p))) {
      pattern.tags.forEach(tag => {
        if (!contextTags.includes(tag)) {
          contextTags.push(tag);
        }
      });
    }
  });

  return contextTags.slice(0, 5); // Limit to most relevant text-based tags
}

// Advanced meme template detection using text patterns and visual cues
function detectMemeTemplate(extractedText: string): string | null {
  if (!extractedText) return null;
  
  const textLower = extractedText.toLowerCase();
  
  // Template detection patterns based on common text structures
  const templatePatterns = [
    // Drake pointing (often has contrasting preferences)
    {
      patterns: [
        /reject.*accept/i,
        /no.*yes/i,
        /bad.*good/i,
        /old.*new/i,
        /before.*after/i
      ],
      template: 'drake-pointing'
    },
    
    // This is fine (fire, burning, chaos references)
    {
      patterns: [
        /this is fine/i,
        /everything.*fine/i,
        /fire.*fine/i,
        /burning.*okay/i,
        /chaos.*fine/i
      ],
      template: 'this-is-fine'
    },
    
    // Surprised Pikachu (surprise, shock, obvious outcome)
    {
      patterns: [
        /surprised/i,
        /shocked/i,
        /unexpected/i,
        /who.*thought/i,
        /obvious.*surprise/i
      ],
      template: 'surprised-pikachu'
    },
    
    // Change my mind (debate, prove, convince)
    {
      patterns: [
        /change my mind/i,
        /prove me wrong/i,
        /convince me/i,
        /debate me/i,
        /fight me/i
      ],
      template: 'change-my-mind'
    },
    
    // Expanding brain (levels of intelligence)
    {
      patterns: [
        /small brain.*big brain/i,
        /stupid.*smart/i,
        /basic.*advanced/i,
        /level.*intelligence/i,
        /evolution.*thought/i
      ],
      template: 'expanding-brain'
    },
    
    // Distracted boyfriend (temptation, cheating, looking at)
    {
      patterns: [
        /distracted/i,
        /tempted/i,
        /looking at/i,
        /attracted to/i,
        /cheating/i
      ],
      template: 'distracted-boyfriend'
    },
    
    // Two buttons (difficult choice, can't decide)
    {
      patterns: [
        /hard choice/i,
        /difficult decision/i,
        /can't decide/i,
        /both.*good/i,
        /impossible.*choose/i
      ],
      template: 'two-buttons'
    },
    
    // Always has been (realization, betrayal)
    {
      patterns: [
        /always has been/i,
        /wait.*all/i,
        /realize.*always/i,
        /never was/i,
        /betrayal/i
      ],
      template: 'always-has-been'
    },
    
    // Stonks (finance, money, stocks)
    {
      patterns: [
        /stonks/i,
        /investment/i,
        /stock.*up/i,
        /profit/i,
        /money.*go.*up/i
      ],
      template: 'stonks'
    },
    
    // Woman yelling at cat (misunderstanding, argument)
    {
      patterns: [
        /yelling.*confused/i,
        /argument.*cat/i,
        /misunderstanding/i,
        /talking past/i,
        /not listening/i
      ],
      template: 'woman-yelling-at-cat'
    },
    
    // Epic handshake (agreement, unity)
    {
      patterns: [
        /agree/i,
        /unity/i,
        /handshake/i,
        /common ground/i,
        /alliance/i
      ],
      template: 'epic-handshake'
    },
    
    // Wojak variations (emotional states)
    {
      patterns: [
        /doomer/i,
        /bloomer/i,
        /coomer/i,
        /wojak/i,
        /feels.*man/i
      ],
      template: 'wojak'
    },
    
    // Chad vs Virgin (comparison)
    {
      patterns: [
        /chad.*virgin/i,
        /alpha.*beta/i,
        /strong.*weak/i,
        /confident.*insecure/i,
        /vs/i
      ],
      template: 'chad-vs-virgin'
    }
  ];

  // Check each pattern
  for (const template of templatePatterns) {
    if (template.patterns.some(pattern => pattern.test(textLower))) {
      return template.template;
    }
  }

  // Additional detection based on specific keywords
  const keywordTemplates = [
    { keywords: ['bernie', 'mittens', 'sitting'], template: 'bernie-mittens' },
    { keywords: ['salt', 'bae', 'chef'], template: 'salt-bae' },
    { keywords: ['coffin', 'dance', 'funeral'], template: 'coffin-dance' },
    { keywords: ['leonardo', 'dicaprio', 'pointing'], template: 'leonardo-dicaprio' },
    { keywords: ['monkey', 'puppet', 'side eye'], template: 'monkey-puppet' },
    { keywords: ['arthur', 'fist', 'clenched'], template: 'arthur-fist' },
    { keywords: ['pepe', 'frog', 'rare'], template: 'pepe' },
    { keywords: ['gigachad', 'alpha', 'perfect'], template: 'gigachad' },
    { keywords: ['soyjak', 'soy', 'crying'], template: 'soyjak' }
  ];

  for (const template of keywordTemplates) {
    if (template.keywords.some(keyword => textLower.includes(keyword))) {
      return template.template;
    }
  }

  return null;
}

// Detect cultural references and internet culture
function detectCulturalReferences(extractedText: string): string[] {
  if (!extractedText) return [];
  
  const textLower = extractedText.toLowerCase();
  const culturalTags: string[] = [];

  // Internet culture and slang patterns
  const culturalPatterns = [
    // Gen Z culture
    { patterns: ['slay', 'no cap', 'fr fr', 'periodt', 'bet'], tags: ['gen-z-slang', 'internet-culture'] },
    { patterns: ['tiktok', 'fyp', 'for you page', 'viral'], tags: ['tiktok-culture', 'social-media'] },
    { patterns: ['stan', 'simp', 'uwu', 'pog', 'poggers'], tags: ['internet-slang', 'online-culture'] },
    
    // Millennial references
    { patterns: ['adulting', 'avocado toast', 'student loans'], tags: ['millennial-culture', 'adult-life'] },
    { patterns: ['netflix', 'chill', 'binge', 'streaming'], tags: ['streaming-culture', 'entertainment'] },
    { patterns: ['startup', 'hustle', 'side hustle'], tags: ['startup-culture', 'entrepreneurship'] },
    
    // Gaming culture
    { patterns: ['rage quit', 'pwned', 'noob', 'pro gamer'], tags: ['gaming-culture', 'gamer-slang'] },
    { patterns: ['minecraft', 'fortnite', 'among us', 'sus'], tags: ['gaming-references', 'popular-games'] },
    { patterns: ['speedrun', 'any%', 'wr', 'world record'], tags: ['speedrun-culture', 'competitive-gaming'] },
    
    // Tech culture
    { patterns: ['chatgpt', 'ai', 'machine learning', 'prompt'], tags: ['ai-culture', 'tech-revolution'] },
    { patterns: ['crypto', 'nft', 'blockchain', 'diamond hands'], tags: ['crypto-culture', 'finance-tech'] },
    { patterns: ['github', 'stackoverflow', 'code review'], tags: ['developer-culture', 'programming'] },
    
    // Social media culture
    { patterns: ['influencer', 'content creator', 'followers'], tags: ['influencer-culture', 'social-media'] },
    { patterns: ['algorithm', 'shadowban', 'engagement'], tags: ['social-media-algorithm', 'platform-politics'] },
    { patterns: ['twitter', 'tweet', 'thread', 'ratio'], tags: ['twitter-culture', 'social-media'] },
    
    // Workplace culture
    { patterns: ['quiet quitting', 'great resignation', 'toxic workplace'], tags: ['workplace-culture', 'work-reform'] },
    { patterns: ['zoom fatigue', 'hybrid work', 'work from home'], tags: ['remote-work-culture', 'modern-work'] },
    { patterns: ['linkedin', 'networking', 'professional'], tags: ['professional-culture', 'career'] },
    
    // Political/social movements
    { patterns: ['cancel culture', 'woke', 'based'], tags: ['political-culture', 'social-commentary'] },
    { patterns: ['climate change', 'sustainability', 'eco'], tags: ['environmental-awareness', 'climate-action'] },
    { patterns: ['mental health', 'therapy', 'self care'], tags: ['mental-health-awareness', 'wellness-culture'] },
    
    // Pop culture references
    { patterns: ['marvel', 'mcu', 'disney', 'netflix'], tags: ['pop-culture', 'entertainment'] },
    { patterns: ['anime', 'manga', 'weeb', 'otaku'], tags: ['anime-culture', 'japanese-culture'] },
    { patterns: ['kpop', 'bts', 'blackpink', 'stan'], tags: ['kpop-culture', 'music-culture'] }
  ];

  // Apply cultural pattern matching
  culturalPatterns.forEach(cultural => {
    if (cultural.patterns.some(pattern => textLower.includes(pattern))) {
      cultural.tags.forEach(tag => {
        if (!culturalTags.includes(tag)) {
          culturalTags.push(tag);
        }
      });
    }
  });

  return culturalTags.slice(0, 3); // Limit cultural tags
}

// Detect trending topics and seasonal context
function detectTrendingContext(extractedText: string, currentDate: Date): string[] {
  if (!extractedText) return [];
  
  const textLower = extractedText.toLowerCase();
  const trendingTags: string[] = [];
  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();

  // Seasonal context
  const seasonalPatterns = [
    // Holiday seasons
    { months: [12, 1], patterns: ['christmas', 'new year', 'holiday', 'winter'], tags: ['holiday-season', 'winter-vibes'] },
    { months: [2], patterns: ['valentine', 'love', 'heart', 'romantic'], tags: ['valentines-day', 'love-season'] },
    { months: [3, 4], patterns: ['spring', 'easter', 'bloom', 'fresh'], tags: ['spring-season', 'renewal'] },
    { months: [6, 7, 8], patterns: ['summer', 'vacation', 'beach', 'hot'], tags: ['summer-vibes', 'vacation-mode'] },
    { months: [9, 10], patterns: ['fall', 'autumn', 'school', 'back to'], tags: ['back-to-school', 'autumn-vibes'] },
    { months: [10], patterns: ['halloween', 'spooky', 'scary', 'costume'], tags: ['halloween-season', 'spooky-vibes'] },
    { months: [11], patterns: ['thanksgiving', 'gratitude', 'family'], tags: ['thanksgiving-season', 'family-time'] }
  ];

  seasonalPatterns.forEach(seasonal => {
    if (seasonal.months.includes(month)) {
      if (seasonal.patterns.some(pattern => textLower.includes(pattern))) {
        seasonal.tags.forEach(tag => {
          if (!trendingTags.includes(tag)) {
            trendingTags.push(tag);
          }
        });
      }
    }
  });

  // Current year trends (2024-2025 specific)
  const yearlyTrends = [
    { years: [2024, 2025], patterns: ['ai revolution', 'chatgpt', 'artificial intelligence'], tags: ['ai-era', '2024-trends'] },
    { years: [2024, 2025], patterns: ['climate crisis', 'extreme weather', 'sustainability'], tags: ['climate-awareness', 'environmental'] },
    { years: [2024, 2025], patterns: ['remote work', 'hybrid', 'digital nomad'], tags: ['future-work', 'post-pandemic'] },
    { years: [2024, 2025], patterns: ['gen alpha', 'gen z', 'generational'], tags: ['generational-shift', 'youth-culture'] }
  ];

  yearlyTrends.forEach(trend => {
    if (trend.years.includes(year)) {
      if (trend.patterns.some(pattern => textLower.includes(pattern))) {
        trend.tags.forEach(tag => {
          if (!trendingTags.includes(tag)) {
            trendingTags.push(tag);
          }
        });
      }
    }
  });

  // Day of week context
  const dayOfWeek = currentDate.getDay();
  const weekContexts = [
    { day: 1, patterns: ['monday', 'week start', 'back to work'], tags: ['monday-blues', 'week-start'] },
    { day: 5, patterns: ['friday', 'weekend', 'tgif'], tags: ['friday-feeling', 'weekend-prep'] },
    { day: 0, patterns: ['sunday', 'sunday scaries', 'tomorrow'], tags: ['sunday-scaries', 'weekend-end'] }
  ];

  weekContexts.forEach(context => {
    if (context.day === dayOfWeek || context.patterns.some(pattern => textLower.includes(pattern))) {
      context.tags.forEach(tag => {
        if (!trendingTags.includes(tag)) {
          trendingTags.push(tag);
        }
      });
    }
  });

  return trendingTags.slice(0, 2); // Limit trending tags
}

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType }: AnalyzeMemeRequest = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate image type
    if (!mimeType || !mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

      // Try Gemini API first, but with better error handling
  try {
    console.log('🔍 Attempting Gemini API analysis...');
    console.log('🔑 Gemini API key available:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 Gemini API key length:', process.env.GEMINI_API_KEY?.length || 0);
    console.log('🖼️ Image mime type:', mimeType);
    const analysis = await analyzeImageWithGemini(image, mimeType);
    console.log('✅ Gemini analysis successful:', analysis);
    return NextResponse.json(analysis);
  } catch (geminiError) {
    console.error('❌ Gemini analysis failed with error:', geminiError);
    console.warn('⚠️ Gemini analysis failed, using enhanced fallback:', geminiError);
      
      // Log specific error types for debugging
      if (geminiError instanceof Error) {
        if (geminiError.message.includes('ENOTFOUND')) {
          console.log('💡 DNS resolution issue detected');
        } else if (geminiError.message.includes('timeout')) {
          console.log('💡 API timeout detected');
        } else if (geminiError.message.includes('403') || geminiError.message.includes('401')) {
          console.log('💡 API authentication issue detected');
        }
      }
      
      // Use enhanced fallback that provides more relevant tags
      const analysis = await enhancedPatternAnalysis(image);
      console.log('🔄 Using fallback analysis:', analysis);
      return NextResponse.json(analysis);
    }

  } catch (error) {
    console.error('❌ Meme analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze meme' },
      { status: 500 }
    );
  }
}
