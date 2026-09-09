import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  afterEach(() => {
    cleanup();
  });

  // --- Variant Rendering ---
  it('renders primary variant with gradient styling', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toHaveAttribute('data-variant', 'primary');
    expect(btn.className).toContain('btn-gradient-primary');
    expect(btn.className).toContain('rounded-control');
    expect(btn.style.background).toContain('linear-gradient');
    // Browser serializes #1A3409 to rgb(26, 52, 9)
    expect(btn.style.background).toContain('rgb(26, 52, 9)');
  });

  it('renders destructive variant with red gradient styling', () => {
    render(<Button variant="destructive">Reject Recipe</Button>);
    const btn = screen.getByRole('button', { name: 'Reject Recipe' });
    expect(btn).toHaveAttribute('data-variant', 'destructive');
    expect(btn.className).toContain('btn-gradient-destructive');
    expect(btn.className).toContain('rounded-control');
    expect(btn.style.background).toContain('linear-gradient');
    // Browser serializes #7B1818 to rgb(123, 24, 24)
    expect(btn.style.background).toContain('rgb(123, 24, 24)');
  });

  it('renders secondary variant with border styling', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button', { name: 'Secondary' });
    expect(btn).toHaveAttribute('data-variant', 'secondary');
    expect(btn.className).toContain('border');
    expect(btn.className).toContain('border-border-interactive');
    expect(btn.className).toContain('text-brand-strong');
  });

  it('renders ghost variant with underline hover', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn).toHaveAttribute('data-variant', 'ghost');
    expect(btn.className).toContain('hover:underline');
    expect(btn.className).not.toContain('btn-gradient-primary');
  });

  // --- Disabled State (Flat, not gradient) ---
  it('applies flat disabled styling and disables clicks when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain('disabled:cursor-not-allowed');
    expect(btn.style.backgroundColor).toBe('rgb(227, 223, 213)'); // #E3DFD5
    expect(btn.style.color).toBe('rgb(155, 155, 142)'); // #9B9B8E
  });

  it('blocks click handler when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>No Click</Button>);
    const btn = screen.getByRole('button', { name: 'No Click' });
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- Loading State ---
  it('renders spinner and loadingText when isLoading is true', () => {
    render(<Button isLoading loadingText="Saving…">Save</Button>);
    const btn = screen.getByRole('button', { name: 'Saving…' });
    expect(btn.disabled).toBe(true);
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn.style.backgroundColor).toBe('rgb(227, 223, 213)');
    expect(btn.style.color).toBe('rgb(155, 155, 142)');
    expect(btn.textContent).toContain('Saving…');
    const spinner = btn.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('renders spinner with default children when loadingText is omitted', () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole('button', { name: 'Submit' });
    expect(btn.disabled).toBe(true);
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn.textContent).toContain('Submit');
    const spinner = btn.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('blocks click handler when isLoading is true', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading</Button>);
    const btn = screen.getByRole('button', { name: 'Loading' });
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- Minimum Hit Target (44px) ---
  it('enforces 44px minimum hit target on default md size', () => {
    render(<Button>Target</Button>);
    const btn = screen.getByRole('button', { name: 'Target' });
    expect(btn.className).toContain('min-h-[44px]');
  });

  it('renders lg size with h-14 (56px)', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button', { name: 'Large' });
    expect(btn.className).toContain('h-14');
  });

  // --- Click Handler ---
  it('fires onClick callback when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Fire</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // --- Type Attribute ---
  it('defaults to type="button"', () => {
    render(<Button>Btn</Button>);
    const btn = screen.getByRole('button', { name: 'Btn' });
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    const btn = screen.getByRole('button', { name: 'Submit' });
    expect(btn.getAttribute('type')).toBe('submit');
  });
});
