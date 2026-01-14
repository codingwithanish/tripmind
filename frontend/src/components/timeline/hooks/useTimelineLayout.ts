// useTimelineLayout - Layout calculation hook
// Implements the vertical influence zone algorithm from the spec

import { useMemo } from 'react';
import type { TimelineNode, LayoutResult, NodePosition, CardPosition } from '../TimelineTypes';
import type { TimelineStyle } from '../styles';

interface UseTimelineLayoutProps {
    nodes: TimelineNode[];
    style: TimelineStyle;
    viewMode: 'tasks' | 'recommendations';
}

/**
 * Calculate how many cards extend above/below a node's center
 * Cards are distributed symmetrically: half above, half below
 * If odd number, one card is at center level
 */
function calculateCardDistribution(cardCount: number): { above: number; below: number; center: boolean } {
    if (cardCount === 0) {
        return { above: 0, below: 0, center: false };
    }

    if (cardCount === 1) {
        return { above: 0, below: 0, center: true };
    }

    const isOdd = cardCount % 2 === 1;
    const half = Math.floor(cardCount / 2);

    if (isOdd) {
        // Odd: one center, rest split evenly
        return { above: half, below: half, center: true };
    } else {
        // Even: split evenly
        return { above: half, below: half, center: false };
    }
}

/**
 * Get the total card count for a node based on view mode
 */
function getVisibleCardCount(node: TimelineNode, viewMode: 'tasks' | 'recommendations'): number {
    const repCount = node.representations?.length || 0;
    // additional_input is a subtype, not a type
    const additionalInput = node.subtype === 'additional_input' || node.additional_input ? 1 : 0;

    if (node.type === 'start' || node.type === 'end') {
        return 0; // Start/end nodes have no cards
    }

    if (viewMode === 'tasks') {
        const taskCount = node.tasks?.length || 0;
        return taskCount + repCount + additionalInput;
    } else {
        const recCount = node.recommendations?.length || 0;
        return recCount + repCount + additionalInput;
    }
}

/**
 * Calculate the vertical space a node's cards occupy below its center
 */
function calculateDownwardInfluence(
    node: TimelineNode,
    style: TimelineStyle,
    viewMode: 'tasks' | 'recommendations'
): number {
    const cardCount = getVisibleCardCount(node, viewMode);
    const { below, center } = calculateCardDistribution(cardCount);

    // Cards below + center card (if exists) takes up half height below center
    const cardsBelow = below + (center ? 0.5 : 0);
    const cardSpace = cardsBelow * style.card.height;
    const gapSpace = Math.max(0, below) * style.card.spacing;

    return cardSpace + gapSpace;
}

/**
 * Calculate the vertical space a node's cards occupy above its center
 */
function calculateUpwardInfluence(
    node: TimelineNode,
    style: TimelineStyle,
    viewMode: 'tasks' | 'recommendations'
): number {
    const cardCount = getVisibleCardCount(node, viewMode);
    const { above, center } = calculateCardDistribution(cardCount);

    // Cards above + center card (if exists) takes up half height above center
    const cardsAbove = above + (center ? 0.5 : 0);
    const cardSpace = cardsAbove * style.card.height;
    const gapSpace = Math.max(0, above) * style.card.spacing;

    return cardSpace + gapSpace;
}

/**
 * Generate card positions for a node
 */
function generateCardPositions(
    node: TimelineNode,
    style: TimelineStyle,
    viewMode: 'tasks' | 'recommendations'
): CardPosition[] {
    const positions: CardPosition[] = [];
    const cards: Array<{ id: string; type: CardPosition['type'] }> = [];

    // Collect all visible cards
    if (node.representations) {
        node.representations.forEach(rep => {
            cards.push({ id: rep.id, type: 'representation' });
        });
    }

    if (viewMode === 'tasks' && node.tasks) {
        node.tasks.forEach(task => {
            cards.push({ id: task.id, type: 'task' });
        });
    }

    if (viewMode === 'recommendations' && node.recommendations) {
        node.recommendations.forEach(rec => {
            cards.push({ id: rec.id, type: 'recommendation' });
        });
    }

    if (node.additional_input) {
        cards.push({ id: node.additional_input.id, type: 'additional_input' });
    }

    const cardCount = cards.length;
    if (cardCount === 0) return positions;

    const { above, center } = calculateCardDistribution(cardCount);

    // Position cards from top to bottom
    let currentIndex = 0;

    // Cards above center
    for (let i = 0; i < above; i++) {
        const card = cards[currentIndex++];
        const distanceFromCenter = (above - i) * (style.card.height + style.card.spacing) - style.card.height / 2;
        positions.push({
            ...card,
            y: -distanceFromCenter,
            height: style.card.height,
        });
    }

    // Center card (if exists)
    if (center && currentIndex < cards.length) {
        const card = cards[currentIndex++];
        positions.push({
            ...card,
            y: 0, // Centered on node
            height: style.card.height,
        });
    }

    // Cards below center
    const belowCount = cardCount - above - (center ? 1 : 0);
    for (let i = 0; i < belowCount; i++) {
        const card = cards[currentIndex++];
        const distanceFromCenter = (i + 1) * (style.card.height + style.card.spacing) - style.card.height / 2;
        positions.push({
            ...card,
            y: distanceFromCenter,
            height: style.card.height,
        });
    }

    return positions;
}

/**
 * Main layout calculation hook
 */
export function useTimelineLayout({ nodes, style, viewMode }: UseTimelineLayoutProps): LayoutResult {
    return useMemo(() => {
        if (nodes.length === 0) {
            return {
                positions: [],
                totalHeight: style.spacing.topOffset * 2,
                spineStart: style.spacing.topOffset,
                spineEnd: style.spacing.topOffset,
            };
        }

        const positions: NodePosition[] = [];
        let currentY = style.spacing.topOffset;

        nodes.forEach((node, index) => {
            // Calculate minimum gap based on previous node's downward influence
            // and current node's upward influence
            if (index > 0) {
                const prevNode = nodes[index - 1];
                const prevDownward = calculateDownwardInfluence(prevNode, style, viewMode);
                const currentUpward = calculateUpwardInfluence(node, style, viewMode);

                // Total gap = prev downward + current upward + minimum gap
                const requiredGap = prevDownward + currentUpward + style.spacing.minNodeGap;
                currentY += requiredGap;
            }

            // Node center is at currentY
            const centerY = currentY;

            // Generate card positions relative to center
            const cards = generateCardPositions(node, style, viewMode);

            // Calculate total height this node occupies
            const upward = calculateUpwardInfluence(node, style, viewMode);
            const downward = calculateDownwardInfluence(node, style, viewMode);
            const totalHeight = upward + downward;

            positions.push({
                nodeId: node.id,
                centerY,
                dateCardY: centerY, // Date card is vertically centered on node
                cards,
                totalHeight,
            });
        });

        // Calculate spine boundaries
        const spineStart = positions[0]?.centerY || style.spacing.topOffset;
        const lastPos = positions[positions.length - 1];
        const spineEnd = lastPos ? lastPos.centerY : style.spacing.topOffset;

        // Total height includes some padding at the bottom
        const totalHeight = spineEnd +
            calculateDownwardInfluence(nodes[nodes.length - 1], style, viewMode) +
            style.spacing.topOffset;

        return {
            positions,
            totalHeight,
            spineStart,
            spineEnd,
        };
    }, [nodes, style, viewMode]);
}
