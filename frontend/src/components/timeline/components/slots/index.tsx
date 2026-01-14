// Slot Components - Node type-specific wrappers
// Provide semantic structure for different node types

import React from 'react';
import { useNode } from '../../TimelineContext';
import type { SlotProps } from '../../TimelineTypes';

// ============= Start Slot =============

export function StartSlot({ children }: SlotProps) {
    const { node } = useNode();

    if (node.type !== 'start') {
        return null;
    }

    return (
        <div className="timeline-slot timeline-slot--start">
            {children}
        </div>
    );
}

// ============= End Slot =============

export function EndSlot({ children }: SlotProps) {
    const { node } = useNode();

    if (node.type !== 'end') {
        return null;
    }

    return (
        <div className="timeline-slot timeline-slot--end">
            {children}
        </div>
    );
}

// ============= Activity Slot =============

export function ActivitySlot({ children }: SlotProps) {
    const { node } = useNode();

    // Activity slot is for task_node type with tasks/recommendations
    if (node.type !== 'task_node') {
        return null;
    }

    return (
        <div className="timeline-slot timeline-slot--activity">
            {children}
        </div>
    );
}

// ============= Representation Slot =============

export function RepresentationSlot({ children }: SlotProps) {
    const { node } = useNode();

    if (node.type !== 'representation_node') {
        return null;
    }

    return (
        <div className="timeline-slot timeline-slot--representation">
            {children}
        </div>
    );
}

// ============= User Input Slot =============

export function UserInputSlot({ children }: SlotProps) {
    const { node, isBlocking } = useNode();

    // Only render for additional_input subtype
    if (node.subtype !== 'additional_input') {
        return null;
    }

    return (
        <div
            className={`timeline-slot timeline-slot--user-input ${isBlocking ? 'timeline-slot--blocking' : ''}`}
        >
            {children}
        </div>
    );
}

