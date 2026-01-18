// useStyleConfig - Hook for accessing style configuration

import { useState, useEffect } from 'react';
import type { TimelineStyle } from '../styles';
import { getDefaultStyle, loadStyle } from '../styles';

interface UseStyleConfigResult {
    style: TimelineStyle;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to load and access style configuration
 * Returns default style immediately, then loads custom style if specified
 */
export function useStyleConfig(styleName: string = 'default'): UseStyleConfigResult {
    const [style, setStyle] = useState<TimelineStyle>(getDefaultStyle());
    const [isLoading, setIsLoading] = useState(styleName !== 'default');
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (styleName === 'default') {
            setStyle(getDefaultStyle());
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        loadStyle(styleName)
            .then(loadedStyle => {
                setStyle(loadedStyle);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(`Failed to load style "${styleName}":`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
                setStyle(getDefaultStyle()); // Fallback to default
                setIsLoading(false);
            });
    }, [styleName]);

    return { style, isLoading, error };
}
