import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input component', () => {
  // --- Label Rendering ---
  it('renders label element above input when label prop is provided', () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText('Email');
    expect(label).toBeDefined();
    expect(label.tagName).toBe('LABEL');
    expect(label.getAttribute('for')).toBe('email-input');
  });

  it('does not render label when label prop is omitted', () => {
    const { container } = render(<Input placeholder="No label" />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  // --- Text Binding ---
  it('binds value prop to input element', () => {
    render(<Input value="hello@test.com" onChange={() => {}} />);
    const input = screen.getByDisplayValue('hello@test.com');
    expect(input).toBeDefined();
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'new text' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // --- Placeholder ---
  it('displays placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeDefined();
  });

  // --- Focus Ring ---
  it('includes focus:ring-2 and focus:ring-primary/20 classes for visual indicator', () => {
    const { container } = render(<Input placeholder="Focus test" />);
    const input = container.querySelector('input');
    expect(input.className).toContain('focus:ring-2');
    expect(input.className).toContain('focus:ring-primary/20');
  });

  // --- Error State ---
  it('renders error message and switches to error border', () => {
    render(<Input error="Required field" placeholder="Error test" />);
    expect(screen.getByText('Required field')).toBeDefined();
    const input = screen.getByPlaceholderText('Error test');
    expect(input.className).toContain('border-error');
  });

  it('uses primary ring when no error', () => {
    const { container } = render(<Input placeholder="Normal" />);
    const input = container.querySelector('input');
    expect(input.className).toContain('border-outline-variant');
    expect(input.className).toContain('focus:border-primary');
  });

  // --- Suffix ---
  it('renders suffix element when provided', () => {
    render(<Input suffix={<span data-testid="suffix-icon">$</span>} />);
    expect(screen.getByTestId('suffix-icon')).toBeDefined();
  });
});
