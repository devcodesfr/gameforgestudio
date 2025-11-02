import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/metric-card";
import { ProjectCard } from "@/components/project-card";
import { ProjectModal } from "@/components/project-modal";
import { NewProjectModal } from "@/components/new-project-modal";
import { useQuery } from "@tanstack/react-query";
import { useProjects } from "@/hooks/use-projects";
import { useMetrics } from "@/hooks/use-metrics";
import { type Project, type User, type Metrics, type Asset } from "@shared/schema";
import { Network, Users, Box, Gamepad2, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

interface DashboardProps {
  sidebarCollapsed?: boolean;
}

export default function Dashboard({ sidebarCollapsed = false }: DashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user/current'],
  });

  // Fetch projects, metrics, and assets
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: metrics } = useMetrics(currentUser?.id || '');
  const { data: assets = [] } = useQuery<Asset[]>({ queryKey: ['/api/assets'] });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Welcome back, {currentUser?.displayName || 'Alex'}! Here's your development overview.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <MetricCard
              icon={Network}
              iconColor="bg-indigo-500/20 text-indigo-400"
              value={metrics?.activeProjects || 12}
              label="Active Projects"
              change="+3 this month"
            />
            <MetricCard
              icon={Users}
              iconColor="bg-blue-500/20 text-blue-400"
              value={metrics?.teamMembers || 100}
              label="Team Members"
              change="+5 this week"
            />
            <MetricCard
              icon={Box}
              iconColor="bg-purple-500/20 text-purple-400"
              value={assets.length || 25}
              label="Assets Created"
              change="+2 today"
            />
            <MetricCard
              icon={Gamepad2}
              iconColor="bg-orange-500/20 text-orange-400"
              value={metrics?.gamesPublished || 23}
              label="Games Published"
              change="+2 this month"
            />
            <MetricCard
              icon={DollarSign}
              iconColor="bg-green-500/20 text-green-400"
              value={formatCurrency(metrics?.revenue || 12745000)}
              label="Revenue This Month"
              change="+18.5% from last month"
            />
          </div>

          {/* Dashboard Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <Card className="p-6" data-testid="card-recent-projects">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
                  <Link href="/projects">
                    <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all-projects">
                      Show All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentProjects.map((project) => {
                    const statusConfig = {
                      'live': { className: 'status-live px-3 py-1 rounded-full text-xs font-medium text-white', label: 'Live' },
                      'in-progress': { className: 'status-progress px-3 py-1 rounded-full text-xs font-medium text-white', label: 'In Progress' },
                      'not-started': { className: 'status-not-started px-3 py-1 rounded-full text-xs font-medium text-gray-700', label: 'Not Started' },
                    };
                    const config = statusConfig[project.status as keyof typeof statusConfig] || 
                      { className: 'status-unknown px-3 py-1 rounded-full text-xs font-medium text-gray-500', label: 'Unknown' };
                    
                    return (
                      <div 
                        key={project.id} 
                        className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                        data-testid={`row-recent-project-${project.id}`}
                      >
                        <div className="game-icon">{project.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last updated {new Date(project.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                        <span className={config.className}>{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Goal Achievement Center */}
            <div>
              <Card className="p-6 mb-6" data-testid="card-goal-achievement">
                <h2 className="text-xl font-semibold text-foreground mb-6">Goal Achievement</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Sprint Velocity', value: '+15%', progress: 78 },
                    { label: 'Code Quality', value: '+8%', progress: 85 },
                    { label: 'Team Productivity', value: '+12%', progress: 67 },
                    { label: 'Bug Resolution', value: '+23%', progress: 92 },
                  ].map((goal, index) => (
                    <div key={index} data-testid={`goal-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">{goal.label}</span>
                        <span className="text-sm text-muted-foreground">{goal.value}</span>
                      </div>
                      <div className="progress-bar h-2 rounded-full overflow-hidden">
                        <div 
                          className="progress-fill h-full rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Team Activity */}
              <Card className="p-6" data-testid="card-team-activity">
                <h2 className="text-xl font-semibold text-foreground mb-4">Team Activity</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah Chen', action: 'pushed code', time: '2 min ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150' },
                    { name: 'Maria Garcia', action: 'updated assets', time: '15 min ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150' },
                    { name: 'James Wilson', action: 'published build', time: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`activity-${index}`}>
                      <img 
                        src={activity.avatar} 
                        alt={activity.name} 
                        className="w-8 h-8 rounded-full border-2 border-border"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.name} {activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        project={selectedProject}
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
      />
    </div>
  );
}
