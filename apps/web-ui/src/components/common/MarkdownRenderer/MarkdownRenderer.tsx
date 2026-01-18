import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownRenderer.css';

export interface MarkdownRendererProps {
    content: string;
    className?: string;
    inline?: boolean;
}

/**
 * A component that renders markdown content with proper styling.
 * Supports inline mode for short snippets within text.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className = '',
    inline = false
}) => {
    if (inline) {
        // For inline content, we render as a span and process only basic formatting
        return (
            <span className={`markdown-inline ${className}`}>
                <ReactMarkdown
                    components={{
                        // Override block elements to render as inline
                        p: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
                        strong: ({ children }: { children?: ReactNode }) => <strong>{children}</strong>,
                        em: ({ children }: { children?: ReactNode }) => <em>{children}</em>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </span>
        );
    }

    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
