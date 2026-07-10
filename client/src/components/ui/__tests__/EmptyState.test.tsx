import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No results" description="Try a different search" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try a different search')).toBeInTheDocument();
  });

  it('renders action button when actionText and onAction provided', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Empty" description="Nothing here" actionText="Add New" onAction={onAction} />);
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('does not render action button when onAction is missing', () => {
    render(<EmptyState title="Empty" description="Nothing here" actionText="Add New" />);
    expect(screen.queryByText('Add New')).not.toBeInTheDocument();
  });

  it('does not render action button when actionText is missing', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Empty" description="Nothing here" onAction={onAction} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <EmptyState
        title="Custom"
        description="With icon"
        icon={<span data-testid="custom-icon">Star</span>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
