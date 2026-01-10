import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuggestionCard from '@components/common/SuggestionCard';
import CustomInputCard from '@components/common/CustomInputCard';
import { getSuggestionTemplates, SuggestionTemplate } from '@services/suggestionService';
import './Home.css';

const Home: React.FC = () => {
  const [templates, setTemplates] = useState<SuggestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await getSuggestionTemplates();
        setTemplates(data.sort((a, b) => a.order - b.order));
        setError(null);
      } catch (err) {
        setError('Failed to load suggestions. Please try again.');
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = (sentence: string) => {
    navigate('/chat', { state: { initialMessage: sentence } });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    getSuggestionTemplates()
      .then((data) => {
        setTemplates(data.sort((a, b) => a.order - b.order));
      })
      .catch((err) => {
        setError('Failed to load suggestions. Please try again.');
        console.error('Error fetching templates:', err);
      })
      .finally(() => {
        setLoading(false);
      });
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
                  template={template}
                  onSubmit={handleSubmit}
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
