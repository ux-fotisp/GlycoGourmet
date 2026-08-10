import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  // --- Variant Rendering ---
  it('renders primary variant with correct base classes', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn.className).toContain('bg-primary');
    expect(btn.className).toContain('text-on-primary');
    expect(btn.className).toContain('rounded-full');
  });

  it('renders secondary variant with border styling', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button', { name: 'Secondary' });
    expect(btn.className).toContain('border');
    expect(btn.className).toContain('border-primary');
    expect(btn.className).toContain('text-primary');
  });

  it('renders ghost variant with underline hover', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn.className).toContain('hover:underline');
    expect(btn.className).not.toContain('bg-primary');
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

  // --- Minimum Hit Target (48px = h-12) ---
  it('enforces 48px minimum hit target on default md size', () => {
    render(<Button>Target</Button>);
    const btn = screen.getByRole('button', { name: 'Target' });
    // md size uses h-12 which is 48px (3rem)
    expect(btn.className).toContain('h-12');
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
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('accepts type="submit"', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });
});
