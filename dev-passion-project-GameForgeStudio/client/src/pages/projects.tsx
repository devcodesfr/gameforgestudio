import { useState } from 'react';
import { Search, Filter, Grid, List, Plus, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/project-card';
import { ProjectModal } from '@/components/project-modal';
import { NewProjectModal } from '@/components/new-project-modal';
import { useProjects } from '@/hooks/use-projects';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Project } from '@shared/schema';
import { PROJECT_STATUS_CONFIG, ENGINE_CONFIG, PLATFORM_CONFIG } from '@/lib/constants';

interface ProjectsPageProps {
  sidebarCollapsed?: boolean;
}

export default function ProjectsPage({ sidebarCollapsed = false }: ProjectsPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [engineFilter, setEngineFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: projects = [], isLoading } = useProjects();
  const { data: currentUser } = useCurrentUser();

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  // Apply all filters and sorting
  let filteredProjects = projects.filter(project => {
    // Search filter
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }

    // Engine filter
    if (engineFilter !== 'all' && project.engine !== engineFilter) {
      return false;
    }

    // Platform filter
    if (platformFilter !== 'all' && project.platform !== platformFilter) {
      return false;
    }

    // Owner filter
    const userIdToCheck = currentUser?.id || 'mock-user-1';
    if (ownerFilter === 'mine' && project.ownerId !== userIdToCheck) {
      return false;
    }
    if (ownerFilter === 'community' && project.ownerId === userIdToCheck) {
      return false;
    }

    return true;
  });

  // Apply sorting
  filteredProjects.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'lastUpdated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const totalProjects = projects.length;
  const userIdToCheck = currentUser?.id || 'mock-user-1';
  const myProjects = projects.filter(p => p.ownerId === userIdToCheck).length;
  const communityProjects = totalProjects - myProjects;
  const activeProjects = projects.filter(p => p.status === 'in-progress' || p.status === 'live').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-muted rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-projects-title">
                Projects
              </h1>
              <p className="text-muted-foreground" data-testid="text-projects-subtitle">
                Manage and organize your game development projects
              </p>
            </div>
            <Button 
              onClick={() => setNewProjectModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-new-project"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>


          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-projects"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger className="w-32" data-testid="select-owner-filter">
                  <SelectValue placeholder="Owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="mine">My Projects</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                </SelectContent>
              </Select>

              <Select value={engineFilter} onValueChange={setEngineFilter}>
                <SelectTrigger className="w-32" data-testid="select-engine-filter">
                  <SelectValue placeholder="Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  <SelectItem value="unity">Unity 3D</SelectItem>
                  <SelectItem value="unreal">Unreal Engine</SelectItem>
                  <SelectItem value="godot">Godot</SelectItem>
                  <SelectItem value="html5">HTML5</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-32" data-testid="select-platform-filter">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="pc">PC</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="console">Console</SelectItem>
                  <SelectItem value="vr">VR</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-stretch gap-0 whitespace-nowrap">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 rounded-r-none" data-testid="select-sort">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastUpdated">Last Updated</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-r-md rounded-l-none -ml-px overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-view-grid"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || statusFilter !== 'all' || engineFilter !== 'all' || platformFilter !== 'all' || ownerFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-filter-search">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">×</button>
                </Badge>
              )}
              {ownerFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-filter-owner">
                  Owner: {ownerFilter}
                  <button onClick={() => setOwnerFilter('all')} className="ml-1 hover:text-foreground">×</button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-filter-status">
                  Status: {PROJECT_STATUS_CONFIG[statusFilter as keyof typeof PROJECT_STATUS_CONFIG]?.label}
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-foreground">×</button>
                </Badge>
              )}
              {engineFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-filter-engine">
                  Engine: {ENGINE_CONFIG[engineFilter as keyof typeof ENGINE_CONFIG]?.label}
                  <button onClick={() => setEngineFilter('all')} className="ml-1 hover:text-foreground">×</button>
                </Badge>
              )}
              {platformFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1" data-testid="badge-filter-platform">
                  Platform: {PLATFORM_CONFIG[platformFilter as keyof typeof PLATFORM_CONFIG]?.label}
                  <button onClick={() => setPlatformFilter('all')} className="ml-1 hover:text-foreground">×</button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setOwnerFilter('all');
                  setStatusFilter('all');
                  setEngineFilter('all');
                  setPlatformFilter('all');
                }}
                className="h-6 px-2 text-xs"
                data-testid="button-clear-filters"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Projects Grid/List */}
        <div className="p-8">
          {filteredProjects.length === 0 ? (
            <Card className="p-12 text-center" data-testid="card-no-projects">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                {projects.length === 0 
                  ? "Get started by creating your first game project"
                  : "Try adjusting your filters or search terms"
                }
              </p>
              <Button 
                onClick={() => setNewProjectModalOpen(true)}
                data-testid="button-create-first-project"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Card>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-6 text-sm text-muted-foreground" data-testid="text-results-count">
                Showing {filteredProjects.length} of {totalProjects} projects
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-projects">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4" data-testid="list-projects">
                  {filteredProjects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleProjectClick(project)}
                      data-testid={`card-project-list-${project.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl" data-testid={`icon-project-list-${project.id}`}>
                            {project.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg" data-testid={`text-project-list-${project.id}-name`}>
                              {project.name}
                            </h3>
                            <p className="text-muted-foreground text-sm" data-testid={`text-project-list-${project.id}-description`}>
                              {project.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            className={PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG]?.className}
                            data-testid={`status-project-list-${project.id}`}
                          >
                            {PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG]?.label}
                          </Badge>
                          <div className="text-sm text-muted-foreground" data-testid={`text-project-list-${project.id}-engine`}>
                            {ENGINE_CONFIG[project.engine as keyof typeof ENGINE_CONFIG]?.label}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-project-list-${project.id}-platform`}>
                            {PLATFORM_CONFIG[project.platform as keyof typeof PLATFORM_CONFIG]?.label}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <ProjectModal
          project={selectedProject}
          open={projectModalOpen}
          onOpenChange={setProjectModalOpen}
        />
        
        <NewProjectModal
          open={newProjectModalOpen}
          onOpenChange={setNewProjectModalOpen}
        />
      </div>
    </div>
  );
}