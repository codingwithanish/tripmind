import React, { useState } from 'react';
import { AdditionalInput } from '../../../types/websocket.types';
import './AdditionalInputCardNew.css';

export interface AdditionalInputCardNewProps {
    input: AdditionalInput;
    onSubmit?: (value: string) => void;
}

const AdditionalInputCardNew: React.FC<AdditionalInputCardNewProps> = ({ input, onSubmit }) => {
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        if (value.trim() && onSubmit) {
            onSubmit(value.trim());
            setValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="additional-input-card">
            {/* Question */}
            <div className="additional-input-card__question">
                <span className="additional-input-card__question-icon">❓</span>
                <span className="additional-input-card__question-text">{input.question}</span>
            </div>

            {/* Blocking notice */}
            <div className="additional-input-card__notice">
                <span className="additional-input-card__notice-icon">⏸</span>
                <span className="additional-input-card__notice-text">Answer to continue building your timeline</span>
            </div>

            {/* Input area */}
            <div className="additional-input-card__input-area">
                <input
                    type="text"
                    className="additional-input-card__input"
                    placeholder={input.placeholder || 'Type your preferences...'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button
                    className="additional-input-card__submit"
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default AdditionalInputCardNew;
