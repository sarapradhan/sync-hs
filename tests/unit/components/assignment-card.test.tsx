import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignmentCard } from '../../../client/src/components/assignments/assignment-card';
import type { Assignment } from '../../../shared/schema';

const mockAssignment: Assignment = {
  id: '1',
  title: 'Test Assignment',
  description: 'Test description',
  subject: 'Math',
  dueDate: new Date('2024-12-25T23:59:00.000Z'),
  priority: 'medium',
  status: 'pending',
  progress: 50,
  userId: 'user1',
  teacher: 'Test Teacher',
  type: 'homework',
  pointsEarned: null,
  pointsPossible: 100,
  createdAt: new Date('2024-12-18T10:00:00.000Z'),
  updatedAt: new Date('2024-12-18T10:00:00.000Z'),
  googleCalendarEventId: null
};

describe('AssignmentCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders assignment information correctly', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('assignment-title-1')).toHaveTextContent('Test Assignment');
    expect(screen.getByTestId('assignment-description-1')).toHaveTextContent('Test description');
    expect(screen.getByTestId('assignment-teacher-1')).toHaveTextContent('Test Teacher');
  });

  it('displays priority badge correctly', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
  });

  it('displays subject badge correctly', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('shows progress bar when progress > 0', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('assignment-progress-1')).toBeInTheDocument();
  });

  it('does not show progress bar when progress is 0', () => {
    const assignmentWithNoProgress = { ...mockAssignment, progress: 0 };
    
    render(
      <AssignmentCard
        assignment={assignmentWithNoProgress}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByTestId('assignment-progress-1')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByTestId('button-edit-assignment-1'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockAssignment);
  });

  it('calls onToggleComplete when complete button is clicked', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByTestId('button-complete-assignment-1'));
    expect(mockOnToggleComplete).toHaveBeenCalledWith(mockAssignment);
  });

  it('shows delete button when onDelete is provided', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('button-delete-assignment-1')).toBeInTheDocument();
  });

  it('does not show delete button when onDelete is not provided', () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
      />
    );

    expect(screen.queryByTestId('button-delete-assignment-1')).not.toBeInTheDocument();
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByTestId('button-delete-assignment-1'));
    
    await waitFor(() => {
      expect(screen.getByText('Delete Assignment')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete "Test Assignment"? This action cannot be undone.')).toBeInTheDocument();
    });
  });

  it('calls onDelete when delete is confirmed', async () => {
    render(
      <AssignmentCard
        assignment={mockAssignment}
        onEdit={mockOnEdit}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByTestId('button-delete-assignment-1'));
    
    await waitFor(() => {
      expect(screen.getByText('Delete Assignment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockOnDelete).toHaveBeenCalledWith(mockAssignment);
  });
});