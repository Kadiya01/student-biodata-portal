import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct width', () => {
    const { container } = render(<ProgressBar value={50} />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveStyle({ width: '50%' });
  });

  it('clamps value above 100 to 100%', () => {
    const { container } = render(<ProgressBar value={150} />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveStyle({ width: '100%' });
  });

  it('clamps negative value to 0%', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveStyle({ width: '0%' });
  });

  it('applies primary variant by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveClass('bg-brand-primary');
  });

  it('applies success variant', () => {
    const { container } = render(<ProgressBar value={50} variant="success" />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveClass('bg-emerald-500');
  });

  it('applies secondary variant', () => {
    const { container } = render(<ProgressBar value={50} variant="secondary" />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveClass('bg-brand-secondary');
  });

  it('applies accent variant', () => {
    const { container } = render(<ProgressBar value={50} variant="accent" />);
    const innerBar = container.querySelector('.h-full');
    expect(innerBar).toHaveClass('bg-brand-accent');
  });

  it('applies sm size by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).toHaveClass('h-2');
  });

  it('applies lg size', () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);
    expect(container.firstChild).toHaveClass('h-4');
  });
});
