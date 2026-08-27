import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  afterEach(() => {
    cleanup();
  });

  // --- Variant Rendering ---
  it('renders primary variant with correct base classes', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toHaveAttribute('data-variant', 'primary');
    expect(btn.className).toContain('bg-brand-strong');
    expect(btn.className).toContain('text-text-inverse');
    expect(btn.className).toContain('rounded-control');
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
    expect(btn.className).not.toContain('bg-brand-strong');
  });

  // --- Disabled State ---
  it('applies disabled:cursor-not-allowed when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: 'Disabled' });
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain('disabled:cursor-not-allowed');
    expect(btn.className).toContain('disabled:opacity-50');
  });

  it('blocks click handler when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>No Click</Button>);
    const btn = screen.getByRole('button', { name: 'No Click' });
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
