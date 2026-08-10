import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CookMode from './CookMode';

const mockRecipe = {
  title: 'Crispy Salmon & Asparagus',
  steps: [
    { title: 'Prep the Salmon', description: 'Pat salmon dry and season with salt.', timer: 5 },
    { title: 'Heat the Pan', description: 'Heat olive oil in a cast-iron skillet over medium-high.', timer: 2 },
    { title: 'Cook', description: 'Sear salmon skin-side down for 4 minutes.', timer: 4 },
  ],
};

describe('CookMode component', () => {
  const defaultProps = {
    recipe: mockRecipe,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Visibility ---
  it('returns null when isOpen is false', () => {
    const { container } = render(<CookMode {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders fullscreen overlay when isOpen is true', () => {
    const { container } = render(<CookMode {...defaultProps} />);
    const overlay = container.firstChild;
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');
    expect(overlay.className).toContain('z-[200]');
  });

  // --- Step content ---
  it('renders the first step title and description', () => {
    render(<CookMode {...defaultProps} />);
    expect(screen.getAllByText('Prep the Salmon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pat salmon dry and season with salt.').length).toBeGreaterThan(0);
  });

  it('displays step progress indicator', () => {
    render(<CookMode {...defaultProps} />);
    expect(screen.getAllByText(/Step 1 of 3/).length).toBeGreaterThan(0);
  });

  // --- Timer badge ---
  it('renders timer badge when step has a timer', () => {
    render(<CookMode {...defaultProps} />);
    expect(screen.getAllByText(/5 mins/).length).toBeGreaterThan(0);
  });

  // --- Navigation ---
  it('advances to next step when Next button is clicked', () => {
    render(<CookMode {...defaultProps} />);
    const nextBtns = screen.getAllByText('Next Step');
    fireEvent.click(nextBtns[0]);
    expect(screen.getAllByText('Heat the Pan').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Step 2 of 3/).length).toBeGreaterThan(0);
  });

  it('goes back to previous step when Previous button is clicked', () => {
    render(<CookMode {...defaultProps} />);
    // Go to step 2
    fireEvent.click(screen.getAllByText('Next Step')[0]);
    expect(screen.getAllByText('Heat the Pan').length).toBeGreaterThan(0);
    // Go back to step 1
    fireEvent.click(screen.getAllByText('Previous')[0]);
    expect(screen.getAllByText('Prep the Salmon').length).toBeGreaterThan(0);
  });

  it('disables Previous button on first step', () => {
    const { container } = render(<CookMode {...defaultProps} />);
    const prevBtn = container.querySelector('button[disabled]');
    expect(prevBtn).not.toBeNull();
    expect(prevBtn.textContent).toContain('Previous');
  });

  // --- Finish / Completion ---
  it('shows "Bon Appétit!" after clicking through all steps', () => {
    render(<CookMode {...defaultProps} />);
    // Navigate to last step
    fireEvent.click(screen.getAllByText('Next Step')[0]);
    fireEvent.click(screen.getAllByText('Next Step')[0]);
    // Should now see "Finish"
    expect(screen.getAllByText('Finish').length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText('Finish')[0]);
    // Should now show completion screen
    expect(screen.getAllByText('Bon Appétit!').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Back to Dashboard').length).toBeGreaterThan(0);
  });

  // --- Exit ---
  it('calls onClose when Exit Cook Mode is clicked', () => {
    render(<CookMode {...defaultProps} />);
    const exitBtns = screen.getAllByText(/Exit Cook Mode/);
    fireEvent.click(exitBtns[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // --- Keyboard navigation ---
  it('advances step on ArrowRight key', () => {
    render(<CookMode {...defaultProps} />);
    expect(screen.getAllByText('Prep the Salmon').length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getAllByText('Heat the Pan').length).toBeGreaterThan(0);
  });

  it('closes on Escape key', () => {
    render(<CookMode {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
