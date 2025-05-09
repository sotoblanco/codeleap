'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitFeedbackAction } from '@/app/actions';

interface FeedbackPanelProps {
  planId: string;
  stepId?: number;
  onFeedbackSubmitted?: () => void;
}

export function FeedbackPanel({ planId, stepId, onFeedbackSubmitted }: FeedbackPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentField, setShowCommentField] = useState(false);
  const [selectedRating, setSelectedRating] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (rating: 'thumbs_up' | 'thumbs_down') => {
    setSelectedRating(rating);
    setShowCommentField(true);
    // Always show the comment field first without auto-submitting
  };

  const submitFeedback = async (ratingToSubmit?: 'thumbs_up' | 'thumbs_down') => {
    const rating = ratingToSubmit || selectedRating;
    if (!rating) return;

    setIsSubmitting(true);
    try {
      await submitFeedbackAction({
        planId,
        stepId,
        rating,
        comment: comment.trim() || undefined,
      });
      
      setFeedbackSubmitted(true);
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50 text-sm">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-sm font-medium mb-3">How was this learning plan?</h3>
      
      <div className="flex gap-2 mb-4">
        <Button
          variant={selectedRating === 'thumbs_up' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRatingClick('thumbs_up')}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ThumbsUp className="h-4 w-4" />
          Helpful
        </Button>
        
        <Button
          variant={selectedRating === 'thumbs_down' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleRatingClick('thumbs_down')}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ThumbsDown className="h-4 w-4" />
          Not helpful
        </Button>
      </div>
      
      {showCommentField && (
        <>
          <div className="mb-3">
            <Textarea
              placeholder="Optional: Tell us more about your experience..."
              className="w-full resize-none"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowCommentField(false);
                setSelectedRating(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => submitFeedback()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit feedback'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 