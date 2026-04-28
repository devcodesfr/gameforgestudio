import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  MapPin,
  Users,
  Clock,
  Send,
  Plus,
  Filter,
  Sparkles
} from 'lucide-react';
import { calendarIntegration } from '@/lib/calendar-integration';
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/** Legacy key: we no longer mirror the full feed here (quota + server persistence). One-time clear on mount. */
const LEGACY_COMMUNITY_POSTS_STORAGE_KEY = 'gameforge-community-posts';

interface CommunityPageProps {
  sidebarCollapsed?: boolean;
}

type CommunityAuthor = {
  displayName: string;
  avatar?: string;
  role?: string;
};

type CommunityReply = {
  id: string;
  authorId: string;
  author: CommunityAuthor;
  content: string;
  likesCount: number;
  createdAt: Date;
  liked: boolean;
};

type CommunityEvent = {
  id: string;
  title: string;
  type: 'virtual' | 'in-person' | 'release';
  startDate: Date;
  endDate?: Date;
  location: string;
  rsvpCount: number;
  maxAttendees: number;
};

type CommunityPost = {
  id: string;
  authorId: string;
  author: CommunityAuthor;
  content: string;
  type: 'text' | 'event';
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  liked: boolean;
  replies: CommunityReply[];
  eventId?: string;
  event?: CommunityEvent;
};

// Mock data for community posts  
const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    authorId: 'user-1',
    author: { displayName: 'Alex Rodriguez', avatar: '👨‍💻', role: 'Lead Developer' },
    content: 'Just hit a major milestone! Our RPG project now has fully functional combat system. The team has been incredible! 🎮⚔️',
    type: 'text' as const,
    likesCount: 12,
    repliesCount: 4,
    createdAt: new Date('2024-01-21T14:30:00Z'),
    liked: false,
    replies: [
      {
        id: 'r1',
        authorId: 'user-2',
        author: { displayName: 'Sarah Chen', avatar: '🎨' },
        content: 'Congrats! The combat animations look amazing 🔥',
        likesCount: 3,
        createdAt: new Date('2024-01-21T15:15:00Z'),
        liked: false,
      },
      {
        id: 'r2',
        authorId: 'user-3', 
        author: { displayName: 'Mike Johnson', avatar: '🎵' },
        content: 'Can\'t wait to add the battle music! This is going to be epic',
        likesCount: 2,
        createdAt: new Date('2024-01-21T16:00:00Z'),
        liked: true,
      }
    ]
  },
  {
    id: '2',
    authorId: 'user-2',
    author: { displayName: 'Sarah Chen', avatar: '🎨', role: 'Art Director' },
    content: 'Working on concept art for the new fantasy world. Here\'s a sneak peek at the magical forest environment! Feedback welcome 🌲✨',
    type: 'text' as const,
    likesCount: 24,
    repliesCount: 8,
    createdAt: new Date('2024-01-21T12:00:00Z'),
    liked: true,
    replies: []
  },
  {
    id: '3',
    authorId: 'user-4',
    author: { displayName: 'David Kim', avatar: '🚀', role: 'Producer' },
    content: 'Mark your calendars! Game release party next Friday at 7 PM. Virtual event with demos, behind-the-scenes content, and Q&A!',
    type: 'event' as const,
    eventId: 'event-1',
    event: {
      id: 'event-1',
      title: 'Game Release Party',
      type: 'virtual',
      startDate: new Date('2024-01-26T19:00:00Z'),
      location: 'Discord Voice Channel',
      rsvpCount: 15,
      maxAttendees: 50,
    },
    likesCount: 18,
    repliesCount: 6,
    createdAt: new Date('2024-01-21T10:15:00Z'),
    liked: false,
    replies: []
  }
];

function normalizePost(post: CommunityPost): CommunityPost {
  const replies = post.replies?.map((reply: CommunityReply) => ({
    ...reply,
    createdAt: new Date(reply.createdAt),
  })) || [];

  return {
    ...post,
    replies,
    repliesCount: replies.length,
    createdAt: new Date(post.createdAt),
    event: post.event ? {
      ...post.event,
      startDate: new Date(post.event.startDate),
      endDate: post.event.endDate ? new Date(post.event.endDate) : undefined,
    } : undefined,
  };
}

