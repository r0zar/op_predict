import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });
  
  it('renders with different variants', () => {
    render(<Button variant="destructive">Destructive</Button>);
    
    const button = screen.getByRole('button', { name: /destructive/i });
    expect(button).toHaveClass('bg-destructive');
  });
  
  it('renders with different sizes', () => {
    render(<Button size="sm">Small</Button>);
    
    const button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8');
  });
  
  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });
  
  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button', { name: /clickable/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});