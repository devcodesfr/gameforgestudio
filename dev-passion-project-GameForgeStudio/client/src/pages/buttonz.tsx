import { useState, useEffect, useRef } from "react";
import { Hash, Users, Plus, Settings, Smile, Paperclip, Send, Mail, Phone, Calendar, Edit2, UserCheck, ArrowLeft, Home, X, Sparkles, MessageCircle, Activity, TrendingUp, DoorOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLocation } from "wouter";
import type { Chat, Message, User, ChatMember } from "@shared/schema";

interface ButtonzProps {
  sidebarCollapsed?: boolean;
  standalone?: boolean;
}

// Sample chat data
const sampleChats: Chat[] = [
  {
    id: "main-chat",
    name: "GameForge General",
    description: "Main team chat for all GameForge discussions",
    type: "main",
    isMainChat: 1,
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dev-chat",
    name: "Development",
    description: "Technical discussions and code reviews",
    type: "group",
    isMainChat: 0,
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "design-chat",
    name: "Design & Art",
    description: "Visual design and artwork discussions",
    type: "group",
    isMainChat: 0,
    createdBy: "user-2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample messages
const sampleMessages: Message[] = [
  {
    id: "msg-1",
    chatId: "main-chat",
    userId: "user-1",
    content: "Welcome to Buttonz! 🎮 This is our main communication hub for GameForge.",
    type: "text",
    editedAt: null,
    replyToId: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "msg-2",
    chatId: "main-chat",
    userId: "user-2",
    content: "Love the new bubbly interface! Perfect for team collaboration. 🚀",
    type: "text",
    editedAt: null,
    replyToId: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "msg-3",
    chatId: "main-chat",
    userId: "user-3",
    content: "The GameForge theme looks amazing! Great work on the redesign. 💜",
    type: "text",
    editedAt: null,
    replyToId: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

// Sample users with extended profile data
const sampleUsers: User[] = [
  {
    id: "user-1",
    username: "alex.rodriguez",
    password: "",
    email: "alex@gameforge.com",
    displayName: "Alex Rodriguez",
    role: "Lead Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    banner: null,
    bio: "Lead Developer with 8+ years experience in game development. Specializes in Unity and Unreal Engine.",
    jobTitle: "Lead Game Developer",
    status: "Working on new RPG project",
    location: "San Francisco, CA",
    portfolioLink: null,
    skills: ["Unity", "C#", "Game Architecture", "Team Leadership"],
    currentProject: "Crossy Road Clone",
    availability: "online",
    settings: { notifications: { projectUpdates: true, teamMessages: true, communityActivity: true }, privacy: { profileVisibility: "public", whoCanMessage: "everyone" } },
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "user-2",
    username: "sarah.chen",
    password: "",
    email: "sarah@gameforge.com",
    displayName: "Sarah Chen",
    role: "Game Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    banner: null,
    bio: "Creative game designer passionate about narrative-driven experiences and player engagement.",
    jobTitle: "Senior Game Designer",
    status: "Designing quest system",
    location: "Seattle, WA",
    portfolioLink: null,
    skills: ["Game Design", "Level Design", "Storytelling", "UI/UX"],
    currentProject: "RPG Adventure",
    availability: "online",
    settings: { notifications: { projectUpdates: true, teamMessages: true, communityActivity: true }, privacy: { profileVisibility: "public", whoCanMessage: "everyone" } },
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "user-3",
    username: "james.wilson",
    password: "",
    email: "james@gameforge.com",
    displayName: "James Wilson",
    role: "3D Artist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    banner: null,
    bio: "3D Artist specializing in character modeling, environments, and game assets.",
    jobTitle: "Senior 3D Artist",
    status: "Creating character models",
    location: "Austin, TX",
    portfolioLink: null,
    skills: ["3D Modeling", "Texturing", "Blender", "Maya"],
    currentProject: "Asset Library",
    availability: "away",
    settings: { notifications: { projectUpdates: true, teamMessages: true, communityActivity: true }, privacy: { profileVisibility: "public", whoCanMessage: "everyone" } },
    createdAt: new Date("2024-03-10"),
  },
];

// Extended user profile data for demonstration
const userProfiles = {
  "user-1": {
    bio: "Lead Developer with 8+ years experience in game development. Specializes in Unity and Unreal Engine.",
    status: "Working on new RPG project",
    location: "San Francisco, CA",
    joinedTeam: "January 2024",
    skills: ["Unity", "C#", "Game Architecture", "Team Leadership"],
    currentProject: "Crossy Road Clone",
    availability: "online",
  },
  "user-2": {
    bio: "Creative game designer passionate about narrative-driven experiences and player engagement.",
    status: "Designing quest system",
    location: "Seattle, WA", 
    joinedTeam: "February 2024",
    skills: ["Game Design", "Level Design", "Storytelling", "UI/UX"],
    currentProject: "RPG Adventure",
    availability: "online",
  },
  "user-3": {
    bio: "3D Artist specializing in character modeling, environments, and game assets.",
    status: "Creating character models",
    location: "Austin, TX",
    joinedTeam: "March 2024", 
    skills: ["3D Modeling", "Texturing", "Blender", "Maya"],
    currentProject: "Asset Library",
    availability: "away",
  },
};

function SplashScreen({ type }: { type: 'entry' | 'exit' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background animate-fade-in">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/50 animate-pulse">
          {type === 'entry' ? (
            <MessageCircle className="w-16 h-16 text-white" />
          ) : (
            <DoorOpen className="w-16 h-16 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-5xl font-bold text-foreground mb-2">
            {type === 'entry' ? 'Buttonz' : 'See You Soon!'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {type === 'entry' ? 'Connect & Collaborate' : 'Returning to GameForge'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatSidebar({ chats, activeChat, onChatSelect, standalone = false, onExit, onSettings, currentUser }: {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (chatId: string) => void;
  standalone?: boolean;
  onExit?: () => void;
  onSettings?: () => void;
  currentUser: User;
}) {
  return (
    <div className="w-72 bg-gradient-to-b from-card to-background border-r border-border/50 flex flex-col rounded-r-3xl overflow-hidden animate-slide-in-left">
      {/* Header with GameForge branding */}
      <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-b border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Buttonz
              </h2>
              <p className="text-xs text-muted-foreground">Connect & Collaborate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Welcome Back!</h3>
            <p className="text-xs text-muted-foreground">3 new messages in your channels</p>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-3 mt-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Your Channels
          </div>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                activeChat === chat.id 
                  ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              data-testid={`button-chat-${chat.id}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                activeChat === chat.id ? 'bg-primary/30' : 'bg-muted/50'
              }`}>
                <Hash className={`w-4 h-4 ${activeChat === chat.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{chat.name}</span>
              </div>
              {chat.isMainChat === 1 && (
                <Badge className="ml-auto text-xs bg-primary/90 text-white border-0 rounded-full px-2">
                  Main
                </Badge>
              )}
            </button>
          ))}
          
          {/* Add Channel Button */}
          <button
            className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 text-muted-foreground hover:bg-primary/10 hover:text-primary group"
            data-testid="button-add-channel"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted/50 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Create Channel</span>
          </button>
        </div>
      </ScrollArea>

      {/* User Info with bubbly design */}
      <div className="p-4 bg-gradient-to-t from-card to-background border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={currentUser.avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{currentUser.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.jobTitle || currentUser.role}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-2 h-auto text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
              onClick={onSettings}
              data-testid="button-buttonz-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {standalone && onExit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="p-2 h-auto text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                    onClick={onExit}
                    data-testid="button-exit-buttonz"
                  >
                    <DoorOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Return to GameForge</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatArea({ chat, messages, users, onSendMessage, currentUser }: {
  chat: Chat | null;
  messages: Message[];
  users: User[];
  onSendMessage: (chatId: string, content: string) => void;
  currentUser: User | null;
}) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId) || {
      id: userId,
      displayName: "Unknown User",
      avatar: "",
      role: "Member"
    };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() && chat) {
      onSendMessage(chat.id, messageInput.trim());
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background animate-fade-in">
        <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 max-w-md">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Start a Conversation</h3>
          <p className="text-muted-foreground mb-4">Select a channel from the sidebar to begin chatting with your team</p>
          <Badge className="bg-primary/20 text-primary border-0">
            {sampleChats.length} Active Channels
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background animate-fade-in">
      {/* Chat Header with bubbly design */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-card to-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{chat.name}</h3>
              {chat.description && (
                <p className="text-sm text-muted-foreground">{chat.description}</p>
              )}
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/30 rounded-full">
            <Users className="w-3 h-3 mr-1" />
            {users.length} Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="min-h-full flex flex-col justify-end">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => {
              const user = getUserById(message.userId);
              return (
                <div key={message.id} className="flex gap-4 hover:bg-muted/20 p-3 -mx-3 rounded-2xl transition-all duration-200 group">
                  <button
                    onClick={() => setSelectedUser(user as User)}
                    className="flex-shrink-0"
                    data-testid={`button-avatar-message-${user.id}`}
                  >
                    <Avatar 
                      className="w-10 h-10 border-2 border-primary/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all cursor-pointer"
                    >
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">{user.displayName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="font-semibold text-foreground">{user.displayName}</span>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary px-2 py-0 rounded-full">
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                  </div>
                  <p className="text-foreground/90 text-sm leading-relaxed" data-testid={`message-${message.id}`}>
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Message Input with bubbly design */}
      <div className="p-5 border-t border-border/50 bg-gradient-to-t from-card to-background">
        <div className="flex items-center gap-3 bg-muted/30 rounded-2xl p-3 max-w-4xl mx-auto border border-border/50 focus-within:border-primary/50 focus-within:bg-muted/50 transition-all duration-200">
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-xl h-auto">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Message #${chat.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex-1 bg-transparent border-none text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="input-message"
          />
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-xl h-auto">
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90 text-white p-2 rounded-xl h-auto shadow-lg shadow-primary/30"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Profile Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <UserProfile user={selectedUser} currentUser={currentUser} onClose={() => setSelectedUser(null)} />
        </Dialog>
      )}
    </div>
  );
}

function UserProfile({ user, currentUser, onClose }: { user: User; currentUser: User | null; onClose: () => void }) {
  const profile = userProfiles[user.id as keyof typeof userProfiles];
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profile?.bio || "");
  const [editedStatus, setEditedStatus] = useState(profile?.status || "");

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileUpdates: { bio?: string; status?: string }) => {
      return apiRequest('PATCH', `/api/users/${user.id}`, profileUpdates);
    },
    onSuccess: () => {
      // Invalidate current user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      // TODO: Show error toast notification
    }
  });

  const handleSaveProfile = () => {
    const updates: { bio?: string; status?: string } = {};
    
    if (editedBio !== profile?.bio) {
      updates.bio = editedBio;
    }
    if (editedStatus !== profile?.status) {
      updates.status = editedStatus;
    }

    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    } else {
      setIsEditing(false);
    }
  };

  const handleSendDirectMessage = () => {
    // TODO: Implement direct messaging
    console.log("Starting direct message with:", user.displayName);
    onClose();
  };

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && currentUser.id === user.id;

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] bg-card border-primary/20 overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-foreground text-xl">User Profile</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Header Section with bubbly design */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-lg bg-primary/20 text-primary">{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getAvailabilityColor(profile?.availability || "offline")} rounded-full border-4 border-card shadow-lg`}></div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{user.displayName}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
            <Badge className="mt-2 bg-primary/90 text-white border-0 rounded-full">
              {user.role}
            </Badge>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={handleSendDirectMessage}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/30"
                data-testid={`button-dm-${user.id}`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Message
              </Button>
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-primary/30 text-foreground hover:bg-primary/10 rounded-xl"
                  data-testid="button-edit-profile"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            <Label className="text-sm font-semibold text-foreground">Current Status</Label>
          </div>
          {isEditing && isOwnProfile ? (
            <Input
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              placeholder="What are you working on?"
              className="bg-background border-border/50 text-foreground rounded-xl"
              data-testid="input-edit-status"
            />
          ) : (
            <p className="text-foreground/90">{profile?.status || "No status set"}</p>
          )}
        </div>

        {/* Bio Section */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-3 block">About Me</Label>
          {isEditing && isOwnProfile ? (
            <Textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="bg-muted/30 border-border/50 text-foreground min-h-[100px] rounded-2xl"
              data-testid="input-edit-bio"
            />
          ) : (
            <p className="text-foreground/90 bg-muted/30 rounded-2xl p-4 border border-border/50">
              {profile?.bio || "No bio available"}
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <Label className="text-sm font-semibold text-foreground">Email</Label>
            </div>
            <p className="text-foreground/90 text-sm">{user.email}</p>
          </div>
          
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <Label className="text-sm font-semibold text-foreground">Joined Team</Label>
            </div>
            <p className="text-foreground/90 text-sm">{profile?.joinedTeam || "Unknown"}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <Label className="text-sm font-semibold text-foreground">Current Project</Label>
            </div>
            <p className="text-foreground/90 text-sm">{profile?.currentProject || "No active project"}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Label className="text-sm font-semibold text-foreground">Location</Label>
            </div>
            <p className="text-foreground/90 text-sm">{profile?.location || "Not specified"}</p>
          </div>
        </div>

        {/* Skills Section */}
        {profile?.skills && (
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">Skills & Expertise</Label>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} className="bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Save Changes Button */}
        {isEditing && isOwnProfile && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="border-border/50 text-foreground hover:bg-muted/50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/30"
              data-testid="button-save-profile"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function UserList({ users, currentUser }: { users: User[]; currentUser: User | null }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="w-72 bg-gradient-to-b from-card to-background border-l border-border/50 p-5 rounded-l-3xl overflow-hidden animate-slide-in-right">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Team Members
          </h3>
          <Badge className="bg-primary/20 text-primary border-0 rounded-full">
            {users.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {users.map((user) => {
            const profile = userProfiles[user.id as keyof typeof userProfiles];
            const getAvailabilityColor = (availability: string) => {
              switch (availability) {
                case "online": return "bg-green-500";
                case "away": return "bg-yellow-500";
                case "busy": return "bg-red-500";
                default: return "bg-gray-500";
              }
            };

            return (
              <Dialog key={user.id} open={selectedUser?.id === user.id} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogTrigger asChild>
                  <button
                    className="w-full text-left p-3 rounded-2xl hover:bg-muted/50 transition-all duration-200 group flex items-center gap-3"
                    onClick={() => setSelectedUser(user)}
                    data-testid={`button-user-${user.id}`}
                  >
                    <div className="relative">
                      <Avatar 
                        className="w-10 h-10 rounded-full transition-all" 
                        style={{ 
                          border: '2px solid hsl(262, 80%, 65%, 0.3)',
                          boxShadow: '0 0 0 2px hsl(262, 80%, 65%, 0.1)'
                        }}
                      >
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="rounded-full" style={{ backgroundColor: 'hsl(262, 80%, 65%, 0.1)', color: 'hsl(262, 80%, 65%)' }}>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getAvailabilityColor(profile?.availability || "offline")} rounded-full border-2 border-card`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile?.status || user.role}</p>
                    </div>
                  </button>
                </DialogTrigger>
                <UserProfile user={user} currentUser={currentUser} onClose={() => setSelectedUser(null)} />
              </Dialog>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ButtonzSettings({ open, onClose, currentUser }: { open: boolean; onClose: () => void; currentUser: User }) {
  const [activeTab, setActiveTab] = useState<'my-account' | 'privacy-safety' | 'notifications'>('my-account');
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  
  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'team-only' | 'private'>('public');
  const [whoCanMessage, setWhoCanMessage] = useState<'everyone' | 'team-only' | 'no-one'>('everyone');
  
  // Notification settings state
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [teamMessages, setTeamMessages] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(true);
  const [directMessages, setDirectMessages] = useState(true);
  const [channelMentions, setChannelMentions] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Settings Sidebar - Discord Style */}
          <div className="w-64 bg-muted/30 p-4 space-y-2 border-r border-border overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2">User Settings</h2>
            </div>
            <button 
              onClick={() => setActiveTab('my-account')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === 'my-account' 
                  ? 'bg-primary/20 text-primary font-medium' 
                  : 'hover:bg-muted text-foreground'
              }`}
              data-testid="tab-my-account"
            >
              My Account
            </button>
            <button 
              onClick={() => setActiveTab('privacy-safety')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === 'privacy-safety' 
                  ? 'bg-primary/20 text-primary font-medium' 
                  : 'hover:bg-muted text-foreground'
              }`}
              data-testid="tab-privacy-safety"
            >
              Privacy & Safety
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === 'notifications' 
                  ? 'bg-primary/20 text-primary font-medium' 
                  : 'hover:bg-muted text-foreground'
              }`}
              data-testid="tab-notifications"
            >
              Notifications
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl">
                {/* My Account Tab */}
                {activeTab === 'my-account' && (
                  <>
                    <h1 className="text-2xl font-bold text-foreground mb-2">My Account</h1>
                    <p className="text-sm text-muted-foreground mb-8">Manage your Buttonz profile settings</p>

                    <div className="space-y-6">
                      {/* Username (Real Name) - Disabled */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Username
                        </Label>
                        <Input
                          value={currentUser.username}
                          disabled
                          className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                          data-testid="input-username-disabled"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your username cannot be changed</p>
                      </div>

                      {/* Display Name */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Display Name
                        </Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="How you appear to others"
                          className="rounded-xl"
                          data-testid="input-display-name-buttonz"
                        />
                        <p className="text-xs text-muted-foreground mt-1">This is how you'll appear in Buttonz</p>
                      </div>

                      {/* Email (Disabled) */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Email
                        </Label>
                        <Input
                          value={currentUser.email}
                          disabled
                          className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                          data-testid="input-email-disabled"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Privacy & Safety Tab */}
                {activeTab === 'privacy-safety' && (
                  <>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Privacy & Safety</h1>
                    <p className="text-sm text-muted-foreground mb-8">Control who can see your profile and message you</p>

                    <div className="space-y-8">
                      {/* Profile Visibility */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold text-foreground mb-1">Profile Visibility</h3>
                          <p className="text-sm text-muted-foreground">Choose who can see your profile information</p>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="profile-visibility" 
                              value="public"
                              checked={profileVisibility === 'public'}
                              onChange={() => setProfileVisibility('public')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-visibility-public"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Public</p>
                              <p className="text-xs text-muted-foreground">Anyone can see your profile</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="profile-visibility" 
                              value="team-only"
                              checked={profileVisibility === 'team-only'}
                              onChange={() => setProfileVisibility('team-only')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-visibility-team"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Team Only</p>
                              <p className="text-xs text-muted-foreground">Only team members can see your profile</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="profile-visibility" 
                              value="private"
                              checked={profileVisibility === 'private'}
                              onChange={() => setProfileVisibility('private')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-visibility-private"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Private</p>
                              <p className="text-xs text-muted-foreground">No one can see your profile</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Messaging Permissions */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold text-foreground mb-1">Direct Messages</h3>
                          <p className="text-sm text-muted-foreground">Choose who can send you direct messages</p>
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="who-can-message" 
                              value="everyone"
                              checked={whoCanMessage === 'everyone'}
                              onChange={() => setWhoCanMessage('everyone')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-message-everyone"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Everyone</p>
                              <p className="text-xs text-muted-foreground">Anyone can message you</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="who-can-message" 
                              value="team-only"
                              checked={whoCanMessage === 'team-only'}
                              onChange={() => setWhoCanMessage('team-only')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-message-team"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">Team Only</p>
                              <p className="text-xs text-muted-foreground">Only team members can message you</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name="who-can-message" 
                              value="no-one"
                              checked={whoCanMessage === 'no-one'}
                              onChange={() => setWhoCanMessage('no-one')}
                              className="w-4 h-4 text-primary"
                              data-testid="radio-message-none"
                            />
                            <div>
                              <p className="text-sm font-medium text-foreground">No One</p>
                              <p className="text-xs text-muted-foreground">Disable direct messages</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
                    <p className="text-sm text-muted-foreground mb-8">Manage your notification preferences</p>

                    <div className="space-y-6">
                      {/* Project Updates */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Project Updates</h3>
                          <p className="text-xs text-muted-foreground">Get notified about project milestones and changes</p>
                        </div>
                        <Switch 
                          checked={projectUpdates} 
                          onCheckedChange={setProjectUpdates}
                          data-testid="switch-project-updates"
                        />
                      </div>

                      {/* Team Messages */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Team Messages</h3>
                          <p className="text-xs text-muted-foreground">Receive notifications for team channel messages</p>
                        </div>
                        <Switch 
                          checked={teamMessages} 
                          onCheckedChange={setTeamMessages}
                          data-testid="switch-team-messages"
                        />
                      </div>

                      {/* Community Activity */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Community Activity</h3>
                          <p className="text-xs text-muted-foreground">Stay updated on community discussions and events</p>
                        </div>
                        <Switch 
                          checked={communityActivity} 
                          onCheckedChange={setCommunityActivity}
                          data-testid="switch-community-activity"
                        />
                      </div>

                      {/* Direct Messages */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Direct Messages</h3>
                          <p className="text-xs text-muted-foreground">Get notified when someone sends you a direct message</p>
                        </div>
                        <Switch 
                          checked={directMessages} 
                          onCheckedChange={setDirectMessages}
                          data-testid="switch-direct-messages"
                        />
                      </div>

                      {/* Channel Mentions */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Channel Mentions</h3>
                          <p className="text-xs text-muted-foreground">Be notified when someone mentions you in a channel</p>
                        </div>
                        <Switch 
                          checked={channelMentions} 
                          onCheckedChange={setChannelMentions}
                          data-testid="switch-channel-mentions"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fixed Footer with Save/Cancel Buttons */}
            <div className="border-t border-border p-6">
              <div className="max-w-2xl flex gap-3">
                <Button
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-save-buttonz-settings"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  data-testid="button-cancel-buttonz-settings"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ButtonzPage({ sidebarCollapsed = false, standalone = false }: ButtonzProps) {
  const [activeChat, setActiveChat] = useState("main-chat");
  const [chats] = useState(sampleChats);
  const [messages, setMessages] = useState(sampleMessages);
  const [users] = useState(sampleUsers);
  const [showSplash, setShowSplash] = useState<'entry' | 'exit' | null>('entry');
  const [showSettings, setShowSettings] = useState(false);
  const [, navigate] = useLocation();

  // Get real authenticated user data
  const userQuery = useCurrentUser();
  
  // Handle loading and error states
  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading Buttonz...</div>
      </div>
    );
  }

  if (!userQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to access Buttonz</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentUser = userQuery.data;

  const currentChat = chats.find(c => c.id === activeChat) || null;
  const chatMessages = messages.filter(m => m.chatId === activeChat);

  useEffect(() => {
    if (showSplash === 'entry') {
      const timer = setTimeout(() => {
        setShowSplash(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const handleSendMessage = (chatId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      userId: currentUser.id,
      content,
      type: "text",
      editedAt: null,
      replyToId: null,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleExit = () => {
    setShowSplash('exit');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  if (showSplash) {
    return <SplashScreen type={showSplash} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        standalone ? '' : (sidebarCollapsed ? 'ml-20' : 'ml-64')
      }`}>
        <div className="h-screen flex">
          <ChatSidebar 
            chats={chats} 
            activeChat={activeChat} 
            onChatSelect={setActiveChat}
            standalone={standalone}
            onExit={handleExit}
            onSettings={() => setShowSettings(true)}
            currentUser={currentUser}
          />
          <ChatArea 
            chat={currentChat} 
            messages={chatMessages} 
            users={users}
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
          />
          <UserList users={users} currentUser={currentUser} />
        </div>
      </div>

      {/* Settings Dialog */}
      <ButtonzSettings 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
        currentUser={currentUser} 
      />
    </div>
  );
}
