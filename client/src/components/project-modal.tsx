import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteProject } from "@/hooks/use-projects";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/hooks/use-toast";
import { PROJECT_STATUS_CONFIG, ENGINE_CONFIG, PLATFORM_CONFIG } from "@/lib/constants";
import { type Project, type ProjectStatusType, type GameEngineType, type PlatformType } from "@shared/schema";

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectModal({ project, open, onOpenChange }: ProjectModalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  if (!project) return null;

  // Use fallback to match Projects page logic for consistency
  const userIdToCheck = currentUser?.id || 'mock-user-1';
  const isOwner = userIdToCheck === project.ownerId;

  const handleDeleteProject = async () => {
    if (!project.id) return;
    
    try {
      await deleteProject.mutateAsync(project.id);
      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted.",
      });
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error deleting project",
        description: "There was an error deleting your project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle case-insensitive lookup with fallbacks
  const statusConfig = PROJECT_STATUS_CONFIG[project.status.toLowerCase() as ProjectStatusType] || {
    label: project.status,
    className: 'px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white',
  };
  const engineConfig = ENGINE_CONFIG[project.engine.toLowerCase() as GameEngineType] || {
    label: project.engine,
    icon: 'fas fa-code'
  };
  const platformConfig = PLATFORM_CONFIG[project.platform.toLowerCase() as PlatformType] || {
    label: project.platform,
    icon: 'fas fa-desktop'
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden slide-in-right" data-testid="modal-project-detail">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center space-x-3" data-testid="text-modal-project-title">
              <span className="text-3xl" data-testid="icon-modal-project">{project.icon}</span>
              <span>{project.name}</span>
            </DialogTitle>
            <span className={statusConfig.className} data-testid="status-modal-project">
              {statusConfig.label}
            </span>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {project.screenshots.length > 0 && (
                <img 
                  src={project.screenshots[0]} 
                  alt={`${project.name} screenshot`} 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  data-testid="img-project-screenshot"
                />
              )}
              
              <div data-testid="text-project-description">
                <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                <p className="text-muted-foreground mb-6">{project.description}</p>
                
                {project.features.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                    <ul className="text-muted-foreground space-y-2 mb-6">
                      {project.features.map((feature, index) => (
                        <li key={index} data-testid={`text-feature-${index}`}>• {feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-accent/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Project Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <Badge className={statusConfig.className} data-testid="badge-project-status">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Engine</span>
                    <p className="text-foreground font-medium" data-testid="text-project-engine">
                      {engineConfig.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <p className="text-foreground font-medium" data-testid="text-project-platform">
                      {platformConfig.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Team Size</span>
                    <p className="text-foreground font-medium" data-testid="text-team-size">
                      {project.teamMembers.length} members
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <p className="text-foreground font-medium" data-testid="text-last-updated">
                      {formatTimeAgo(project.lastUpdated)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                <div className="space-y-3">
                  {project.teamMembers.slice(0, 5).map((memberId, index) => {
                    // Use current user data if the member ID matches the current user
                    const getUserData = () => {
                      if (currentUser && (memberId === currentUser.id || memberId === 'mock-user-1')) {
                        return {
                          displayName: currentUser.displayName,
                          avatar: currentUser.avatar,
                          role: currentUser.role
                        };
                      }
                      // For other team members, use a generic fallback
                      return {
                        displayName: `Team Member ${index + 1}`,
                        avatar: null,
                        role: 'Developer'
                      };
                    };
                    
                    const user = getUserData();
                    const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                    
                    return (
                      <div key={memberId} className="flex items-center space-x-3" data-testid={`row-team-member-${index}`}>
                        <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-border flex items-center justify-center text-xs overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-primary font-medium">{initials}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                    );
                  })}
                  {project.teamMembers.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      +{project.teamMembers.length - 5} more members
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-4 px-6 pb-6">
          <div className="flex justify-between items-center">
            <div>
              {isOwner && (
                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-project">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-testid="dialog-delete-confirmation">
                    <AlertDialogHeader>
                      <AlertDialogTitle data-testid="text-delete-title">Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription data-testid="text-delete-description">
                        Are you sure you want to delete this project? This action cannot be undone.
                        All project data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProject}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteProject.isPending}
                        data-testid="button-confirm-delete"
                      >
                        {deleteProject.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-modal">
                Close
              </Button>
              <Button className="btn-gameforge" data-testid="button-open-project">
                Open Project
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
