import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm Action')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('does not render when open is false', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    // Dialog should not be visible (Radix dialogs use portal, so we check if dialog content exists)
    const dialogContent = screen.queryByText('Confirm Action');
    if (dialogContent) {
      expect(dialogContent.closest('[data-state]')).toBeFalsy();
    }
  });

  it('displays custom action and cancel labels', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        actionLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Delete/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Keep/i })).toBeTruthy();
  });

  it('calls onConfirm when action button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        isLoading={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn.hasAttribute('disabled') || btn.classList.contains('disabled')).toBeTruthy();
    });
  });

  it('applies danger styling when isDangerous is true', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Test"
        description="Test"
        isDangerous={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const actionBtn = screen.getByRole('button', { name: /Continue/i });
    expect(actionBtn.className).toContain('destructive');
  });
});

// Note: Import vitest's vi for mocking
import { vi } from 'vitest';
