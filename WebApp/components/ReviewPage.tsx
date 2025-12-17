import React, { useState } from 'react';
import { Button } from './ui/Button';

interface ReviewPageProps {
  onBack: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onBack }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback);
    setIsSubmitted(true);
    setFeedback('');
    setTimeout(() => setIsSubmitted(false), 3000); // Reset after 3 seconds
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl font-display">
          Share Your Feedback
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          We'd love to hear your thoughts, suggestions, or ideas for new features!
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type your feedback here..."
            className="w-full h-40 p-4 border border-gray-400 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            required
          />
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onBack} type="button" className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">
              &larr; Back to Home
            </Button>
            <Button type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>

        {isSubmitted && (
          <p className="mt-6 text-green-600 dark:text-green-400">
            Thank you for your feedback!
          </p>
        )}
      </div>
    </main>
  );
};