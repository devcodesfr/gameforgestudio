import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link as LinkIcon, MapPin, Briefcase, Save, X, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import devinProfileImage from "@assets/20250726_182919_1758161967360.jpg";

const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop",
];

interface ProfilePageProps {
  sidebarCollapsed?: boolean;
}

export default function ProfilePage({ sidebarCollapsed = false }: ProfilePageProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/current"],
  });

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    jobTitle: user?.jobTitle || "",
    bio: user?.bio || "",
    location: user?.location || "",
    portfolioLink: user?.portfolioLink || "",
    avatar: user?.avatar || "",
    banner: user?.banner || DEFAULT_BANNERS[0],
  });

  // Update formData when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        jobTitle: user.jobTitle || "",
        bio: user.bio || "",
        location: user.location || "",
        portfolioLink: user.portfolioLink || "",
        avatar: user.avatar || "",
        banner: user.banner || DEFAULT_BANNERS[0],
      });
    }
  }, [user]);

  const handleFileUpload = (file: File, type: 'avatar' | 'banner') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'avatar') {
        setFormData({ ...formData, avatar: base64String });
        setShowAvatarPicker(false);
      } else {
        setFormData({ ...formData, banner: base64String });
        setShowBannerPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error("No user found");
      return apiRequest("PATCH", `/api/users/${user.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || "",
      jobTitle: user?.jobTitle || "",
      bio: user?.bio || "",
      location: user?.location || "",
      portfolioLink: user?.portfolioLink || "",
      avatar: user?.avatar || "",
      banner: user?.banner || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">No user found</div>
      </div>
    );
  }

  // Use fallback avatar and banner if user's are empty/null
  const displayAvatar = formData.avatar || devinProfileImage;
  const displayBanner = formData.banner || DEFAULT_BANNERS[0];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-300">
        {/* Banner Section */}
        <div 
          className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-primary/20 to-primary/5 rounded-b-3xl overflow-hidden"
          data-testid="section-profile-banner"
        >
          <img
            src={displayBanner}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <button
              className="absolute top-4 left-4 bg-background/90 hover:bg-background p-3 rounded-xl transition-colors"
              data-testid="button-change-banner"
              onClick={() => setShowBannerPicker(true)}
            >
              <Pencil className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Profile Picture Overlap */}
        <div className="relative px-4 sm:px-6 md:px-8 -mt-16 sm:-mt-20 md:-mt-24 transition-all duration-300">
          <div className="relative inline-block transition-all duration-300">
            <Avatar 
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 sm:border-6 md:border-8 border-background shadow-2xl"
              style={{ 
                boxShadow: '0 0 30px rgba(162, 89, 255, 0.3)'
              }}
              data-testid="img-profile-avatar"
            >
              <AvatarImage src={displayAvatar} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                className="absolute bottom-2 right-2 bg-primary hover:bg-primary/90 p-2 rounded-full shadow-lg transition-colors"
                data-testid="button-change-avatar"
                onClick={() => setShowAvatarPicker(true)}
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <div className="absolute right-4 sm:right-6 md:right-8 top-4 sm:top-6">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg text-sm sm:text-base"
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="rounded-xl text-sm sm:text-base"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg text-sm sm:text-base"
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{updateProfileMutation.isPending ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information Card */}
        <Card className="mx-4 sm:mx-6 md:mx-8 mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4 sm:space-y-6">
            {/* Display Name */}
            <div>
              <Label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Display Name
              </Label>
              {isEditing ? (
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your display name"
                  className="rounded-xl text-lg font-semibold"
                  data-testid="input-display-name"
                />
              ) : (
                <p className="text-2xl font-bold text-foreground">{user.displayName}</p>
              )}
            </div>

            {/* Job Title - Only for Developers */}
            {user.role !== "regular" && (
              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Title
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Lead Game Developer, 3D Artist"
                    className="rounded-xl"
                    data-testid="input-job-title"
                  />
                ) : (
                  <p className="text-foreground">{user.jobTitle || user.role}</p>
                )}
              </div>
            )}

            {/* Bio */}
            <div>
              <Label className="text-sm font-semibold text-muted-foreground mb-2 block">
                Bio
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl min-h-32 resize-none"
                  maxLength={500}
                  data-testid="input-bio"
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap">{user.bio || "No bio yet"}</p>
              )}
            </div>

            {/* Location - Only for Developers */}
            {user.role !== "regular" && (
              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="rounded-xl"
                    data-testid="input-location"
                  />
                ) : (
                  <p className="text-foreground">{user.location || "Not specified"}</p>
                )}
              </div>
            )}

            {/* Portfolio Link - Only for Developers */}
            {user.role !== "regular" && (
              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Portfolio / Website
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="rounded-xl"
                    data-testid="input-portfolio-link"
                  />
                ) : user.portfolioLink ? (
                  <a
                    href={user.portfolioLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-portfolio"
                  >
                    {user.portfolioLink}
                  </a>
                ) : (
                  <p className="text-foreground">Not specified</p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="h-16" />
      </div>

      {/* Banner Picker Dialog */}
      <Dialog open={showBannerPicker} onOpenChange={setShowBannerPicker}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Button
                onClick={() => bannerFileInputRef.current?.click()}
                className="w-full rounded-xl"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload from Computer
              </Button>
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'banner');
                }}
                data-testid="input-banner-file"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Choose from defaults</Label>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_BANNERS.map((banner, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFormData({ ...formData, banner });
                      setShowBannerPicker(false);
                    }}
                    className="relative rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-colors"
                    data-testid={`button-banner-${index}`}
                  >
                    <img
                      src={banner}
                      alt={`Banner option ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Picker Dialog */}
      <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div>
            <Button
              onClick={() => avatarFileInputRef.current?.click()}
              className="w-full rounded-xl"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload from Computer
            </Button>
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'avatar');
              }}
              data-testid="input-avatar-file"
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
