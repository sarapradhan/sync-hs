import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubjectBadge } from '../../../client/src/components/ui/subject-badge';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SubjectBadge', () => {
  it('renders subject name correctly', () => {
    renderWithQueryClient(
      <SubjectBadge subjectName="Math" />
    );

    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('applies correct styling for different variants', () => {
    const { rerender } = renderWithQueryClient(
      <SubjectBadge subjectName="Math" variant="default" />
    );

    let badge = screen.getByText('Math').closest('div');
    expect(badge).toHaveClass('bg-primary');

    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <SubjectBadge subjectName="Math" variant="outline" />
      </QueryClientProvider>
    );

    badge = screen.getByText('Math').closest('div');
    expect(badge).toHaveClass('border');
  });

  it('applies correct size classes', () => {
    const { rerender } = renderWithQueryClient(
      <SubjectBadge subjectName="Math" size="sm" />
    );

    let badge = screen.getByText('Math').closest('div');
    expect(badge).toHaveClass('text-xs');

    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <SubjectBadge subjectName="Math" size="lg" />
      </QueryClientProvider>
    );

    badge = screen.getByText('Math').closest('div');
    expect(badge).toHaveClass('text-base');
  });

  it('handles long subject names', () => {
    renderWithQueryClient(
      <SubjectBadge subjectName="Very Long Subject Name That Should Be Truncated" />
    );

    expect(screen.getByText('Very Long Subject Name That Should Be Truncated')).toBeInTheDocument();
  });
});