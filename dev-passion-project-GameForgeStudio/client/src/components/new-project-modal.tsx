import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProject, useProjects } from "@/hooks/use-projects";
import { useCurrentUser } from "@/hooks/use-current-user";
import { GameEngine, Platform, ProjectStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROJECT_TEMPLATES = [
  { id: '2d-platformer', name: '2D Platformer', icon: 'fas fa-gamepad', color: 'bg-primary/20 text-primary' },
  { id: '3d-adventure', name: '3D Adventure', icon: 'fas fa-cube', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'blank', name: 'Blank Project', icon: 'fas fa-rocket', color: 'bg-green-500/20 text-green-400' },
];

const PROJECT_ICONS = ['🎮', '🚀', '⚔️', '🏎️', '🧩', '🌟', '🏰', '🌌', '🏃', '🎯'];

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    engine: '',
    platform: '',
    icon: '🎮',
    template: '',
  });

  const createProject = useCreateProject();
  const { data: projects } = useProjects();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userIdToUse = currentUser?.id || 'mock-user-1';
    
    if (!formData.name || !formData.description || !formData.engine || !formData.platform) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate project names
    const isDuplicate = projects?.some(project => 
      project.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "A project with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProject.mutateAsync({
        name: formData.name,
        description: formData.description,
        engine: formData.engine as any,
        platform: formData.platform as any,
        icon: formData.icon,
        status: ProjectStatus.NOT_STARTED,
        ownerId: userIdToUse,
        teamMembers: [userIdToUse],
        features: [],
        screenshots: [],
      });

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        engine: '',
        platform: '',
        icon: '🎮',
        template: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden slide-in-right" data-testid="modal-new-project">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-2xl font-bold" data-testid="text-new-project-title">Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="block text-sm font-medium text-foreground mb-2">
                Project Name
              </Label>
              <Input
                id="project-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
                data-testid="input-project-name"
              />
            </div>

            <div>
              <Label htmlFor="project-description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project"
                rows={3}
                required
                data-testid="input-project-description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game-engine" className="block text-sm font-medium text-foreground mb-2">
                  Game Engine
                </Label>
                <Select value={formData.engine} onValueChange={(value) => setFormData({ ...formData, engine: value })}>
                  <SelectTrigger data-testid="select-game-engine">
                    <SelectValue placeholder="Select engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GameEngine.UNITY}>Unity 3D</SelectItem>
                    <SelectItem value={GameEngine.UNREAL}>Unreal Engine</SelectItem>
                    <SelectItem value={GameEngine.GODOT}>Godot</SelectItem>
                    <SelectItem value={GameEngine.HTML5}>HTML5</SelectItem>
                    <SelectItem value={GameEngine.CUSTOM}>Custom Engine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform" className="block text-sm font-medium text-foreground mb-2">
                  Platform
                </Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Platform.PC}>PC</SelectItem>
                    <SelectItem value={Platform.MOBILE}>Mobile</SelectItem>
                    <SelectItem value={Platform.CONSOLE}>Console</SelectItem>
                    <SelectItem value={Platform.VR}>VR</SelectItem>
                    <SelectItem value={Platform.WEB}>Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Project Icon
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {PROJECT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                      formData.icon === icon
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, icon })}
                    data-testid={`button-icon-${icon}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Project Template
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROJECT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, template: template.id })}
                    data-testid={`button-template-${template.id}`}
                  >
                    <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <i className={`${template.icon} text-xl`} />
                    </div>
                    <p className="text-center text-sm font-medium">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-project"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="btn-gameforge"
              disabled={createProject.isPending}
              data-testid="button-create-project"
            >
              {createProject.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
