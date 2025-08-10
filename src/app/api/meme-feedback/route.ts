import { NextRequest, NextResponse } from 'next/server';

interface FeedbackRequest {
  memeId: string;
  originalTags: string[];
  correctedTags: string[];
  userAction: 'add' | 'remove' | 'replace';
  description?: string;
  template?: string;
  confidence?: number;
}

interface FeedbackData {
  timestamp: string;
  memeId: string;
  originalTags: string[];
  correctedTags: string[];
  userAction: string;
  description?: string;
  template?: string;
  confidence?: number;
  improvements: {
    added: string[];
    removed: string[];
    common_patterns: string[];
  };
}

// Simple in-memory feedback storage (in production, use a database)
const feedbackStorage: FeedbackData[] = [];

export async function POST(request: NextRequest) {
  try {
    const feedbackData: FeedbackRequest = await request.json();

    // Validate required fields
    if (!feedbackData.memeId || !feedbackData.originalTags || !feedbackData.correctedTags) {
      return NextResponse.json(
        { error: 'Missing required feedback data' },
        { status: 400 }
      );
    }

    // Analyze the feedback to extract learning patterns
    const improvements = analyzeFeedbackPatterns(feedbackData);

    // Store the feedback with analysis
    const feedbackEntry: FeedbackData = {
      timestamp: new Date().toISOString(),
      memeId: feedbackData.memeId,
      originalTags: feedbackData.originalTags,
      correctedTags: feedbackData.correctedTags,
      userAction: feedbackData.userAction,
      description: feedbackData.description,
      template: feedbackData.template,
      confidence: feedbackData.confidence,
      improvements
    };

    feedbackStorage.push(feedbackEntry);

    // Log feedback for monitoring
    console.log('📝 Received meme tagging feedback:', {
      memeId: feedbackData.memeId,
      action: feedbackData.userAction,
      improvements: improvements
    });

    // Update learning patterns
    updateLearningPatterns(feedbackEntry);

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      learningInsights: improvements
    });

  } catch (error) {
    console.error('❌ Feedback processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'insights') {
      // Return learning insights from collected feedback
      const insights = generateLearningInsights();
      return NextResponse.json(insights);
    }

    if (action === 'patterns') {
      // Return common feedback patterns
      const patterns = getCommonFeedbackPatterns();
      return NextResponse.json(patterns);
    }

    // Return recent feedback (limited for privacy)
    const recentFeedback = feedbackStorage
      .slice(-10)
      .map(feedback => ({
        timestamp: feedback.timestamp,
        userAction: feedback.userAction,
        improvements: feedback.improvements
      }));

    return NextResponse.json({
      totalFeedback: feedbackStorage.length,
      recentFeedback
    });

  } catch (error) {
    console.error('❌ Feedback retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback data' },
      { status: 500 }
    );
  }
}

// Analyze feedback to extract learning patterns
function analyzeFeedbackPatterns(feedback: FeedbackRequest): {
  added: string[];
  removed: string[];
  common_patterns: string[];
} {
  const originalSet = new Set(feedback.originalTags);
  const correctedSet = new Set(feedback.correctedTags);

  const added = feedback.correctedTags.filter(tag => !originalSet.has(tag));
  const removed = feedback.originalTags.filter(tag => !correctedSet.has(tag));

  // Identify common patterns in corrections
  const common_patterns: string[] = [];
  
  // Pattern: Generic to specific transformations
  if (removed.some(tag => ['funny', 'humor', 'meme'].includes(tag)) && 
      added.some(tag => tag.includes('-') || tag.length > 6)) {
    common_patterns.push('generic-to-specific');
  }

  // Pattern: Template corrections
  if (added.some(tag => tag.includes('pointing') || tag.includes('brain') || tag.includes('fine'))) {
    common_patterns.push('template-correction');
  }

  // Pattern: Situational context additions
  if (added.some(tag => tag.includes('work') || tag.includes('stress') || tag.includes('social'))) {
    common_patterns.push('situational-context');
  }

  // Pattern: Cultural reference additions
  if (added.some(tag => tag.includes('gen-') || tag.includes('culture') || tag.includes('slang'))) {
    common_patterns.push('cultural-reference');
  }

  return { added, removed, common_patterns };
}

// Update learning patterns based on feedback
function updateLearningPatterns(feedback: FeedbackData): void {
  // This is a simplified learning mechanism
  // In production, this would update ML models or pattern databases
  
  // Log patterns for potential model improvements
  console.log('🧠 Learning pattern update:', {
    template: feedback.template,
    improvements: feedback.improvements,
    patterns: feedback.improvements.common_patterns
  });

  // Store commonly corrected patterns for future reference
  // This could feed into improving the AI prompt or tag hierarchy
}

// Generate insights from collected feedback
function generateLearningInsights(): Record<string, unknown> {
  if (feedbackStorage.length === 0) {
    return { message: 'No feedback data available yet' };
  }

  const totalFeedback = feedbackStorage.length;
  const actionCounts = feedbackStorage.reduce((acc, feedback) => {
    acc[feedback.userAction] = (acc[feedback.userAction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostAddedTags = feedbackStorage
    .flatMap(f => f.improvements.added)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const mostRemovedTags = feedbackStorage
    .flatMap(f => f.improvements.removed)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topAddedTags = Object.entries(mostAddedTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const topRemovedTags = Object.entries(mostRemovedTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalFeedback,
    actionCounts,
    topAddedTags,
    topRemovedTags,
    insights: {
      message: 'Users most commonly add specific contextual tags and remove generic ones',
      recommendation: 'Focus on generating more specific, situational tags'
    }
  };
}

// Get common feedback patterns
function getCommonFeedbackPatterns(): Record<string, unknown> {
  const patterns = feedbackStorage
    .flatMap(f => f.improvements.common_patterns)
    .reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    patterns: Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .map(([pattern, count]) => ({ pattern, count })),
    recommendations: generateRecommendations(patterns)
  };
}

// Generate recommendations based on patterns
function generateRecommendations(patterns: Record<string, number>): string[] {
  const recommendations: string[] = [];

  if (patterns['generic-to-specific'] > 2) {
    recommendations.push('Improve AI prompt to generate more specific tags initially');
  }

  if (patterns['template-correction'] > 1) {
    recommendations.push('Enhance template detection accuracy');
  }

  if (patterns['situational-context'] > 2) {
    recommendations.push('Add more situational context detection');
  }

  if (patterns['cultural-reference'] > 1) {
    recommendations.push('Expand cultural reference detection patterns');
  }

  return recommendations;
}