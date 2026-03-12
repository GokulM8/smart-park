import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeTruthy();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState 
        title="No results" 
        description="Try a different search term"
      />
    );
    expect(screen.getByText('Try a different search term')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState 
        title="No items" 
        action={<button>Create Item</button>}
      />
    );
    expect(screen.getByRole('button', { name: /create item/i })).toBeTruthy();
  });

  it('renders custom icon when provided', () => {
    const { container } = render(
      <EmptyState 
        title="Test" 
        icon={<div data-testid="custom-icon">Custom Icon</div>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeTruthy();
  });

  it('renders default icon when not provided', () => {
    const { container } = render(<EmptyState title="Test" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
