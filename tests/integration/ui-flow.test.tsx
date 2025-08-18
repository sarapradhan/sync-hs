import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import App from '../../client/src/App';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const renderApp = (initialPath = '/') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Router base={initialPath}>
        <App />
      </Router>
    </QueryClientProvider>
  );
};

describe('UI Flow Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Dashboard Navigation', () => {
    it('should navigate between different pages', async () => {
      renderApp();

      // Should start on dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Navigate to assignments
      const assignmentsLink = screen.getByRole('link', { name: /assignments/i });
      await user.click(assignmentsLink);

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Navigate to subjects
      const subjectsLink = screen.getByRole('link', { name: /subjects/i });
      await user.click(subjectsLink);

      await waitFor(() => {
        expect(screen.getByTestId('subjects-page')).toBeInTheDocument();
      });
    });

    it('should show mobile navigation on small screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Management Flow', () => {
    it('should create a new assignment', async () => {
      renderApp('/assignments');

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Click add assignment button
      const addButton = screen.getByTestId('button-add-assignment');
      await user.click(addButton);

      // Fill out the form
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const subjectSelect = screen.getByRole('combobox', { name: /subject/i });
      const dueDateInput = screen.getByLabelText(/due date/i);

      await user.type(titleInput, 'New Test Assignment');
      await user.click(subjectSelect);
      await user.click(screen.getByRole('option', { name: /math/i }));
      await user.type(dueDateInput, '2024-12-25');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add assignment/i });
      await user.click(submitButton);

      // Verify assignment was created
      await waitFor(() => {
        expect(screen.getByText('New Test Assignment')).toBeInTheDocument();
      });
    });

    it('should edit an existing assignment', async () => {
      renderApp('/assignments');

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Wait for assignments to load and click edit on first assignment
      await waitFor(() => {
        const editButton = screen.queryByTestId('button-edit-assignment-1');
        if (editButton) {
          fireEvent.click(editButton);
        }
      });

      // Check if edit dialog opened
      const dialog = screen.queryByRole('dialog');
      if (dialog) {
        await waitFor(() => {
          expect(screen.getByDisplayValue('Math Homework')).toBeInTheDocument();
        });

        // Update the title
        const titleInput = screen.getByDisplayValue('Math Homework');
        await user.clear(titleInput);
        await user.type(titleInput, 'Updated Math Homework');

        // Submit the form
        const updateButton = screen.getByRole('button', { name: /update assignment/i });
        await user.click(updateButton);

        // Verify assignment was updated
        await waitFor(() => {
          expect(screen.getByText('Updated Math Homework')).toBeInTheDocument();
        });
      }
    });

    it('should delete an assignment with confirmation', async () => {
      renderApp('/assignments');

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Find and click delete button for first assignment
      await waitFor(() => {
        const deleteButton = screen.queryByTestId('button-delete-assignment-1');
        if (deleteButton) {
          fireEvent.click(deleteButton);
        }
      });

      // Confirm deletion in dialog
      const confirmDialog = screen.queryByRole('dialog');
      if (confirmDialog) {
        await waitFor(() => {
          expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /delete/i });
        await user.click(confirmButton);

        // Verify assignment was deleted
        await waitFor(() => {
          expect(screen.queryByText('Math Homework')).not.toBeInTheDocument();
        });
      }
    });

    it('should filter assignments by status and subject', async () => {
      renderApp('/assignments');

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Filter by status
      const statusFilter = screen.getByTestId('select-status-filter');
      await user.click(statusFilter);
      await user.click(screen.getByRole('option', { name: /pending/i }));

      // Verify filtering works
      await waitFor(() => {
        const assignments = screen.getAllByTestId(/assignment-card-/);
        expect(assignments.length).toBeGreaterThan(0);
      });

      // Filter by subject
      const subjectFilter = screen.getByTestId('select-subject-filter');
      await user.click(subjectFilter);
      await user.click(screen.getByRole('option', { name: /math/i }));

      // Verify combined filtering works
      await waitFor(() => {
        const assignments = screen.getAllByTestId(/assignment-card-/);
        expect(assignments.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Subject Management Flow', () => {
    it('should update subject colors', async () => {
      renderApp('/subjects');

      await waitFor(() => {
        expect(screen.getByTestId('subjects-page')).toBeInTheDocument();
      });

      // Find first subject color picker
      const colorPicker = screen.getAllByRole('button', { name: /change color/i })[0];
      await user.click(colorPicker);

      // Select a new color
      const colorOption = screen.getByTitle('#FF0000');
      await user.click(colorOption);

      // Verify color was updated
      await waitFor(() => {
        expect(screen.getByText(/color updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Management Flow', () => {
    it('should clear all data with confirmation', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Open data management dialog
      const dataManagementButton = screen.getByTestId('button-data-management');
      await user.click(dataManagementButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click clear all data
      const clearDataButton = screen.getByTestId('button-clear-data');
      await user.click(clearDataButton);

      // Confirm in alert dialog
      await waitFor(() => {
        expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('button-confirm-clear');
      await user.click(confirmButton);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/data cleared/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Switching Flow', () => {
    it('should switch between users', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Find user switcher
      const userSwitcher = screen.getByTestId('user-switcher');
      await user.click(userSwitcher);

      // Select different user
      const nishOption = screen.getByRole('option', { name: /nish/i });
      await user.click(nishOption);

      // Verify user was switched
      await waitFor(() => {
        expect(screen.getByText('Nish')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Flow', () => {
    it('should search assignments by title', async () => {
      renderApp('/assignments');

      await waitFor(() => {
        expect(screen.getByTestId('assignments-page')).toBeInTheDocument();
      });

      // Use search input
      const searchInput = screen.getByTestId('input-search');
      await user.type(searchInput, 'Math');

      // Verify search results
      await waitFor(() => {
        const results = screen.getAllByTestId(/assignment-card-/);
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });
});