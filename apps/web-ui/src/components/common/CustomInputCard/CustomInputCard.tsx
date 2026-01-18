import React, { useState, useEffect } from 'react';
import './CustomInputCard.css';

interface CustomInputCardProps {
  onSubmit: (sentence: string) => void;
}

const TYPING_SPEED = 100;
const ERASING_SPEED = 50;
const PAUSE_DURATION = 1500;

const PLACEHOLDER_OPTIONS = [
  'Plan a weekend getaway to the mountains',
  'Family vacation to Europe for 2 weeks',
  'Solo backpacking trip through Southeast Asia',
  'Romantic trip to Paris for anniversary',
];

interface TypewriterState {
  optionIndex: number;
  displayText: string;
  isTyping: boolean;
  isPaused: boolean;
}

const CustomInputCard: React.FC<CustomInputCardProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [typewriter, setTypewriter] = useState<TypewriterState>({
    optionIndex: 0,
    displayText: '',
    isTyping: true,
    isPaused: false,
  });

  // Typewriter effect for placeholder
  useEffect(() => {
    // Don't animate if user has typed something or input is focused
    if (inputValue || isFocused) return;

    const currentOption = PLACEHOLDER_OPTIONS[typewriter.optionIndex];

    // Handle pause
    if (typewriter.isPaused) {
      const pauseTimer = setTimeout(() => {
        setTypewriter((prev) => ({
          ...prev,
          isPaused: false,
          isTyping: false,
        }));
      }, PAUSE_DURATION);
      return () => clearTimeout(pauseTimer);
    }

    // Handle typing
    if (typewriter.isTyping) {
      if (typewriter.displayText.length < currentOption.length) {
        const typeTimer = setTimeout(() => {
          setTypewriter((prev) => ({
            ...prev,
            displayText: currentOption.slice(0, prev.displayText.length + 1),
          }));
        }, TYPING_SPEED);
        return () => clearTimeout(typeTimer);
      } else {
        // Finished typing, pause before erasing
        setTypewriter((prev) => ({
          ...prev,
          isPaused: true,
        }));
      }
    } else {
      // Handle erasing
      if (typewriter.displayText.length > 0) {
        const eraseTimer = setTimeout(() => {
          setTypewriter((prev) => ({
            ...prev,
            displayText: prev.displayText.slice(0, -1),
          }));
        }, ERASING_SPEED);
        return () => clearTimeout(eraseTimer);
      } else {
        // Finished erasing, move to next option
        setTypewriter((prev) => ({
          ...prev,
          optionIndex: (prev.optionIndex + 1) % PLACEHOLDER_OPTIONS.length,
          isTyping: true,
        }));
      }
    }
  }, [typewriter, inputValue, isFocused]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSubmit();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const showTypewriter = !inputValue && !isFocused;

  return (
    <div className="custom-input-card">
      <div className="custom-input-wrapper">
        <input
          type="text"
          className="custom-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? 'Type your travel plan...' : ''}
        />
        {showTypewriter && (
          <span className="custom-input-typewriter">
            {typewriter.displayText}
            <span className="typewriter-cursor">|</span>
          </span>
        )}
      </div>
      <button
        type="button"
        className={`suggestion-arrow ${inputValue.trim() ? 'enabled' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={!inputValue.trim()}
        aria-label="Start planning"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default CustomInputCard;
