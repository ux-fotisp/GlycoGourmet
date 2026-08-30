import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GroceryListModal from '../GroceryListModal';

describe('GroceryListModal Component', () => {
  const mockManifest = {
    produce: [
      { id: 'ing-1', name: 'Spinach', amount: 200, unit: 'g', category: 'produce' },
      { id: 'ing-2', name: 'Broccoli', amount: 150, unit: 'g', category: 'produce' },
    ],
    proteins: [
      { id: 'ing-3', name: 'Wild Salmon', amount: 300, unit: 'g', category: 'proteins' },
    ],
    dairy: [],
    pantry: [
      { id: 'ing-4', name: 'Olive Oil', amount: 30, unit: 'ml', category: 'pantry' },
    ],
    other: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GroceryListModal isOpen={false} onClose={vi.fn()} manifest={mockManifest} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders categorized grocery items with units and amounts when open', () => {
    render(
      <GroceryListModal isOpen={true} onClose={vi.fn()} manifest={mockManifest} />
    );

    expect(screen.getByText('7-Day Grocery Manifest')).toBeDefined();
    expect(screen.getByText('Spinach')).toBeDefined();
    expect(screen.getByText('200 g')).toBeDefined();
    expect(screen.getByText('Wild Salmon')).toBeDefined();
    expect(screen.getByText('300 g')).toBeDefined();
    expect(screen.getByText('Olive Oil')).toBeDefined();
    expect(screen.getByText('30 ml')).toBeDefined();
  });

  it('allows checking and unchecking items, persisting in state', () => {
    render(
      <GroceryListModal isOpen={true} onClose={vi.fn()} manifest={mockManifest} />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(4);

    // Initial total
    expect(screen.getByText(/0 \/ 4 items/i)).toBeDefined();

    // Check first item
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 \/ 4 items/i)).toBeDefined();

    // Reset checks button
    const resetBtn = screen.getByText(/Reset Checks/i);
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 \/ 4 items/i)).toBeDefined();
  });

  it('calls onClose when Done or Close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <GroceryListModal isOpen={true} onClose={handleClose} manifest={mockManifest} />
    );

    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
