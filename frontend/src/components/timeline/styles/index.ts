// Timeline Style Types and Loader
// Provides type-safe access to style configuration with fallback to default values

import defaultStyle from './default.json';

// ============= Style Type Definitions =============

export interface SpineStyle {
    x: number;
    strokeWidth: number;
    strokeColor: string;
    strokeLinecap: 'round' | 'square' | 'butt';
}

export interface NodeSizeConfig {
    start: number;
    end: number;
    default: number;
}

export interface NodeColors {
    start: string;
    end: string;
    task_node: string;
    representation_node: string;
}

export interface NodeStyle {
    size: NodeSizeConfig;
    colors: NodeColors;
    strokeWidth: number;
    strokeColor: string;
    shadow: string;
}

export interface CardStyle {
    height: number;
    spacing: number;
    dateCardGap: number;
    width: number;
}

export interface ConnectorStyle {
    strokeWidth: number;
    color: string;
    opacity: number;
    arrowSize: number;
}

export interface AnimationStyle {
    nodeDelay: number;
    cardDelay: number;
    duration: number;
    easing: string;
}

export interface SpacingStyle {
    minNodeGap: number;
    topOffset: number;
    dateBadgeDistance: number;
    dateBadgeWidth: number;
    cardDistance: number;
}

export interface TimelineStyle {
    spine: SpineStyle;
    node: NodeStyle;
    card: CardStyle;
    connector: ConnectorStyle;
    animation: AnimationStyle;
    spacing: SpacingStyle;
}

// ============= Style Cache =============

const styleCache = new Map<string, TimelineStyle>();

// ============= Deep Merge Utility =============

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
    const result = { ...base };

    for (const key in override) {
        if (Object.prototype.hasOwnProperty.call(override, key)) {
            const baseValue = base[key];
            const overrideValue = override[key];

            if (
                typeof baseValue === 'object' &&
                baseValue !== null &&
                typeof overrideValue === 'object' &&
                overrideValue !== null &&
                !Array.isArray(baseValue)
            ) {
                (result as Record<string, unknown>)[key] = deepMerge(
                    baseValue as object,
                    overrideValue as object
                );
            } else if (overrideValue !== undefined) {
                (result as Record<string, unknown>)[key] = overrideValue;
            }
        }
    }

    return result;
}

// ============= Style Loader =============

/**
 * Load a timeline style by name
 * Custom styles are merged with default.json, so missing values fall back to defaults
 */
export async function loadStyle(styleName: string): Promise<TimelineStyle> {
    // Check cache first
    if (styleCache.has(styleName)) {
        return styleCache.get(styleName)!;
    }

    // Default style is always available
    if (styleName === 'default') {
        const style = defaultStyle as TimelineStyle;
        styleCache.set('default', style);
        return style;
    }

    // Try to load custom style and merge with default
    try {
        const customStyle = await import(`./${styleName}.json`);
        const mergedStyle = deepMerge(defaultStyle as TimelineStyle, customStyle.default);
        styleCache.set(styleName, mergedStyle);
        return mergedStyle;
    } catch {
        // Fall back to default if custom style not found
        console.warn(`Style "${styleName}" not found, using default`);
        const style = defaultStyle as TimelineStyle;
        styleCache.set(styleName, style);
        return style;
    }
}

/**
 * Get the default style synchronously (for initial render)
 */
export function getDefaultStyle(): TimelineStyle {
    return defaultStyle as TimelineStyle;
}

/**
 * Clear the style cache (useful for hot reloading in development)
 */
export function clearStyleCache(): void {
    styleCache.clear();
}
