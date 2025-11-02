import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { calendarIntegration } from '@/lib/calendar-integration';

// Helper function to detect virtual meeting platforms
const isVirtualMeeting = (location: string): boolean => {
  const virtualPlatforms = [
    'google meet', 'zoom', 'microsoft teams', 'teams', 'skype', 'webex', 
    'discord', 'slack', 'facetime', 'jitsi', 'bluejeans', 'gotomeeting',
    'meet.google.com', 'zoom.us', 'teams.microsoft.com'
  ];
  
  return virtualPlatforms.some(platform => 
    location.toLowerCase().includes(platform)
  );
};

interface CalendarPageProps {
  sidebarCollapsed?: boolean;
}

// Mock events data
const MOCK_EVENTS: any[] = [
  {
    id: 'event-current-1',
    title: 'Team Standup',
    description: 'Daily development team sync meeting',
    type: 'virtual' as const,
    startDate: new Date('2025-09-26T09:00:00Z'),
    endDate: new Date('2025-09-26T09:30:00Z'),
    location: 'Zoom',
    meetingUrl: 'https://zoom.us/j/standup',
    createdBy: 'user-1',
    creator: { displayName: 'Alex Rodriguez', avatar: '👨‍💻' },
    rsvpCount: 5,
    maxAttendees: 10,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-24T08:00:00Z'),
  },
  {
    id: 'event-current-2',
    title: 'Art Review Session',
    description: 'Review and feedback session for latest character designs',
    type: 'in-person' as const,
    startDate: new Date('2025-09-27T14:00:00Z'),
    endDate: new Date('2025-09-27T16:00:00Z'),
    location: 'Design Studio',
    createdBy: 'user-2',
    creator: { displayName: 'Sarah Chen', avatar: '🎨' },
    rsvpCount: 4,
    maxAttendees: 6,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-24T10:00:00Z'),
  },
  {
    id: 'event-current-3',
    title: 'Code Review',
    description: 'Weekly code review and architecture discussion',
    type: 'virtual' as const,
    startDate: new Date('2025-09-28T15:00:00Z'),
    endDate: new Date('2025-09-28T16:00:00Z'),
    location: 'Google Meet',
    meetingUrl: 'https://meet.google.com/code-review',
    createdBy: 'user-3',
    creator: { displayName: 'Mike Johnson', avatar: '🎮' },
    rsvpCount: 6,
    maxAttendees: 8,
    userRsvp: 'maybe' as const,
    createdAt: new Date('2025-09-25T12:00:00Z'),
  },
  {
    id: 'event-current-4',
    title: 'Sprint Planning',
    description: 'Planning session for next development sprint',
    type: 'in-person' as const,
    startDate: new Date('2025-09-30T10:00:00Z'),
    endDate: new Date('2025-09-30T12:00:00Z'),
    location: 'Conference Room A',
    createdBy: 'user-1',
    creator: { displayName: 'Alex Rodriguez', avatar: '👨‍💻' },
    rsvpCount: 8,
    maxAttendees: 12,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-23T09:00:00Z'),
  },
  {
    id: 'event-1',
    title: 'Alpha Build Release',
    description: 'First playable alpha version release for internal testing and feedback',
    type: 'release' as const,
    startDate: new Date('2025-10-15T10:00:00Z'),
    endDate: new Date('2025-10-15T12:00:00Z'),
    location: 'Internal Steam Beta',
    createdBy: 'user-4',
    creator: { displayName: 'David Kim', avatar: '🚀' },
    rsvpCount: 12,
    maxAttendees: 20,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-20T10:15:00Z'),
  },
  {
    id: 'event-2',
    title: 'Weekly Development Sprint Review',
    description: 'Sprint retrospective and planning for next development cycle',
    type: 'virtual' as const,
    startDate: new Date('2025-10-07T15:00:00Z'),
    endDate: new Date('2025-10-07T16:30:00Z'),
    location: 'Google Meet',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    createdBy: 'user-1',
    creator: { displayName: 'Alex Rodriguez', avatar: '👨‍💻' },
    rsvpCount: 8,
    maxAttendees: 10,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-24T09:00:00Z'),
  },
  {
    id: 'event-3',
    title: 'Character Design Workshop',
    description: 'Collaborative session for finalizing character animations and visual effects',
    type: 'in-person' as const,
    startDate: new Date('2025-10-10T14:00:00Z'),
    endDate: new Date('2025-10-10T17:00:00Z'),
    location: 'Studio Conference Room',
    createdBy: 'user-2',
    creator: { displayName: 'Sarah Chen', avatar: '🎨' },
    rsvpCount: 6,
    maxAttendees: 8,
    userRsvp: 'maybe' as const,
    createdAt: new Date('2025-09-22T11:30:00Z'),
  },
  {
    id: 'event-4',
    title: 'Game Development Conference 2026 Submission',
    description: 'Deadline for submitting our game showcase proposal to GDC 2026',
    type: 'release' as const,
    startDate: new Date('2025-11-01T23:59:00Z'),
    location: 'GDC Portal',
    createdBy: 'user-4',
    creator: { displayName: 'David Kim', avatar: '🚀' },
    rsvpCount: 0,
    userRsvp: null,
    createdAt: new Date('2025-09-15T08:00:00Z'),
  },
  {
    id: 'event-5',
    title: 'Beta Testing Kickoff',
    description: 'Launch beta testing program with external player communities',
    type: 'virtual' as const,
    startDate: new Date('2025-11-20T18:00:00Z'),
    endDate: new Date('2025-11-20T20:00:00Z'),
    location: 'Discord Community Server',
    meetingUrl: 'https://discord.gg/gameforge-beta',
    createdBy: 'user-3',
    creator: { displayName: 'Mike Johnson', avatar: '🎮' },
    rsvpCount: 25,
    maxAttendees: 100,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-23T14:20:00Z'),
  },
  {
    id: 'event-6',
    title: 'Holiday Game Jam',
    description: 'Internal 48-hour game jam for creative experimentation and team building',
    type: 'in-person' as const,
    startDate: new Date('2025-12-14T09:00:00Z'),
    endDate: new Date('2025-12-16T18:00:00Z'),
    location: 'Development Studio',
    createdBy: 'user-1',
    creator: { displayName: 'Alex Rodriguez', avatar: '👨‍💻' },
    rsvpCount: 14,
    maxAttendees: 20,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-24T16:45:00Z'),
  },
  {
    id: 'event-7',
    title: 'Q1 2026 Roadmap Planning',
    description: 'Strategic planning session for next quarter development goals and milestones',
    type: 'in-person' as const,
    startDate: new Date('2025-12-18T10:00:00Z'),
    endDate: new Date('2025-12-18T15:00:00Z'),
    location: 'Executive Meeting Room',
    createdBy: 'user-5',
    creator: { displayName: 'Emma Wilson', avatar: '📊' },
    rsvpCount: 7,
    maxAttendees: 10,
    userRsvp: 'maybe' as const,
    createdAt: new Date('2025-09-24T12:30:00Z'),
  },
  {
    id: 'event-8',
    title: 'Steam Winter Sale Preparation',
    description: 'Final preparations for Steam Winter Sale marketing and promotional materials',
    type: 'virtual' as const,
    startDate: new Date('2026-01-08T14:00:00Z'),
    endDate: new Date('2026-01-08T16:00:00Z'),
    location: 'Marketing Team Call',
    meetingUrl: 'https://zoom.us/j/123456789',
    createdBy: 'user-6',
    creator: { displayName: 'Lisa Park', avatar: '📢' },
    rsvpCount: 9,
    maxAttendees: 15,
    userRsvp: 'attending' as const,
    createdAt: new Date('2025-09-24T13:15:00Z'),
  }
];

