import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingGrid from '@/components/LoadingGrid';

describe('LoadingGrid', () => {
  it('renders loading skeletons with default count', () => {
    const { container } = render(<LoadingGrid />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');
    // Default count is 6, with 3 skeletons per item (image + 2 lines)
    expect(skeletons.length).toBe(6 * 3);
  });

  it('renders correct number of items based on count prop', () => {
    const { container } = render(<LoadingGrid count={3} />);
    const gridItems = container.querySelectorAll('[class*="space-y"]');
    expect(gridItems.length).toBeGreaterThanOrEqual(3);
  });

  it('applies correct grid columns class', () => {
    const { container } = render(<LoadingGrid columns={2} />);
    const grid = container.firstChild;
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('sm:grid-cols-2');
  });

  it('handles different column sizes', () => {
    const testCases = [
      { columns: 1 as const, shouldContain: 'grid-cols-1' },
      { columns: 2 as const, shouldContain: 'sm:grid-cols-2' },
      { columns: 3 as const, shouldContain: 'lg:grid-cols-3' },
      { columns: 4 as const, shouldContain: 'lg:grid-cols-4' },
    ];

    testCases.forEach(({ columns, shouldContain }) => {
      const { container } = render(<LoadingGrid columns={columns} />);
      const grid = container.firstChild;
      expect(grid?.className).toContain(shouldContain);
    });
  });
});
