import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock Material Icons
global.HTMLElement.prototype.scrollIntoView = vi.fn();

// Setup MSW server for API mocking
const mockAssignments = [
  {
    id: '1',
    title: 'Math Homework',
    description: 'Chapter 5 exercises',
    subject: 'AP Calc BC',
    dueDate: '2024-12-20T23:59:00.000Z',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    userId: 'user1',
    teacher: 'Mr. Euler',
    type: 'homework',
    pointsEarned: null,
    pointsPossible: 100,
    createdAt: '2024-12-18T10:00:00.000Z',
    updatedAt: '2024-12-18T10:00:00.000Z',
    googleCalendarEventId: null
  },
  {
    id: '2',
    title: 'History Essay',
    description: 'World War II analysis',
    subject: 'US History',
    dueDate: '2024-12-22T23:59:00.000Z',
    priority: 'high',
    status: 'in-progress',
    progress: 50,
    userId: 'user1',
    teacher: 'Mr. Lincoln',
    type: 'essay',
    pointsEarned: 85,
    pointsPossible: 100,
    createdAt: '2024-12-18T10:00:00.000Z',
    updatedAt: '2024-12-18T10:00:00.000Z',
    googleCalendarEventId: null
  }
];

const mockSubjects = [
  { id: '1', name: 'AP Calc BC', color: '#FF9800', teacher: 'Mr. Euler', createdAt: '2024-12-18T10:00:00.000Z' },
  { id: '2', name: 'US History', color: '#607D8B', teacher: 'Mr. Lincoln', createdAt: '2024-12-18T10:00:00.000Z' }
];

const mockUsers = [
  { id: 'user1', name: 'Zoo', email: 'zoo@example.com', avatar: null },
  { id: 'user2', name: 'Nish', email: 'nish@example.com', avatar: null }
];

export const server = setupServer(
  // Assignments endpoints
  http.get('/api/assignments', () => {
    return HttpResponse.json(mockAssignments);
  }),
  
  http.post('/api/assignments', async ({ request }) => {
    const newAssignment = await request.json() as any;
    const assignment = {
      id: Date.now().toString(),
      ...newAssignment,
      userId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleCalendarEventId: null
    };
    mockAssignments.push(assignment);
    return HttpResponse.json(assignment, { status: 201 });
  }),
  
  http.put('/api/assignments/:id', async ({ params, request }) => {
    const updatedData = await request.json() as any;
    const index = mockAssignments.findIndex(a => a.id === params.id);
    if (index !== -1) {
      mockAssignments[index] = { ...mockAssignments[index], ...updatedData, updatedAt: new Date().toISOString() };
      return HttpResponse.json(mockAssignments[index]);
    }
    return HttpResponse.json({ message: 'Assignment not found' }, { status: 404 });
  }),
  
  http.delete('/api/assignments/:id', ({ params }) => {
    const index = mockAssignments.findIndex(a => a.id === params.id);
    if (index !== -1) {
      mockAssignments.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ message: 'Assignment not found' }, { status: 404 });
  }),
  
  http.delete('/api/assignments', () => {
    mockAssignments.length = 0;
    return HttpResponse.json({ message: 'All assignments deleted successfully' });
  }),
  
  // Subjects endpoints
  http.get('/api/subjects', () => {
    return HttpResponse.json(mockSubjects);
  }),
  
  http.put('/api/subjects/:id', async ({ params, request }) => {
    const updatedData = await request.json() as any;
    const index = mockSubjects.findIndex(s => s.id === params.id);
    if (index !== -1) {
      mockSubjects[index] = { ...mockSubjects[index], ...updatedData };
      return HttpResponse.json(mockSubjects[index]);
    }
    return HttpResponse.json({ message: 'Subject not found' }, { status: 404 });
  }),
  
  // Users endpoints
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),
  
  http.get('/api/users/current', () => {
    return HttpResponse.json(mockUsers[0]);
  }),
  
  http.post('/api/users/switch', async ({ request }) => {
    const { userId } = await request.json() as { userId: string };
    const user = mockUsers.find(u => u.id === userId);
    return user ? HttpResponse.json(user) : HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),
  
  // Stats endpoint
  http.get('/api/stats', () => {
    return HttpResponse.json({
      dueToday: 1,
      thisWeek: 2,
      completed: 1,
      total: 2
    });
  }),
  
  // Data management endpoints
  http.delete('/api/data/clear', () => {
    mockAssignments.length = 0;
    return HttpResponse.json({ message: 'All data cleared successfully' });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());