import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Lock, Save, User as UserIcon, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface UserSettings {
  notifications: {
    projectUpdates: boolean;
    teamMessages: boolean;
    communityActivity: boolean;
  };
  privacy: {
    profileVisibility: "public" | "team-only" | "private";
    whoCanMessage: "everyone" | "team-only" | "no-one";
  };
}

interface SettingsPageProps {
  sidebarCollapsed?: boolean;
}

export default function SettingsPage({ sidebarCollapsed = false }: SettingsPageProps) {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/current"],
  });

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      projectUpdates: true,
      teamMessages: true,
      communityActivity: true,
    },
    privacy: {
      profileVisibility: "public",
      whoCanMessage: "everyone",
    },
  });

  const [accountData, setAccountData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings as UserSettings);
    }
    if (user) {
      setAccountData(prev => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      if (!user) throw new Error("No user found");
      return apiRequest("PATCH", `/api/users/${user.id}`, { settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: { type: 'username' | 'email' | 'password', value: any }) => {
      if (!user) throw new Error("No user found");
      
      if (data.type === 'password') {
        return apiRequest("PATCH", `/api/auth/change-password`, data.value);
      } else {
        return apiRequest("PATCH", `/api/users/${user.id}`, { [data.type]: data.value });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      
      const messages = {
        username: "Username updated successfully",
        email: "Email updated successfully",
        password: "Password changed successfully",
      };
      
      toast({
        title: "Success",
        description: messages[variables.type],
      });

      // Clear password fields
      if (variables.type === 'password') {
        setAccountData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleUpdateUsername = () => {
    if (accountData.username !== user?.username) {
      updateCredentialsMutation.mutate({ type: 'username', value: accountData.username });
    }
  };

  const handleUpdateEmail = () => {
    if (accountData.email !== user?.email) {
      updateCredentialsMutation.mutate({ type: 'email', value: accountData.email });
    }
  };

  const handleChangePassword = () => {
    if (!accountData.currentPassword) {
      toast({
        title: "Validation error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (accountData.newPassword.length < 6) {
      toast({
        title: "Validation error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (accountData.newPassword !== accountData.confirmPassword) {
      toast({
        title: "Validation error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    updateCredentialsMutation.mutate({
      type: 'password',
      value: {
        currentPassword: accountData.currentPassword,
        newPassword: accountData.newPassword,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
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

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 p-8 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
          </div>

          {/* Account Settings Section */}
          <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Account Settings</h2>
                <p className="text-sm text-muted-foreground">Update your account credentials</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <Label className="text-base font-semibold text-foreground mb-3 block">
                  Username
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={accountData.username}
                    onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                    className="rounded-xl"
                    data-testid="input-username"
                  />
                  <Button
                    onClick={handleUpdateUsername}
                    disabled={accountData.username === user?.username || updateCredentialsMutation.isPending}
                    className="rounded-xl"
                    data-testid="button-update-username"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-base font-semibold text-foreground mb-3 block">
                  Email
                </Label>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="rounded-xl"
                    data-testid="input-email"
                  />
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={accountData.email === user?.email || updateCredentialsMutation.isPending}
                    className="rounded-xl"
                    data-testid="button-update-email"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Current Password
                    </Label>
                    <Input
                      type="password"
                      value={accountData.currentPassword}
                      onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                      className="rounded-xl"
                      data-testid="input-current-password"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      New Password
                    </Label>
                    <Input
                      type="password"
                      value={accountData.newPassword}
                      onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                      className="rounded-xl"
                      data-testid="input-new-password"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      value={accountData.confirmPassword}
                      onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                      className="rounded-xl"
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={!accountData.currentPassword || !accountData.newPassword || updateCredentialsMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl w-full"
                    data-testid="button-change-password"
                  >
                    {updateCredentialsMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

        {/* Notifications Section */}
        <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Push Notifications</h2>
              <p className="text-sm text-muted-foreground">Choose what updates you want to receive</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-colors">
              <div>
                <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="project-updates">
                  Project Updates
                </Label>
                <p className="text-sm text-muted-foreground">Notifications about your projects and milestones</p>
              </div>
              <Switch
                id="project-updates"
                checked={settings.notifications.projectUpdates}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, projectUpdates: checked },
                  })
                }
                data-testid="switch-project-updates"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-colors">
              <div>
                <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="team-messages">
                  Team Messages
                </Label>
                <p className="text-sm text-muted-foreground">Messages and mentions from your team</p>
              </div>
              <Switch
                id="team-messages"
                checked={settings.notifications.teamMessages}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, teamMessages: checked },
                  })
                }
                data-testid="switch-team-messages"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-colors">
              <div>
                <Label className="text-base font-semibold text-foreground cursor-pointer" htmlFor="community-activity">
                  Community Activity
                </Label>
                <p className="text-sm text-muted-foreground">Updates from community posts and events</p>
              </div>
              <Switch
                id="community-activity"
                checked={settings.notifications.communityActivity}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, communityActivity: checked },
                  })
                }
                data-testid="switch-community-activity"
              />
            </div>
          </div>
        </Card>

        {/* Privacy Section */}
        <Card className="p-6 rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Privacy</h2>
              <p className="text-sm text-muted-foreground">Control who can see your information</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold text-foreground mb-3 block">
                Profile Visibility
              </Label>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value: "public" | "team-only" | "private") =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, profileVisibility: value },
                  })
                }
              >
                <SelectTrigger className="rounded-xl" data-testid="select-profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can view your profile</SelectItem>
                  <SelectItem value="team-only">Team Only - Only team members can view</SelectItem>
                  <SelectItem value="private">Private - Only you can view your profile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold text-foreground mb-3 block">
                Who Can Message You
              </Label>
              <Select
                value={settings.privacy.whoCanMessage}
                onValueChange={(value: "everyone" | "team-only" | "no-one") =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, whoCanMessage: value },
                  })
                }
              >
                <SelectTrigger className="rounded-xl" data-testid="select-who-can-message">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="team-only">Team Members Only</SelectItem>
                  <SelectItem value="no-one">No One</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg px-8"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
