import { google } from 'googleapis';
import type { Assignment } from '@shared/schema';

export class GoogleCalendarService {
  private calendar;
  private auth;

  constructor() {
    // Support multiple domains - use the first one as default, but the OAuth will work with any registered domain
    const domains = process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'];
    const primaryDomain = domains[0];
    
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `https://${primaryDomain}/auth/google/calendar/callback`
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  // Set user credentials from OAuth flow
  setCredentials(tokens: any) {
    this.auth.setCredentials(tokens);
  }

  // Get authorization URL for OAuth flow
  getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.auth.getToken(code);
    return tokens;
  }

  // Create a calendar event for an assignment
  async createAssignmentEvent(assignment: Assignment, userTokens: any): Promise<string | null> {
    try {
      this.setCredentials(userTokens);

      const event = {
        summary: `${assignment.subject}: ${assignment.title}`,
        description: assignment.description || `Assignment for ${assignment.subject}`,
        start: {
          dateTime: assignment.dueDate.toISOString(),
          timeZone: 'America/New_York', // You can make this configurable
        },
        end: {
          dateTime: new Date(assignment.dueDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          timeZone: 'America/New_York',
        },
        colorId: this.getColorForSubject(assignment.subject),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  // Update an existing calendar event
  async updateAssignmentEvent(
    eventId: string,
    assignment: Assignment,
    userTokens: any
  ): Promise<boolean> {
    try {
      this.setCredentials(userTokens);

      const event = {
        summary: `${assignment.subject}: ${assignment.title}`,
        description: assignment.description || `Assignment for ${assignment.subject}`,
        start: {
          dateTime: assignment.dueDate.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: new Date(assignment.dueDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/New_York',
        },
        colorId: this.getColorForSubject(assignment.subject),
      };

      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });

      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return false;
    }
  }

  // Delete a calendar event
  async deleteAssignmentEvent(eventId: string, userTokens: any): Promise<boolean> {
    try {
      this.setCredentials(userTokens);

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  // Get color ID for subject (you can customize this mapping)
  private getColorForSubject(subject: string): string {
    const colorMap: { [key: string]: string } = {
      'Math': '5', // Yellow
      'Science': '7', // Turquoise
      'English': '4', // Flamingo
      'History': '6', // Orange
      'Art': '2', // Sage
      'PE': '11', // Red
      'French': '9', // Blue
      'Biology': '10', // Green
      'Physics': '3', // Purple
      'Chemistry': '8', // Gray
    };
    
    return colorMap[subject] || '1'; // Default color
  }

  // Get user's calendar list (optional feature)
  async getUserCalendars(userTokens: any) {
    try {
      this.setCredentials(userTokens);
      
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error getting user calendars:', error);
      return [];
    }
  }
}

export const calendarService = new GoogleCalendarService();