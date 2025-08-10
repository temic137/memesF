'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ThumbsUp, 
  Plus, 
  X, 
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface MemeTagFeedbackProps {
  memeId: string;
  originalTags: string[];
  description?: string;
  template?: string;
  confidence?: number;
  onFeedbackSubmitted?: () => void;
}

interface FeedbackState {
  isVisible: boolean;
  action: 'add' | 'remove' | 'replace' | null;
  newTags: string[];
  removedTags: string[];
  comments: string;
  isSubmitting: boolean;
  submitted: boolean;
}

export function MemeTagFeedback({
  memeId,
  originalTags,
  description,
  template,
  confidence,
  onFeedbackSubmitted
}: MemeTagFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    isVisible: false,
    action: null,
    newTags: [],
    removedTags: [],
    comments: '',
    isSubmitting: false,
    submitted: false
  });

  const [newTagInput, setNewTagInput] = useState('');

  const toggleFeedback = () => {
    setFeedback(prev => ({ 
      ...prev, 
      isVisible: !prev.isVisible,
      submitted: false 
    }));
  };

  const addNewTag = () => {
    if (newTagInput.trim() && !feedback.newTags.includes(newTagInput.trim())) {
      setFeedback(prev => ({
        ...prev,
        newTags: [...prev.newTags, newTagInput.trim()],
        action: prev.action || 'add'
      }));
      setNewTagInput('');
    }
  };

  const removeNewTag = (tagToRemove: string) => {
    setFeedback(prev => ({
      ...prev,
      newTags: prev.newTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleRemoveTag = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      removedTags: prev.removedTags.includes(tag)
        ? prev.removedTags.filter(t => t !== tag)
        : [...prev.removedTags, tag],
      action: prev.action || 'remove'
    }));
  };

  const submitFeedback = async () => {
    if (feedback.newTags.length === 0 && feedback.removedTags.length === 0) {
      return;
    }

    setFeedback(prev => ({ ...prev, isSubmitting: true }));

    try {
      const correctedTags = [
        ...originalTags.filter(tag => !feedback.removedTags.includes(tag)),
        ...feedback.newTags
      ];

      const feedbackData = {
        memeId,
        originalTags,
        correctedTags,
        userAction: feedback.action || 'replace',
        description: feedback.comments || description,
        template,
        confidence
      };

      const response = await fetch('/api/meme-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setFeedback(prev => ({ 
          ...prev, 
          submitted: true,
          isSubmitting: false 
        }));
        onFeedbackSubmitted?.();
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
          setFeedback(prev => ({ ...prev, isVisible: false }));
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedback(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNewTag();
    }
  };

  if (!feedback.isVisible) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFeedback}
          className="text-xs"
        >
          <ThumbsUp className="w-3 h-3 mr-1" />
          Improve Tags
        </Button>
        <span className="text-xs text-muted-foreground">
          Help us improve auto-tagging
        </span>
      </div>
    );
  }

  if (feedback.submitted) {
    return (
      <Card className="mt-2 border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Thank you for your feedback!</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Your input helps improve our auto-tagging system.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-2 border-blue-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Improve Auto-Tags
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFeedback}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Current Tags */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Current Tags (click to remove):
          </label>
          <div className="flex flex-wrap gap-1">
            {originalTags.map((tag) => (
              <Badge
                key={tag}
                variant={feedback.removedTags.includes(tag) ? "destructive" : "secondary"}
                className={`cursor-pointer text-xs ${
                  feedback.removedTags.includes(tag) 
                    ? 'line-through opacity-50' 
                    : 'hover:bg-red-100'
                }`}
                onClick={() => toggleRemoveTag(tag)}
              >
                {tag}
                {feedback.removedTags.includes(tag) && (
                  <X className="w-2 h-2 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Add New Tags */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Add Missing Tags:
          </label>
          <div className="flex gap-1 mb-2">
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a better tag..."
              className="h-7 text-xs"
            />
            <Button
              size="sm"
              onClick={addNewTag}
              disabled={!newTagInput.trim()}
              className="h-7 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {feedback.newTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {feedback.newTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="text-xs cursor-pointer hover:bg-green-600"
                  onClick={() => removeNewTag(tag)}
                >
                  {tag}
                  <X className="w-2 h-2 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Optional Comments */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Additional Context (optional):
          </label>
          {/* <Textarea
            value={feedback.comments}
            onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
            placeholder="Why are these tags better? What context is missing?"
            className="h-16 text-xs resize-none"
          /> */}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">
            Changes: +{feedback.newTags.length} -{feedback.removedTags.length}
          </span>
          <Button
            onClick={submitFeedback}
            disabled={
              (feedback.newTags.length === 0 && feedback.removedTags.length === 0) ||
              feedback.isSubmitting
            }
            size="sm"
            className="h-7"
          >
            <Send className="w-3 h-3 mr-1" />
            {feedback.isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}