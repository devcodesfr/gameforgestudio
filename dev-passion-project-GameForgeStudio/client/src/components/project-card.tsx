import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_CONFIG } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import { type Project, type ProjectStatusType } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { data: currentUser } = useCurrentUser();
  const statusConfig = PROJECT_STATUS_CONFIG[project.status as ProjectStatusType] || 
    { className: 'status-unknown px-3 py-1 rounded-full text-xs font-medium text-gray-500', label: 'Unknown' };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const isNewProject = () => {
    const now = new Date();
    const createdAt = new Date(project.createdAt);
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7; // Consider projects created within 7 days as "new"
  };

  return (
    <Card 
      className="project-card rounded-xl p-6 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-project-${project.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="game-icon" data-testid={`icon-project-${project.id}`}>
          {project.icon}
        </div>
        <div className="flex items-center space-x-2">
          {isNewProject() && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-1 animate-pulse" data-testid={`badge-new-${project.id}`}>
              New!
            </Badge>
          )}
          <span className={statusConfig.className} data-testid={`status-${project.id}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-project-${project.id}-name`}>
        {project.name}
      </h3>
      <p className="text-muted-foreground text-sm mb-4" data-testid={`text-project-${project.id}-description`}>
        {project.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.teamMembers.slice(0, 3).map((memberId, index) => {
            // Use current user data if the member ID matches the current user
            const getUserData = () => {
              if (currentUser && (memberId === currentUser.id || memberId === 'mock-user-1')) {
                return {
                  displayName: currentUser.displayName,
                  avatar: currentUser.avatar
                };
              }
              // For other team members, use a generic fallback
              return {
                displayName: `Team Member ${index + 1}`,
                avatar: null
              };
            };
            
            const user = getUserData();
            const initials = user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return (
              <div
                key={memberId}
                className="w-6 h-6 rounded-full bg-primary/20 border-2 border-border flex items-center justify-center text-xs font-medium text-primary"
                title={user.displayName}
                data-testid={`avatar-project-${project.id}-${index}`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            );
          })}
          {project.teamMembers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xs">
              +{project.teamMembers.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground" data-testid={`text-project-${project.id}-updated`}>
          Updated {formatTimeAgo(project.lastUpdated)}
        </span>
      </div>
    </Card>
  );
}
