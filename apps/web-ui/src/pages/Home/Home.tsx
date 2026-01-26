import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SuggestionCard, { SuggestionCardRef } from '@components/common/SuggestionCard';
import CustomInputCard from '@components/common/CustomInputCard';
import { getSuggestionTemplates, SuggestionTemplate } from '@services/suggestionService';
import chatService from '@services/chatService';
import './Home.css';

const Home: React.FC = () => {
  const [templates, setTemplates] = useState<SuggestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [completedSuggestionId, setCompletedSuggestionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const cardRefs = useRef<Record<string, SuggestionCardRef | null>>({});
  // Guard against React StrictMode double-mount
  const hasFetchedRef = useRef(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // Get Screen Type
      const screenType = window.innerWidth < 768 ? 'mobile' : 'desktop';

      // Get Location (Default to Goa if fails)
      let lat = 15.2993;
      let lng = 74.1240;

      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      } catch (e) {
        console.warn('Geolocation access denied or failed, using default location:', e);
      }

      const data = await getSuggestionTemplates({ lat, lng, screenType });
      setTemplates(data.sort((a, b) => a.order - b.order));
      setError(null);
    } catch (err) {
      setError('Failed to load suggestions. Please try again.');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent duplicate fetch from React StrictMode double-mount
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchTemplates();
  }, []);

  const handleSubmit = async (sentence: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      // Use new API to create chat with initial message
      const response = await chatService.createNewChat(sentence);
      // Navigate to new chat room URL
      navigate(`/${response.user_id}/${response.thread_id}/chat`);
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError('Failed to start chat. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchTemplates();
  };

  const handleSuggestionFocus = (templateId: string) => {
    // If switching to a different suggestion, reset the previous one
    if (activeSuggestionId && activeSuggestionId !== templateId) {
      cardRefs.current[activeSuggestionId]?.reset();
    }
    setActiveSuggestionId(templateId);
    setCompletedSuggestionId(null);
  };

  const handleSuggestionComplete = (templateId: string, isComplete: boolean) => {
    if (isComplete) {
      setCompletedSuggestionId(templateId);
    } else if (completedSuggestionId === templateId) {
      setCompletedSuggestionId(null);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="suggestions-container">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading suggestions...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-button" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {templates.map((template) => (
                <SuggestionCard
                  key={template.id}
                  ref={(ref) => { cardRefs.current[template.id] = ref; }}
                  template={template}
                  onSubmit={handleSubmit}
                  onFocus={() => handleSuggestionFocus(template.id)}
                  onCompleteChange={(isComplete) => handleSuggestionComplete(template.id, isComplete)}
                  isActive={activeSuggestionId === template.id}
                  isCompleted={completedSuggestionId === template.id}
                  isDimmed={activeSuggestionId !== null && activeSuggestionId !== template.id}
                />
              ))}
              <CustomInputCard onSubmit={handleSubmit} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