function mergeCommunityPosts(primaryPosts: CommunityPost[], secondaryPosts: CommunityPost[]) {
  const primaryIds = new Set(primaryPosts.map((post) => post.id));
  /** Avoid replying to phantom `post-…` copies that no longer exist on the server response. */
  const filteredSecondary = secondaryPosts.filter((post) => {
    if (!post.id.startsWith('post-')) return true;
    return primaryIds.has(post.id);
  });

  const merged = new Map<string, CommunityPost>();
  [...filteredSecondary, ...primaryPosts].forEach((post) => {
    merged.set(post.id, normalizePost(post));
  });

  return Array.from(merged.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function shouldShowAuthorTag(role?: string) {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole !== 'regular' && normalizedRole !== 'gamer';
}

function getAuthorTag(role?: string) {
  return shouldShowAuthorTag(role) ? (
    <Badge variant="secondary" className="text-xs">{role}</Badge>
  ) : null;
}

function formatRelativeTime(date: Date | string) {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return 'just now';

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffInSeconds < 60) return 'just now';

  const units = [
    { label: 'yr', plural: 'yrs', seconds: 365 * 24 * 60 * 60 },
    { label: 'month', plural: 'months', seconds: 30 * 24 * 60 * 60 },
    { label: 'day', plural: 'days', seconds: 24 * 60 * 60 },
    { label: 'hr', plural: 'hrs', seconds: 60 * 60 },
    { label: 'min', plural: 'mins', seconds: 60 },
  ];

  const unit = units.find((item) => diffInSeconds >= item.seconds)!;
  const value = Math.floor(diffInSeconds / unit.seconds);
  return `${value} ${value === 1 ? unit.label : unit.plural} ago`;
}

function isImageAvatar(avatar?: string) {
  if (!avatar) return false;
  return avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:image');
}

function AuthorAvatar({ author, className = "w-10 h-10", fallbackClassName = "text-sm" }: { author: CommunityAuthor; className?: string; fallbackClassName?: string }) {
  const initials = author.displayName?.split(' ').map((name) => name[0]).join('').slice(0, 2) || '?';

  return (
    <Avatar className={className}>
      {isImageAvatar(author.avatar) && <AvatarImage src={author.avatar} />}
      <AvatarFallback className={fallbackClassName}>
        {author.avatar && !isImageAvatar(author.avatar) ? author.avatar : initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default function CommunityPage({ sidebarCollapsed = false }: CommunityPageProps) {
  // Get real authenticated user data
  const userQuery = useCurrentUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const currentUser = userQuery.data;

  /** In-memory + `/api/community/posts` only; do not persist full feed to localStorage (browser quota). */
  const [posts, setPosts] = useState<CommunityPost[]>(() => MOCK_POSTS.map(normalizePost));
  const { data: sharedPosts = [] } = useQuery<CommunityPost[]>({
    queryKey: ['/api/community/posts'],
    refetchInterval: 3000,
  });
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'text' | 'event'>('text');
  const [filter, setFilter] = useState<'all' | 'posts' | 'events'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    setReplyingTo(null);
  }, [selectedPost?.id]);

  // Event creation state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<'virtual' | 'in-person' | 'release'>('virtual');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_COMMUNITY_POSTS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const normalizedSharedPosts = sharedPosts.map(normalizePost);
    setPosts((currentPosts) => mergeCommunityPosts(normalizedSharedPosts, currentPosts));
  }, [sharedPosts]);

  useEffect(() => {
    if (!selectedPost) return;

    const updatedPost = posts.find((post) => post.id === selectedPost.id);
    if (!updatedPost) {
      setSelectedPost(null);
    } else if (updatedPost !== selectedPost) {
      setSelectedPost(updatedPost);
    }
  }, [posts, selectedPost]);

  const filteredPosts = posts.filter((post) => {
    if (filter === 'posts') return post.type === 'text';
    if (filter === 'events') return post.type === 'event';
    return true;
  });

  const applyLocalLike = (postId: string) => {
    setPosts((prev) => prev.map((post) => {
      if (post.id === postId) {
        const updatedPost = {
          ...post,
          liked: !post.liked,
          likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1
        };
        return {
          ...updatedPost
        };
      }
      return post;
    }));
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/like`);
      const updatedPost = normalizePost(await response.json());
      setPosts((prev) => mergeCommunityPosts([updatedPost], prev));
    } catch (error) {
      // Older local-only posts can still be liked privately until they are recreated through the shared API.
      applyLocalLike(postId);
    }
  };

  const handleLikeReply = async (postId: string, replyId: string) => {
    try {
      const response = await apiRequest("POST", `/api/community/posts/${postId}/replies/${replyId}/like`);
      const updatedPost = normalizePost(await response.json());
      setPosts((prev) => mergeCommunityPosts([updatedPost], prev));
      if (selectedPost?.id === postId) {
        setSelectedPost(updatedPost);
      }
    } catch {
      let updatedPost: CommunityPost | null = null;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          updatedPost = {
            ...post,
            replies: post.replies.map((reply) => {
              if (reply.id !== replyId) return reply;
              return {
                ...reply,
                liked: !reply.liked,
                likesCount: reply.liked ? reply.likesCount - 1 : reply.likesCount + 1,
              };
            }),
          };
          return updatedPost;
        }),
      );
      if (selectedPost?.id === postId && updatedPost) {
        setSelectedPost(updatedPost);
      }
    }
  };

  const applyLocalReply = (postId: string, newReply: CommunityReply) => {
    let updatedPost: CommunityPost | null = null;

    setPosts((prev) => prev.map((post) => {
      if (post.id !== postId) return post;
      const replies = [...post.replies, newReply];
      updatedPost = {
        ...post,
        replies,
        repliesCount: replies.length,
      };
      return updatedPost;
    }));

    if (selectedPost?.id === postId && updatedPost) {
      setSelectedPost(updatedPost);
    }
  };

  const handleReply = async (postId: string) => {
    if (!currentUser || !replyContent.trim()) return;

    const text = replyContent.trim();
    const pendingReply: CommunityReply = {
      id: `reply-${Date.now()}`,
      authorId: currentUser.id,
      author: {
        displayName: currentUser.displayName,
        avatar: currentUser.avatar || undefined,
        role: currentUser.jobTitle || currentUser.role,
      },
      content: text,
      likesCount: 0,
      createdAt: new Date(),
      liked: false,
    };

    try {
      const response = await apiRequest('POST', `/api/community/posts/${postId}/replies`, {
        content: text,
      });
      const updatedPost = normalizePost(await response.json());
      setPosts((prev) => mergeCommunityPosts([updatedPost], prev));
      if (selectedPost?.id === postId) {
        setSelectedPost(updatedPost);
      }

      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      applyLocalReply(postId, pendingReply);
      setReplyContent('');
      setReplyingTo(null);

      const raw = err instanceof Error ? err.message : String(err);
      const status = Number(raw.match(/^(\d+):/)?.[1] ?? NaN);

      if (!postId.startsWith('post-')) return;

      if (status === 401) {
        toast({
          title: 'Sign in required',
          description: 'Your session may have expired. Sign in again and try your reply.',
          variant: 'destructive',
        });
        return;
      }
      if (status === 404) {
        toast({
          title: 'Post not on shared feed',
          description: 'Refresh the page — or create a new post — so the server has this thread. Your reply was kept on this device only.',
        });
        return;
      }
      toast({
        title: 'Reply failed',
        description: raw.length < 220 ? raw : 'Could not sync your reply to the shared feed.',
        variant: 'destructive',
      });
    }
  };

    const handleRsvpEvent = (post: CommunityPost) => {
    if (!post.event) return;

    // Add event to calendar
      const eventEndDate = post.event.endDate ?? new Date(post.event.startDate.getTime() + 2 * 60 * 60 * 1000);

      const calendarEvent = {
        id: post.event.id || `event-${Date.now()}`,
        title: post.event.title,
        description: post.content,
        type: post.event.type,
        startDate: post.event.startDate,
        endDate: eventEndDate,
        location: post.event.location,
      createdBy: post.authorId,
      creator: post.author,
      rsvpCount: post.event.rsvpCount || 0,
      maxAttendees: post.event.maxAttendees,
      userRsvp: 'attending' as const,
      createdAt: post.createdAt
    };

    calendarIntegration.addEvent(calendarEvent);

    // Show success toast
    toast({
      title: "RSVP Confirmed!",
      description: `You're attending "${post.event.title}". Check your calendar for details.`,
    });

    // Close modal if open
    setSelectedPost(null);

    // Navigate to calendar
    setLocation('/calendar');
  };

  const handleCreatePost = async () => {
    if (!currentUser) return;
    if (newPostType === 'event' && !eventTitle) return;
    if (newPostType !== 'event' && !newPostContent.trim()) return;

    let newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      author: {
        displayName: currentUser.displayName,
        avatar: currentUser.avatar || undefined,
        role: currentUser.jobTitle || currentUser.role
      },
      content: newPostContent,
      type: newPostType,
      likesCount: 0,
      repliesCount: 0,
      createdAt: new Date(),
      liked: false,
      replies: [] as CommunityReply[],
    };

    if (newPostType === 'event' && eventTitle) {
      // Parse and validate event date
      const parsedDate = eventDate ? new Date(eventDate) : new Date();
      const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());
      const eventStartDate = isValidDate ? parsedDate : new Date();
      
      newPost.eventId = `event-${Date.now()}`;
      newPost.event = {
        id: newPost.eventId,
        title: eventTitle,
        type: eventType,
        startDate: eventStartDate,
        location: eventLocation,
        rsvpCount: 0,
        maxAttendees: eventType === 'virtual' ? 100 : 30,
      };
      
      // Auto-add event to Calendar
      const endDate = new Date(eventStartDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration
      const calendarEvent = {
        id: newPost.eventId,
        title: eventTitle,
        description: newPostContent || eventTitle, // Use title as fallback description
        type: eventType,
        startDate: eventStartDate,
        endDate: endDate,
        location: eventLocation,
        createdBy: currentUser.id,
        creator: {
          displayName: currentUser.displayName,
          avatar: currentUser.avatar || undefined,
          role: currentUser.jobTitle || currentUser.role
        },
        rsvpCount: 0,
        maxAttendees: eventType === 'virtual' ? 100 : 30,
        userRsvp: null,
        createdAt: new Date()
      };
      calendarIntegration.addEvent(calendarEvent);

      newPost = {
        ...newPost,
        event: {
          ...newPost.event!,
          endDate,
        },
      };
    }

    try {
      const response = await apiRequest('POST', '/api/community/posts', {
        content: newPost.content,
        type: newPost.type,
        event: newPost.event,
      });
      const sharedPost = normalizePost(await response.json());
      setPosts((prev) => mergeCommunityPosts([sharedPost], prev));
    } catch (error) {
      toast({
        title: "Post failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset form
    setNewPostContent('');
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventLocation('');
    setNewPostType('text');
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'release': return 'bg-purple-500';
      case 'virtual': return 'bg-blue-500';
      case 'in-person': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'release': return '🚀';
      case 'virtual': return '💻';
      case 'in-person': return '🏢';
      default: return '📅';
    }
  };

  if (userQuery.isLoading) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading community...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Please login to access the community</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-community-title">
                Community
              </h1>
              <p className="text-muted-foreground" data-testid="text-community-subtitle">
                Connect, share updates, and stay in sync with your team
              </p>
            </div>
            <div className="flex items-center space-x-4">
                <Select value={filter} onValueChange={(value: 'all' | 'posts' | 'events') => setFilter(value)}>
                <SelectTrigger className="w-32" data-testid="select-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="posts">Text Posts</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Create Post Card */}
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={currentUser.avatar || undefined} />
                  <AvatarFallback>{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">{currentUser.displayName}</span>
                    {getAuthorTag(currentUser.jobTitle || currentUser.role)}
                  </div>
                  
                  <Textarea
                    placeholder="What's happening with your projects?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-20 mb-4"
                    data-testid="textarea-new-post"
                  />

                  {newPostType === 'event' && (
                    <div className="mb-4 p-4 border border-border rounded-lg space-y-3">
                      <h3 className="font-semibold flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Event Details</span>
                      </h3>
                      
                      <Input
                        placeholder="Event title"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        data-testid="input-event-title"
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                          <Select value={eventType} onValueChange={(value: 'virtual' | 'in-person' | 'release') => setEventType(value)}>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="virtual">Virtual Event</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="release">Game Release</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="datetime-local"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          data-testid="input-event-date"
                        />
                      </div>
                      
                      <Input
                        placeholder="Location (virtual link or address)"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        data-testid="input-event-location"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={newPostType === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewPostType('text')}
                        data-testid="button-post-type-text"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                      <Button
                        variant={newPostType === 'event' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewPostType('event')}
                        data-testid="button-post-type-event"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Event
                      </Button>
                    </div>
                    
                    <Button
                      onClick={handleCreatePost}
                      disabled={newPostType === 'event' ? !eventTitle : !newPostContent.trim()}
                      data-testid="button-create-post"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="p-6" data-testid={`post-${post.id}`}>
                  <div className="flex items-start space-x-4">
                    <AuthorAvatar author={post.author} className="w-12 h-12" fallbackClassName="text-sm bg-blue-100 dark:bg-blue-900" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{post.author.displayName}</span>
                        {getAuthorTag(post.author.role)}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>

                      <p 
                        className="mb-4 leading-relaxed cursor-pointer hover:bg-muted/20 p-2 rounded-md transition-colors" 
                        onClick={() => setSelectedPost(post)}
                        data-testid={`post-content-${post.id}`}
                      >
                        {post.content}
                      </p>

                      {/* Event Card */}
                      {post.type === 'event' && post.event && (
                        <div className="mb-4 p-4 border border-border rounded-lg bg-muted/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-6 h-6 ${getEventTypeColor(post.event.type)} rounded-full flex items-center justify-center text-xs`}>
                                  {getEventTypeIcon(post.event.type)}
                                </div>
                                <h3 className="font-semibold" data-testid={`event-title-${post.event.id}`}>
                                  {post.event.title}
                                </h3>
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{post.event.startDate.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                                {post.event.location && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{post.event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>{post.event.rsvpCount} attending</span>
                                  {post.event.maxAttendees && (
                                    <span className="text-xs">({post.event.maxAttendees - post.event.rsvpCount} spots left)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRsvpEvent(post);
                                }}
                                data-testid={`button-rsvp-${post.event.id}`}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                RSVP
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-6 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePost(post.id);
                          }}
                          className={`${post.liked ? 'text-red-500' : ''}`}
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${post.liked ? 'fill-current' : ''}`} />
                          {post.likesCount}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyingTo((prev) => (prev === post.id ? null : post.id));
                          }}
                          data-testid={`button-view-comments-${post.id}`}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`button-share-${post.id}`}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* Reply Box */}
                      {replyingTo === post.id && (
                        <div className="mt-4 p-4 border border-border rounded-lg bg-muted/10" onClick={(e) => e.stopPropagation()}>
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mb-3"
                            data-testid={`textarea-reply-${post.id}`}
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(post.id);
                              }}
                              disabled={!replyContent.trim()}
                              data-testid={`button-submit-reply-${post.id}`}
                            >
                              Reply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              data-testid={`button-cancel-reply-${post.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {post.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {post.replies.slice(0, 2).map((reply: CommunityReply) => (
                            <div key={reply.id} className="flex items-start space-x-3 pl-4 border-l-2 border-border">
                              <AuthorAvatar author={reply.author} className="w-8 h-8" fallbackClassName="text-xs bg-blue-100 dark:bg-blue-900" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{reply.author.displayName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm mb-2" data-testid={`reply-content-${reply.id}`}>
                                  {reply.content}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeReply(post.id, reply.id);
                                  }}
                                  className={`text-xs ${reply.liked ? 'text-red-500' : ''}`}
                                  data-testid={`button-like-reply-${reply.id}`}
                                >
                                  <Heart className={`w-3 h-3 mr-1 ${reply.liked ? 'fill-current' : ''}`} />
                                  {reply.likesCount}
                                </Button>
                              </div>
                            </div>
                          ))}
                          {post.replies.length > 2 && (
                            <button
                              type="button"
                              className="pl-4 text-sm font-medium text-primary hover:underline"
                              onClick={() => setSelectedPost(post)}
                            >
                              View all {post.replies.length} replies
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <Card className="p-8 text-center" data-testid="card-no-posts">
                <div className="text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No posts found</p>
                  <p className="text-sm">Be the first to share something with your team!</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed Post View Dialog */}
        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={(open) => {
            if (!open) {
              setSelectedPost(null);
              setReplyingTo(null);
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-post-detail">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <AuthorAvatar author={selectedPost.author} className="w-10 h-10" fallbackClassName="text-sm bg-blue-100 dark:bg-blue-900" />
                  <div>
                    <span className="font-semibold">{selectedPost.author.displayName}</span>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {getAuthorTag(selectedPost.author.role)}
                      {shouldShowAuthorTag(selectedPost.author.role) && <span>•</span>}
                      <span>{formatRelativeTime(selectedPost.createdAt)}</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Post Content */}
                <div>
                  <p className="text-base leading-relaxed" data-testid="detailed-post-content">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Event Details (if event post) */}
                {selectedPost.type === 'event' && selectedPost.event && (
                  <div className="p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className={`w-6 h-6 ${getEventTypeColor(selectedPost.event.type)} rounded-full flex items-center justify-center text-xs`}>
                            {getEventTypeIcon(selectedPost.event.type)}
                          </div>
                          <h3 className="font-semibold text-lg" data-testid="detailed-event-title">
                            {selectedPost.event.title}
                          </h3>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{selectedPost.event.startDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}</span>
                          </div>
                          {selectedPost.event.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{selectedPost.event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{selectedPost.event.rsvpCount} people attending</span>
                            {selectedPost.event.maxAttendees && (
                              <span className="text-xs">({selectedPost.event.maxAttendees - selectedPost.event.rsvpCount} spots remaining)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleRsvpEvent(selectedPost)}
                          data-testid="detailed-button-rsvp"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          RSVP
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-6 py-2 border-y border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikePost(selectedPost.id);
                    }}
                    className={`${selectedPost.liked ? 'text-red-500' : ''}`}
                    data-testid="detailed-button-like"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${selectedPost.liked ? 'fill-current' : ''}`} />
                    {selectedPost.likesCount} {selectedPost.likesCount === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!selectedPost) return;
                      setReplyingTo((prev) => (prev === selectedPost.id ? null : selectedPost.id));
                    }}
                    data-testid="detailed-button-reply"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {selectedPost.replies.length} {selectedPost.replies.length === 1 ? 'Reply' : 'Replies'}
                  </Button>
                  
                  <Button variant="ghost" size="sm" data-testid="detailed-button-share">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Detailed Replies Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    {selectedPost.replies.length > 0 ? `${selectedPost.replies.length} ${selectedPost.replies.length === 1 ? 'Reply' : 'Replies'}` : 'No replies yet'}
                  </h4>

                  {replyingTo === selectedPost.id && (
                    <div className="p-4 border border-border rounded-lg bg-muted/10">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser.avatar || undefined} />
                          <AvatarFallback className="text-xs">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="mb-3 min-h-16"
                            data-testid="detailed-textarea-reply"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(selectedPost.id)}
                              disabled={!replyContent.trim()}
                              data-testid="detailed-button-submit-reply"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Existing Replies */}
                  {selectedPost.replies.length > 0 && (
                    <div className="space-y-4">
                      {selectedPost.replies.map((reply: CommunityReply) => (
                        <div key={reply.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                          <AuthorAvatar author={reply.author} className="w-8 h-8" fallbackClassName="text-xs bg-blue-100 dark:bg-blue-900" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">{reply.author.displayName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm mb-3 leading-relaxed" data-testid={`detailed-reply-content-${reply.id}`}>
                              {reply.content}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeReply(selectedPost.id, reply.id)}
                              className={`text-xs ${reply.liked ? 'text-red-500' : ''}`}
                              data-testid={`detailed-button-like-reply-${reply.id}`}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${reply.liked ? 'fill-current' : ''}`} />
                              {reply.likesCount}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}