const MOCK_USER = {
  id: 'current-user',
  displayName: 'Alex Rodriguez',
  avatar: '👨‍💻',
  role: 'Lead Developer'
};

export default function CalendarPage({ sidebarCollapsed = false }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [filter, setFilter] = useState<'all' | 'attending' | 'created'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popupEvent, setPopupEvent] = useState<any | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Initialize calendar integration
  useEffect(() => {
    console.log('Calendar page - initializing integration');
    // Get current events from calendar integration, or initialize with MOCK_EVENTS if empty
    const currentEvents = calendarIntegration.getEvents();
    if (currentEvents.length === 0) {
      console.log('Calendar page - no existing events, initializing with mock data');
      calendarIntegration.initializeEvents(MOCK_EVENTS);
      setEvents(MOCK_EVENTS);
    } else {
      console.log('Calendar page - using existing events from integration', currentEvents.length);
      setEvents(currentEvents);
    }
    
    // Subscribe to event updates from Community page
    const unsubscribe = calendarIntegration.onEventsUpdate((updatedEvents) => {
      console.log('Calendar page - received event update', updatedEvents.length);
      setEvents(updatedEvents);
    });

    return () => {
      console.log('Calendar page - cleaning up subscription');
      unsubscribe();
    };
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'release': return 'bg-purple-500 text-white';
      case 'virtual': return 'bg-blue-500 text-white';
      case 'in-person': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'release': return '🚀';
      case 'virtual': return <Paperclip className="w-3 h-3" />;
      case 'in-person': return <MapPin className="w-3 h-3" />;
      default: return '📅';
    }
  };

  const getRsvpStatusColor = (status: string | null) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'not-attending': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRsvpStatusIcon = (status: string | null) => {
    switch (status) {
      case 'attending': return <Check className="w-3 h-3" />;
      case 'maybe': return <AlertCircle className="w-3 h-3" />;
      case 'not-attending': return <X className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'attending') return event.userRsvp === 'attending';
    if (filter === 'created') return event.createdBy === MOCK_USER.id;
    return true;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.startDate, date));
  };

  const handleEventClick = (event: any, clickEvent: React.MouseEvent) => {
    const rect = clickEvent.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 320; // w-80 = 320px
    const popupHeight = 400; // maxHeight = 400px
    
    // Smart positioning: if there's not enough space to the right, position to the left
    const shouldPositionLeft = (rect.right + popupWidth + 10) > viewportWidth;
    
    // Calculate initial position
    let x = shouldPositionLeft ? rect.left - popupWidth - 10 : rect.left + rect.width + 10;
    let y = rect.top;
    
    // Clamp x to ensure popup stays within viewport horizontally
    x = Math.max(10, Math.min(x, viewportWidth - popupWidth - 10));
    
    // Clamp y to ensure popup stays within viewport vertically
    y = Math.max(10, Math.min(y, viewportHeight - popupHeight - 10));
    
    setPopupPosition({ x, y });
    setPopupEvent(event);
  };

  const handleRsvpChange = (eventId: string, newStatus: 'attending' | 'maybe' | 'not-attending') => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const rsvpCountChange = (() => {
          if (event.userRsvp === 'attending' && newStatus !== 'attending') return -1;
          if (event.userRsvp !== 'attending' && newStatus === 'attending') return 1;
          return 0;
        })();

        return {
          ...event,
          userRsvp: newStatus,
          rsvpCount: Math.max(0, event.rsvpCount + rsvpCountChange)
        };
      }
      return event;
    }));
  };

  const upcomingEvents = filteredEvents
    .filter(event => event.startDate > new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-calendar-title">
                Calendar
              </h1>
              <p className="text-muted-foreground" data-testid="text-calendar-subtitle">
                Keep track of GameForge events, releases, and team meetings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-36" data-testid="select-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="attending">Attending</SelectItem>
                  <SelectItem value="created">Created by Me</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={view === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                  data-testid="button-view-month"
                >
                  Month
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  data-testid="button-view-list"
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {view === 'month' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" data-testid="text-current-month">
                      {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
                        data-testid="button-prev-month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                        data-testid="button-today"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
                        data-testid="button-next-month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                      <div key={`empty-${index}`} className="p-2" />
                    ))}

                    {daysInMonth.map(date => {
                      const dayEvents = getEventsForDate(date);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const isCurrentDay = isToday(date);

                      return (
                        <div
                          key={date.toISOString()}
                          className={`
                            p-2 min-h-24 border rounded-lg cursor-pointer transition-colors
                            ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'border-border hover:bg-muted/50'}
                            ${isSelected ? 'ring-2 ring-blue-500' : ''}
                          `}
                          onClick={() => setSelectedDate(date)}
                          data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {format(date, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className={`text-sm px-3 py-2 rounded ${getEventTypeColor(event.type)} truncate cursor-pointer hover:opacity-80`}
                                title={event.title}
                                data-testid={`calendar-event-${event.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event, e);
                                }}
                              >
                                {getEventTypeIcon(event.type)} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground px-2">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selected Date Events */}
                {selectedDate && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3" data-testid="text-selected-date">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No events scheduled</p>
                      ) : (
                        getEventsForDate(selectedDate).map(event => (
                          <div 
                            key={event.id} 
                            className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={(e) => handleEventClick(event, e)}
                            data-testid={`selected-event-${event.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className={`w-5 h-5 ${getEventTypeColor(event.type)} rounded-full flex items-center justify-center text-sm`}>
                                    {getEventTypeIcon(event.type)}
                                  </div>
                                  <h4 className="font-medium text-base">{event.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{format(event.startDate, 'h:mm a')}</p>
                                {event.location && (
                                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                              {event.userRsvp && (
                                <Badge className={`text-xs ${getRsvpStatusColor(event.userRsvp)}`}>
                                  {getRsvpStatusIcon(event.userRsvp)}
                                  <span className="ml-1">{event.userRsvp}</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                )}

                {/* Upcoming Events */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    ) : (
                      upcomingEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50" 
                          data-testid={`upcoming-event-${event.id}`}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-5 h-5 ${getEventTypeColor(event.type)} rounded-full flex items-center justify-center text-sm`}>
                                {getEventTypeIcon(event.type)}
                              </div>
                              <h4 className="font-medium text-base">{event.title}</h4>
                            </div>
                            {event.userRsvp && (
                              <Badge className={`text-xs ${getRsvpStatusColor(event.userRsvp)}`}>
                                {getRsvpStatusIcon(event.userRsvp)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(event.startDate, 'MMM d, h:mm a')}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                {isVirtualMeeting(event.location) ? (
                                  <Paperclip className="w-4 h-4" />
                                ) : (
                                  <MapPin className="w-4 h-4" />
                                )}
                                <span>{event.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.rsvpCount} attending</span>
                            </div>
                          </div>

                          {event.type !== 'release' && (
                            <div className="flex items-center space-x-2 mt-3">
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={event.userRsvp || 'none'}
                                  onValueChange={(value) => {
                                    if (value !== 'none') {
                                      handleRsvpChange(event.id, value as any);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs" data-testid={`select-rsvp-${event.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="attending">Attending</SelectItem>
                                    <SelectItem value="maybe">Maybe</SelectItem>
                                    <SelectItem value="not-attending">Not Attending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {filteredEvents.length === 0 ? (
                  <Card className="p-8 text-center" data-testid="card-no-events">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground text-sm">Check the Community tab to see if there are new events posted!</p>
                  </Card>
                ) : (
                  filteredEvents
                    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                    .map(event => (
                      <Card 
                        key={event.id} 
                        className="p-6 cursor-pointer hover:bg-muted/20" 
                        data-testid={`event-card-${event.id}`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`w-8 h-8 ${getEventTypeColor(event.type)} rounded-full flex items-center justify-center text-sm`}>
                                {getEventTypeIcon(event.type)}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold" data-testid={`event-title-${event.id}`}>
                                  {event.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Created by {event.creator.displayName}
                                </p>
                              </div>
                            </div>

                            <p className="mb-4 leading-relaxed text-muted-foreground">
                              {event.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{format(event.startDate, 'EEEE, MMMM d')}</div>
                                  <div className="text-muted-foreground">
                                    {format(event.startDate, 'h:mm a')}
                                    {event.endDate && ` - ${format(event.endDate, 'h:mm a')}`}
                                  </div>
                                </div>
                              </div>

                              {event.location && (
                                <div className="flex items-center space-x-2 text-sm">
                                  {isVirtualMeeting(event.location) ? (
                                    <Paperclip className="w-4 h-4" />
                                  ) : (
                                    <MapPin className="w-4 h-4" />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {event.type === 'virtual' || isVirtualMeeting(event.location) ? 'Virtual' : 'Location'}
                                    </div>
                                    <div className="text-muted-foreground">{event.location}</div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 text-sm">
                                <Users className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Attendance</div>
                                  <div className="text-muted-foreground">
                                    {event.rsvpCount} attending
                                    {event.maxAttendees && ` of ${event.maxAttendees}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-3">
                            {event.userRsvp && (
                              <Badge className={getRsvpStatusColor(event.userRsvp)}>
                                {getRsvpStatusIcon(event.userRsvp)}
                                <span className="ml-2">{event.userRsvp}</span>
                              </Badge>
                            )}

                            {event.type !== 'release' && (
                              <div className="flex items-center space-x-2">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={event.userRsvp || 'none'}
                                    onValueChange={(value) => {
                                      if (value !== 'none') {
                                        handleRsvpChange(event.id, value as any);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-32" data-testid={`select-rsvp-list-${event.id}`}>
                                      <SelectValue placeholder="RSVP" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="attending">Attending</SelectItem>
                                      <SelectItem value="maybe">Maybe</SelectItem>
                                      <SelectItem value="not-attending">Not Attending</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                              </div>
                            )}

                            {event.location && event.type === 'virtual' && event.meetingUrl && (
                              <Button 
                                size="sm" 
                                data-testid={`button-join-event-${event.id}`}
                                onClick={() => window.open(event.meetingUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join Event
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Popup */}
      {popupEvent && (
        <>
          {/* Backdrop to close popup */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setPopupEvent(null)}
          />
          {/* Popup Card */}
          <Card 
            className="fixed z-50 w-80 p-4 shadow-2xl border-2"
            style={{ 
              left: popupPosition.x, 
              top: popupPosition.y,
              maxHeight: '400px',
              overflowY: 'auto'
            }}
            data-testid={`event-popup-${popupEvent.id}`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 ${getEventTypeColor(popupEvent.type)} rounded-full flex items-center justify-center text-sm`}>
                    {getEventTypeIcon(popupEvent.type)}
                  </div>
                  <h3 className="text-lg font-semibold">{popupEvent.title}</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPopupEvent(null)}
                  data-testid="button-close-popup"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">{popupEvent.description}</p>

              {/* Event Details */}
              <div className="space-y-2">
                {/* Date & Time */}
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <div>
                    <div className="font-medium">
                      {format(popupEvent.startDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-muted-foreground">
                      {format(popupEvent.startDate, 'h:mm a')}
                      {popupEvent.endDate && ` - ${format(popupEvent.endDate, 'h:mm a')}`}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {popupEvent.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    {isVirtualMeeting(popupEvent.location) ? (
                      <Paperclip className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <div>
                      <div className="font-medium">
                        {popupEvent.type === 'virtual' || isVirtualMeeting(popupEvent.location) ? 'Virtual' : 'Location'}
                      </div>
                      <div className="text-muted-foreground">{popupEvent.location}</div>
                    </div>
                  </div>
                )}

                {/* Attendees */}
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Attendees</div>
                    <div className="text-muted-foreground">
                      {popupEvent.rsvpCount} attending
                      {popupEvent.maxAttendees && ` of ${popupEvent.maxAttendees}`}
                    </div>
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {popupEvent.creator?.avatar || '👤'}
                  </div>
                  <div>
                    <div className="font-medium">Created by</div>
                    <div className="text-muted-foreground">{popupEvent.creator?.displayName}</div>
                  </div>
                </div>
              </div>

              {/* RSVP Status */}
              {popupEvent.userRsvp && (
                <div className="pt-2 border-t">
                  <Badge className={getRsvpStatusColor(popupEvent.userRsvp)}>
                    {getRsvpStatusIcon(popupEvent.userRsvp)}
                    <span className="ml-2">{popupEvent.userRsvp}</span>
                  </Badge>
                </div>
              )}

              {/* Join Button for Virtual Events */}
              {popupEvent.type === 'virtual' && popupEvent.meetingUrl && (
                <Button 
                  className="w-full" 
                  onClick={() => window.open(popupEvent.meetingUrl, '_blank')}
                  data-testid={`button-join-popup-${popupEvent.id}`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Event
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}