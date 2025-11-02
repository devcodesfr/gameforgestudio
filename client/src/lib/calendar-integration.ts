// Calendar Integration Utility
// Provides shared functionality for managing calendar events across components

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'in-person' | 'release';
  startDate: Date;
  endDate?: Date;
  location: string;
  createdBy: string;
  creator: {
    displayName: string;
    avatar?: string;
  };
  rsvpCount: number;
  maxAttendees?: number;
  userRsvp: 'attending' | 'maybe' | 'not-attending' | null;
  createdAt: Date;
}

// Global event store for demonstration purposes
// In a real app, this would be managed by a proper state management solution
let globalCalendarEvents: CalendarEvent[] = [];
let eventUpdateCallbacks: ((events: CalendarEvent[]) => void)[] = [];

export const calendarIntegration = {
  // Initialize with existing events
  initializeEvents: (events: CalendarEvent[]) => {
    console.log('Calendar integration - initializing with events', events.length);
    globalCalendarEvents = [...events];
  },
  
  // Add new event to calendar
  addEvent: (event: CalendarEvent) => {
    console.log('Calendar integration - adding event', event.title, 'Total callbacks:', eventUpdateCallbacks.length);
    globalCalendarEvents = [event, ...globalCalendarEvents];
    console.log('Calendar integration - total events after add:', globalCalendarEvents.length);
    eventUpdateCallbacks.forEach((callback, index) => {
      console.log(`Calendar integration - calling callback ${index}`);
      callback([...globalCalendarEvents]);
    });
  },
  
  // Get all events
  getEvents: () => {
    console.log('Calendar integration - getting all events', globalCalendarEvents.length);
    return [...globalCalendarEvents];
  },
  
  // Subscribe to event updates
  onEventsUpdate: (callback: (events: CalendarEvent[]) => void) => {
    console.log('Calendar integration - new subscription added, total callbacks:', eventUpdateCallbacks.length + 1);
    eventUpdateCallbacks.push(callback);
    return () => {
      eventUpdateCallbacks = eventUpdateCallbacks.filter(cb => cb !== callback);
      console.log('Calendar integration - subscription removed, total callbacks:', eventUpdateCallbacks.length);
    };
  },
  
  // Remove subscription (cleanup)
  clearSubscriptions: () => {
    console.log('Calendar integration - clearing all subscriptions');
    eventUpdateCallbacks = [];
  }
};

export type { CalendarEvent };