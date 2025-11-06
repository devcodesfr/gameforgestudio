import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { UserPlus, Code, GamepadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import gameforgeIcon from "@assets/[passion project] gameforge icon (transparent background)_1762389151619.png";

type UserRole = "developer" | "regular";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"role-selection" | "signup">("role-selection");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    // Developer-specific fields
    jobTitle: "",
    bio: "",
    location: "",
    portfolioLink: "",
  });

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setStep("signup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        displayName: formData.displayName,
        role: selectedRole,
      };

      // Add developer-specific fields if role is developer
      if (selectedRole === "developer") {
        signupData.jobTitle = formData.jobTitle;
        signupData.bio = formData.bio;
        signupData.location = formData.location;
        signupData.portfolioLink = formData.portfolioLink;
      }

      await apiRequest("POST", "/api/auth/signup", signupData);

      toast({
        title: "Account created!",
        description: "Welcome to GameForge",
      });

      // Redirect to login
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {step === "role-selection" ? (
        /* Role Selection */
        <Card className="w-full max-w-4xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img 
                src={gameforgeIcon} 
                alt="GameForge Logo" 
                className="w-20 h-20 rounded-2xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to GameForge</h1>
            <p className="text-muted-foreground">Choose your account type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Developer Card */}
            <button
              onClick={() => handleRoleSelection("developer")}
              className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 bg-card p-6 text-left"
              data-testid="button-role-developer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Developer</h3>
                  <p className="text-sm text-muted-foreground">
                    Full access to development tools, project management, analytics, and team collaboration features
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Create and manage projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Access to Asset Store</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Distribution & Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Team collaboration tools</span>
                  </li>
                </ul>
              </div>
            </button>

            {/* Regular User Card */}
            <button
              onClick={() => handleRoleSelection("regular")}
              className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 bg-card p-6 text-left"
              data-testid="button-role-regular"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <GamepadIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Regular User</h3>
                  <p className="text-sm text-muted-foreground">
                    Perfect for gamers who want to explore, play, and connect with the gaming community
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Game library management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Community features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Event calendar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Chat with other gamers</span>
                  </li>
                </ul>
              </div>
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
              data-testid="link-login"
            >
              Sign in
            </button>
          </div>
        </Card>
      ) : (
        /* Signup Form */
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={() => setStep("role-selection")}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              data-testid="button-back"
            >
              ← Back to role selection
            </button>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedRole === "developer" ? "Developer" : "Gamer"} Sign Up
            </h1>
            <p className="text-muted-foreground">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How you'll appear to others"
                required
                className="mt-1"
                data-testid="input-display-name"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a unique username"
                required
                className="mt-1"
                data-testid="input-username"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                className="mt-1"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="mt-1"
                data-testid="input-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                required
                className="mt-1"
                data-testid="input-confirm-password"
              />
            </div>

            {/* Developer-Specific Fields */}
            {selectedRole === "developer" && (
              <>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Game Developer, 3D Artist"
                    className="mt-1"
                    data-testid="input-job-title"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="mt-1"
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolioLink">Portfolio Link (Optional)</Label>
                  <Input
                    id="portfolioLink"
                    type="url"
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="mt-1"
                    data-testid="input-portfolio"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1 resize-none"
                    rows={3}
                    data-testid="input-bio"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
              data-testid="button-signup"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
              data-testid="link-login-bottom"
            >
              Sign in
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
