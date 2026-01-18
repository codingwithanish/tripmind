import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { SuggestionTemplate } from '@services/suggestionService';
import MarkdownRenderer from '@components/common/MarkdownRenderer';
import './SuggestionCard.css';

interface PlaceholderValue {
  value: string;
  isCommitted: boolean;
}

interface TypewriterState {
  optionSetIndex: number;
  currentPlaceholderIndex: number;
  displayTexts: Record<string, string>;
  phase: 'typing' | 'paused' | 'erasing';
  isForward: boolean; // true = filling placeholders, false = erasing them
}

export interface SuggestionCardRef {
  reset: () => void;
}

interface SuggestionCardProps {
  template: SuggestionTemplate;
  onSubmit: (resolvedSentence: string) => void;
  onFocus?: () => void;
  onCompleteChange?: (isComplete: boolean) => void;
  isActive?: boolean;
  isCompleted?: boolean;
  isDimmed?: boolean;
}

const TYPING_SPEED = 80;
const ERASING_SPEED = 40;
const PAUSE_DURATION = 2000;

const SuggestionCard = forwardRef<SuggestionCardRef, SuggestionCardProps>((
  { template, onSubmit, onFocus, onCompleteChange, isCompleted, isDimmed },
  ref
) => {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, PlaceholderValue>>({});
  const [focusedPlaceholder, setFocusedPlaceholder] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get ordered placeholder keys
  const placeholderKeys = useMemo(() => Object.keys(template.placeholders), [template.placeholders]);

  // Get max options count across all placeholders
  const maxOptions = useMemo(() => {
    return Math.max(...Object.values(template.placeholders).map((p) => p.options.length), 1);
  }, [template.placeholders]);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      const initial: Record<string, PlaceholderValue> = {};
      placeholderKeys.forEach((key) => {
        initial[key] = {
          value: '',
          isCommitted: false,
        };
      });
      setPlaceholderValues(initial);
      setFocusedPlaceholder(null);
    },
  }), [placeholderKeys]);

  // Typewriter state
  const [typewriter, setTypewriter] = useState<TypewriterState>({
    optionSetIndex: 0,
    currentPlaceholderIndex: 0,
    displayTexts: {},
    phase: 'typing',
    isForward: true,
  });

  // Initialize placeholder values
  useEffect(() => {
    const initial: Record<string, PlaceholderValue> = {};
    placeholderKeys.forEach((key) => {
      initial[key] = {
        value: '',
        isCommitted: false,
      };
    });
    setPlaceholderValues(initial);
  }, [placeholderKeys]);

  // Check if all placeholders are committed (user has filled them)
  const allCommitted = useMemo(() => {
    return placeholderKeys.every((key) => placeholderValues[key]?.isCommitted);
  }, [placeholderKeys, placeholderValues]);

  // Typewriter effect
  useEffect(() => {
    if (placeholderKeys.length === 0 || allCommitted) return;

    const currentKey = placeholderKeys[typewriter.currentPlaceholderIndex];
    if (!currentKey) return;

    // Skip committed placeholders
    if (placeholderValues[currentKey]?.isCommitted) {
      // Find next uncommitted in the appropriate direction
      if (typewriter.isForward) {
        const nextIndex = placeholderKeys.findIndex(
          (key, idx) => idx > typewriter.currentPlaceholderIndex && !placeholderValues[key]?.isCommitted
        );
        if (nextIndex !== -1) {
          setTypewriter((prev) => ({ ...prev, currentPlaceholderIndex: nextIndex }));
        } else {
          // All filled, start erasing from the end
          const lastUncommitted = [...placeholderKeys]
            .reverse()
            .findIndex((key) => !placeholderValues[key]?.isCommitted);
          if (lastUncommitted !== -1) {
            setTypewriter((prev) => ({
              ...prev,
              currentPlaceholderIndex: placeholderKeys.length - 1 - lastUncommitted,
              phase: 'paused',
            }));
          }
        }
      } else {
        const prevIndex = [...placeholderKeys]
          .slice(0, typewriter.currentPlaceholderIndex)
          .reverse()
          .findIndex((key) => !placeholderValues[key]?.isCommitted);
        if (prevIndex !== -1) {
          setTypewriter((prev) => ({
            ...prev,
            currentPlaceholderIndex: typewriter.currentPlaceholderIndex - 1 - prevIndex,
          }));
        }
      }
      return;
    }

    const placeholder = template.placeholders[currentKey];
    if (!placeholder || placeholder.options.length === 0) return;

    const optionIndex = typewriter.optionSetIndex % placeholder.options.length;
    const targetText = placeholder.options[optionIndex]?.value || '';
    const currentDisplayText = typewriter.displayTexts[currentKey] || '';

    // Handle pause (full sentence complete)
    if (typewriter.phase === 'paused') {
      const pauseTimer = setTimeout(() => {
        // Start erasing from the last placeholder
        setTypewriter((prev) => ({
          ...prev,
          phase: 'erasing',
          isForward: false,
          currentPlaceholderIndex: placeholderKeys.length - 1,
        }));
      }, PAUSE_DURATION);
      return () => clearTimeout(pauseTimer);
    }

    // Handle typing phase
    if (typewriter.phase === 'typing') {
      if (currentDisplayText.length < targetText.length) {
        const typeTimer = setTimeout(() => {
          setTypewriter((prev) => ({
            ...prev,
            displayTexts: {
              ...prev.displayTexts,
              [currentKey]: targetText.slice(0, currentDisplayText.length + 1),
            },
          }));
        }, TYPING_SPEED);
        return () => clearTimeout(typeTimer);
      } else {
        // Finished typing this placeholder, move to next
        const nextIndex = typewriter.currentPlaceholderIndex + 1;
        if (nextIndex < placeholderKeys.length) {
          // Check if next is committed
          const nextKey = placeholderKeys[nextIndex];
          if (placeholderValues[nextKey]?.isCommitted) {
            // Find next uncommitted
            const nextUncommitted = placeholderKeys.findIndex(
              (key, idx) => idx > nextIndex && !placeholderValues[key]?.isCommitted
            );
            if (nextUncommitted !== -1) {
              setTypewriter((prev) => ({
                ...prev,
                currentPlaceholderIndex: nextUncommitted,
              }));
            } else {
              // All done typing, pause
              setTypewriter((prev) => ({
                ...prev,
                phase: 'paused',
              }));
            }
          } else {
            setTypewriter((prev) => ({
              ...prev,
              currentPlaceholderIndex: nextIndex,
            }));
          }
        } else {
          // All placeholders filled, pause before erasing
          setTypewriter((prev) => ({
            ...prev,
            phase: 'paused',
          }));
        }
      }
    }

    // Handle erasing phase
    if (typewriter.phase === 'erasing') {
      if (currentDisplayText.length > 0) {
        const eraseTimer = setTimeout(() => {
          setTypewriter((prev) => ({
            ...prev,
            displayTexts: {
              ...prev.displayTexts,
              [currentKey]: currentDisplayText.slice(0, -1),
            },
          }));
        }, ERASING_SPEED);
        return () => clearTimeout(eraseTimer);
      } else {
        // Finished erasing this placeholder, move to previous
        const prevIndex = typewriter.currentPlaceholderIndex - 1;
        if (prevIndex >= 0) {
          // Check if prev is committed
          const prevKey = placeholderKeys[prevIndex];
          if (placeholderValues[prevKey]?.isCommitted) {
            // Find prev uncommitted
            const prevUncommitted = [...placeholderKeys]
              .slice(0, prevIndex)
              .reverse()
              .findIndex((key) => !placeholderValues[key]?.isCommitted);
            if (prevUncommitted !== -1) {
              setTypewriter((prev) => ({
                ...prev,
                currentPlaceholderIndex: prevIndex - 1 - prevUncommitted,
              }));
            } else {
              // All done erasing, move to next option set
              setTypewriter((prev) => ({
                ...prev,
                optionSetIndex: prev.optionSetIndex + 1,
                currentPlaceholderIndex: 0,
                phase: 'typing',
                isForward: true,
              }));
            }
          } else {
            setTypewriter((prev) => ({
              ...prev,
              currentPlaceholderIndex: prevIndex,
            }));
          }
        } else {
          // All placeholders erased, move to next option set
          setTypewriter((prev) => ({
            ...prev,
            optionSetIndex: (prev.optionSetIndex + 1) % maxOptions,
            currentPlaceholderIndex: 0,
            phase: 'typing',
            isForward: true,
          }));
        }
      }
    }
  }, [typewriter, placeholderKeys, template.placeholders, placeholderValues, allCommitted, maxOptions]);

  const handleInputChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: {
        value,
        isCommitted: value.length > 0,
      },
    }));
  };

  const handleInputFocus = (key: string) => {
    setFocusedPlaceholder(key);
    onFocus?.();
  };

  const handleInputBlur = () => {
    setFocusedPlaceholder(null);
  };

  const handleOptionSelect = (key: string, value: string) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [key]: {
        value,
        isCommitted: true,
      },
    }));
    // Move focus to next unfilled placeholder or blur
    const currentIndex = placeholderKeys.indexOf(key);
    for (let i = currentIndex + 1; i < placeholderKeys.length; i++) {
      if (!placeholderValues[placeholderKeys[i]]?.isCommitted) {
        inputRefs.current[placeholderKeys[i]]?.focus();
        return;
      }
    }
    inputRefs.current[key]?.blur();
  };

  const getDisplayValue = (key: string): string => {
    const val = placeholderValues[key];
    if (val?.isCommitted || val?.value) {
      return val.value;
    }
    return typewriter.displayTexts[key] || '';
  };

  const isAllRequiredFilled = useCallback((): boolean => {
    return Object.entries(template.placeholders).every(([key, placeholder]) => {
      if (!placeholder.required) return true;
      const val = placeholderValues[key];
      return val?.isCommitted && val.value.trim().length > 0;
    });
  }, [template.placeholders, placeholderValues]);

  // Notify parent when completion state changes
  useEffect(() => {
    const isComplete = isAllRequiredFilled();
    onCompleteChange?.(isComplete);
  }, [isAllRequiredFilled, onCompleteChange]);

  const getResolvedSentence = (): string => {
    let sentence = template.template_text;
    Object.entries(placeholderValues).forEach(([key, val]) => {
      sentence = sentence.replace(`{{${key}}}`, val.value);
    });
    return sentence;
  };

  const handleSubmit = () => {
    if (isAllRequiredFilled()) {
      onSubmit(getResolvedSentence());
    }
  };

  // Check if cursor should show for a placeholder
  const shouldShowCursor = (key: string): boolean => {
    const val = placeholderValues[key];
    if (val?.isCommitted || val?.value) return false;
    if (focusedPlaceholder === key) return false;

    const keyIndex = placeholderKeys.indexOf(key);
    return keyIndex === typewriter.currentPlaceholderIndex && typewriter.phase !== 'paused';
  };

  // Parse template text and render with inline inputs
  const renderTemplate = () => {
    const parts: React.ReactNode[] = [];
    const regex = /\{\{(\w+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(template.template_text)) !== null) {
      // Add text before placeholder (render as Markdown)
      if (match.index > lastIndex) {
        const textContent = template.template_text.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`} className="template-text">
            <MarkdownRenderer content={textContent} inline />
          </span>
        );
      }

      const placeholderKey = match[1];
      const placeholder = template.placeholders[placeholderKey];

      if (placeholder) {
        const displayValue = getDisplayValue(placeholderKey);
        const isActive = focusedPlaceholder === placeholderKey;
        const isCommitted = placeholderValues[placeholderKey]?.isCommitted;
        const showCursor = shouldShowCursor(placeholderKey);

        // Calculate width based on displayed text or minimum
        const optionIndex = typewriter.optionSetIndex % placeholder.options.length;
        const targetText = placeholder.options[optionIndex]?.value || '';
        const widthText = displayValue || targetText || '   ';

        parts.push(
          <span key={`placeholder-${placeholderKey}`} className="placeholder-wrapper">
            <span className="placeholder-input-wrapper">
              <input
                ref={(el) => {
                  inputRefs.current[placeholderKey] = el;
                }}
                type="text"
                className={`placeholder-input ${isCommitted ? 'committed' : ''}`}
                value={placeholderValues[placeholderKey]?.value || ''}
                onChange={(e) => handleInputChange(placeholderKey, e.target.value)}
                onFocus={() => handleInputFocus(placeholderKey)}
                onBlur={handleInputBlur}
                style={{ width: `${Math.max(widthText.length, 3) + 1}ch` }}
              />
              {!isCommitted && !placeholderValues[placeholderKey]?.value && (
                <span className="placeholder-hint">
                  {displayValue}
                  {showCursor && <span className="typewriter-cursor">|</span>}
                </span>
              )}
            </span>
            {isActive && !isCommitted && placeholder.options.length > 0 && (
              <div className="options-dropdown">
                {placeholder.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="option-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleOptionSelect(placeholderKey, opt.value);
                    }}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            )}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text (render as Markdown)
    if (lastIndex < template.template_text.length) {
      const textContent = template.template_text.slice(lastIndex);
      parts.push(
        <span key={`text-${lastIndex}`} className="template-text">
          <MarkdownRenderer content={textContent} inline />
        </span>
      );
    }

    return parts;
  };

  // Build class names for the card
  const cardClassName = useMemo(() => {
    const classes = ['suggestion-card'];
    if (isCompleted) classes.push('completed');
    if (isDimmed) classes.push('dimmed');
    return classes.join(' ');
  }, [isCompleted, isDimmed]);

  return (
    <div className={cardClassName}>
      <div className="suggestion-content">{renderTemplate()}</div>
      <button
        type="button"
        className={`suggestion-arrow ${isAllRequiredFilled() ? 'enabled' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={!isAllRequiredFilled()}
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
});

export default SuggestionCard;
