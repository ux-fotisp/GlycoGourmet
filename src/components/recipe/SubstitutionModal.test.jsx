import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import SubstitutionModal from './SubstitutionModal';

describe('SubstitutionModal component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    originalName: 'White Rice',
    substitutionName: 'Cauliflower Rice',
    reason: 'Lower glycemic index with 80% fewer net carbs, preventing blood sugar spikes.',
    onSwap: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // --- Not rendered when closed ---
  it('returns null when isOpen is false', () => {
    const { container } = render(<SubstitutionModal {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  // --- Visible when open ---
  it('renders modal when isOpen is true', () => {
    render(<SubstitutionModal {...defaultProps} />);
    expect(screen.getByText('Substitution Suggestion')).toBeDefined();
  });

  // --- Backdrop blur ---
  it('renders backdrop with blur effect', () => {
    const { container } = render(<SubstitutionModal {...defaultProps} />);
    const backdrop = container.querySelector('.backdrop-blur-md');
    expect(backdrop).not.toBeNull();
  });

  // --- Original → Substitution names ---
  it('displays original and substitution ingredient names', () => {
    render(<SubstitutionModal {...defaultProps} />);
    expect(screen.getByText(/White Rice/)).toBeDefined();
    expect(screen.getByText(/Cauliflower Rice/)).toBeDefined();
  });

  // --- Reason text ---
  it('displays the substitution reason text', () => {
    render(<SubstitutionModal {...defaultProps} />);
    expect(screen.getByText(/Lower glycemic index/)).toBeDefined();
  });

  it('falls back to default reason when reason is empty', () => {
    render(<SubstitutionModal {...defaultProps} reason="" />);
    expect(screen.getByText(/much better option/)).toBeDefined();
  });

  // --- Glucose Impact badge ---
  it('renders Glucose Impact with Stable Release badge', () => {
    render(<SubstitutionModal {...defaultProps} />);
    expect(screen.getByText('Glucose Impact')).toBeDefined();
    expect(screen.getByText('Stable Release')).toBeDefined();
  });

  // --- Fiber Profile badge ---
  it('renders Fiber Profile as Improved', () => {
    render(<SubstitutionModal {...defaultProps} />);
    expect(screen.getByText('Fiber Profile')).toBeDefined();
    expect(screen.getByText('Improved')).toBeDefined();
  });

  // --- Swap action ---
  it('calls onSwap and onClose when Swap & Apply is clicked', () => {
    render(<SubstitutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Swap/));
    expect(defaultProps.onSwap).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Cancel action ---
  it('calls onClose when Cancel is clicked', () => {
    render(<SubstitutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Backdrop click closes ---
  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<SubstitutionModal {...defaultProps} />);
    const backdrop = container.querySelector('.backdrop-blur-md');
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
