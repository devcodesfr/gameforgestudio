import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Play, Code, Gamepad2, Zap, Settings, Plus, ExternalLink, Star, Users, Cog } from "lucide-react";
import unityLogo from "@assets/image_1758099461875.png";
import unrealLogo from "@assets/image_1758098430126.png";
import godotLogo from "@assets/image_1758098231122.png";
import constructLogo from "@assets/image_1758098830581.png";
import defoldLogo from "@assets/image_1758098857086.png";
import gamemakerLogo from "@assets/image_1758098789559.png";
import steamLogo from "@assets/image_1758782591979.png";

interface GameEngine {
  id: string;
  name: string;
  version: string;
  description: string;
  logo: string;
  platforms: string[];
  programmingLanguages: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  features: string[];
  popularity: number;
  isRecommended?: boolean;
  documentationUrl: string;
  templateProjects: string[];
}

const GAME_ENGINES: GameEngine[] = [
  {
    id: "gameforge-rory",
    name: "GameForge Rory",
    version: "1.0.0",
    description: "GameForge's proprietary game engine designed for rapid prototyping and professional game development. Optimized for the GameForge ecosystem.",
    logo: "gameforge",
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "Web", "Console"],
    programmingLanguages: ["JavaScript", "TypeScript", "Visual Scripting"],
    difficulty: "Beginner",
    features: ["GameForge Integration", "Rapid Prototyping", "Built-in Analytics", "Asset Store Ready", "Cloud Publishing"],
    popularity: 92,
    isRecommended: true,
    documentationUrl: "#",
    templateProjects: ["Action Game", "Puzzle Game", "Platformer", "RPG Starter", "Mobile Game"]
  },
  {
    id: "unity",
    name: "Unity",
    version: "2023.3 LTS",
    description: "The world's leading platform for creating and operating real-time 3D content. Perfect for 2D and 3D games across all platforms.",
    logo: unityLogo,
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "WebGL", "Console"],
    programmingLanguages: ["C#", "Visual Scripting"],
    difficulty: "Intermediate",
    features: ["Visual Editor", "Asset Store", "Cross-platform", "3D & 2D Support"],
    popularity: 95,
    isRecommended: true,
    documentationUrl: "https://docs.unity3d.com",
    templateProjects: ["3D Game", "2D Platformer", "Mobile Game", "VR Experience"]
  },
  {
    id: "unreal",
    name: "Unreal Engine",
    version: "5.3",
    description: "Create stunning, high-fidelity experiences across PC, console, mobile, and VR/AR platforms.",
    logo: unrealLogo,
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "Console", "VR/AR"],
    programmingLanguages: ["C++", "Blueprint Visual Scripting"],
    difficulty: "Advanced",
    features: ["Nanite Virtualized Geometry", "Lumen Global Illumination", "Blueprint System", "Marketplace"],
    popularity: 88,
    documentationUrl: "https://docs.unrealengine.com",
    templateProjects: ["First Person", "Third Person", "Racing Game", "VR Template"]
  },
  {
    id: "godot",
    name: "Godot",
    version: "4.2",
    description: "A feature-packed, cross-platform game engine to create 2D and 3D games from a unified interface.",
    logo: godotLogo,
    platforms: ["Windows", "macOS", "Linux", "iOS", "Android", "Web"],
    programmingLanguages: ["GDScript", "C#", "C++", "Visual Scripting"],
    difficulty: "Beginner",
    features: ["Open Source", "Lightweight", "Node-based Architecture", "Built-in Scripting"],
    popularity: 76,
    isRecommended: true,
    documentationUrl: "https://docs.godotengine.org",
    templateProjects: ["2D Game", "3D Game", "Mobile Game", "Puzzle Game"]
  },
  {
    id: "construct",
    name: "Construct 3",
    version: "r368",
    description: "Make games fast with the powerful browser-based editor. No programming required!",
    logo: constructLogo,
    platforms: ["Web", "iOS", "Android", "Windows", "macOS", "Linux"],
    programmingLanguages: ["Visual Scripting", "JavaScript"],
    difficulty: "Beginner",
    features: ["Browser-based", "No Coding Required", "Event System", "Built-in Physics"],
    popularity: 65,
    documentationUrl: "https://www.construct.net/en/make-games/manuals",
    templateProjects: ["Platformer", "Puzzle Game", "Endless Runner", "Match-3"]
  },
  {
    id: "defold",
    name: "Defold",
    version: "1.7.0",
    description: "A free-to-use, source-available 2D game engine with a developer-friendly license.",
    logo: defoldLogo,
    platforms: ["iOS", "Android", "Web", "Windows", "macOS", "Linux"],
    programmingLanguages: ["Lua", "C"],
    difficulty: "Intermediate",
    features: ["2D Focused", "Lua Scripting", "Lightweight", "King Partnership"],
    popularity: 58,
    documentationUrl: "https://defold.com/manuals/",
    templateProjects: ["Mobile Game", "Web Game", "Platformer", "Puzzle Game"]
  },
  {
    id: "gamemaker",
    name: "GameMaker Studio",
    version: "2023.11",
    description: "The ultimate 2D game development environment designed for making cross-platform games.",
    logo: gamemakerLogo,
    platforms: ["Windows", "macOS", "iOS", "Android", "Nintendo Switch", "Xbox", "PlayStation"],
    programmingLanguages: ["GML", "Visual Scripting"],
    difficulty: "Intermediate",
    features: ["2D Specialized", "GML Scripting", "Marketplace", "Console Publishing"],
    popularity: 72,
    documentationUrl: "https://manual.yoyogames.com",
    templateProjects: ["Top-Down Shooter", "Platformer", "RPG", "Puzzle Game"]
  },
  {
    id: "steam",
    name: "Steam Platform",
    version: "Latest",
    description: "Valve's digital distribution platform providing publishing tools, analytics, and market access for PC gaming.",
    logo: steamLogo,
    platforms: ["Windows", "macOS", "Linux", "Steam Deck"],
    programmingLanguages: ["Any Engine Compatible"],
    difficulty: "Intermediate",
    features: ["Digital Distribution", "Steam Workshop", "Steam Achievements", "Steam Cloud", "Analytics"],
    popularity: 90,
    isRecommended: true,
    documentationUrl: "https://partner.steamgames.com",
    templateProjects: ["Steam Game", "Workshop Integration", "Achievement System", "Cloud Saves"]
  }
];

interface GameEngineCardProps {
  engine: GameEngine;
  onStartProject: (engine: GameEngine) => void;
}

function GameEngineCard({ engine, onStartProject }: GameEngineCardProps) {
  return (
    <Card className="engine-card p-6 hover:shadow-lg transition-all duration-200 relative" data-testid={`card-engine-${engine.id}`}>
      {engine.isRecommended && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
          <Star className="w-3 h-3 mr-1" />
          Recommended
        </Badge>
      )}
      
      <div className="flex items-start space-x-4">
{engine.logo !== 'gameforge' && typeof engine.logo === 'string' && engine.logo.length > 5 ? (
          <img 
            src={engine.logo} 
            alt={`${engine.name} logo`}
            className="h-16 rounded-lg object-contain"
            data-testid={`img-engine-${engine.id}`}
          />
        ) : engine.logo === 'gameforge' ? (
          <div 
            className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center relative"
            data-testid={`icon-engine-${engine.id}`}
          >
            <Gamepad2 className="w-8 h-8 text-primary" />
            <Cog className="w-4 h-4 text-primary absolute top-1 right-1" />
          </div>
        ) : (
          <div 
            className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-2xl"
            data-testid={`icon-engine-${engine.id}`}
          >
            {engine.logo}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground" data-testid={`text-engine-${engine.id}-name`}>
              {engine.name}
            </h3>
            <Badge variant="outline" data-testid={`badge-engine-${engine.id}-version`}>
              {engine.version}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-engine-${engine.id}-description`}>
            {engine.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{engine.popularity}% popular</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {engine.programmingLanguages.slice(0, 2).map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => onStartProject(engine)}
              size="sm"
              data-testid={`button-start-project-${engine.id}`}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Project
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(engine.documentationUrl, '_blank')}
              data-testid={`button-docs-${engine.id}`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CustomEngineCard({ onCreateCustom }: { onCreateCustom: () => void }) {
  return (
    <Card className="custom-engine-card p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200" data-testid="card-custom-engine">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Custom Engine</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use your own game engine or framework. Perfect for custom setups, web frameworks, or specialized tools.
          </p>
          
          <Button onClick={onCreateCustom} variant="outline" data-testid="button-create-custom">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Project
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface GameEnginesPageProps {
  sidebarCollapsed?: boolean;
}

export default function GameEnginesPage({ sidebarCollapsed = false }: GameEnginesPageProps) {
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null);
  const [customProjectName, setCustomProjectName] = useState("");
  const [customEngineType, setCustomEngineType] = useState("");
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const { toast } = useToast();

  const handleStartProject = (engine: GameEngine) => {
    setSelectedEngine(engine);
    setShowProjectDialog(true);
  };

  const handleCreateProject = (templateType: string) => {
    if (selectedEngine) {
      toast({ 
        title: `${selectedEngine.name} project created!`, 
        description: `Started ${templateType} project with ${selectedEngine.name}` 
      });
      setShowProjectDialog(false);
      setSelectedEngine(null);
    }
  };

  const handleCreateCustomProject = () => {
    if (!customProjectName.trim()) {
      toast({ title: "Please enter a project name", variant: "destructive" });
      return;
    }
    
    toast({ 
      title: "Custom project created!", 
      description: `Started ${customProjectName} with ${customEngineType || 'custom setup'}` 
    });
    setShowCustomDialog(false);
    setCustomProjectName("");
    setCustomEngineType("");
  };

  const sortedEngines = [...GAME_ENGINES].sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return b.popularity - a.popularity;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-game-engines-title">
            Game Engines
          </h1>
          <p className="text-muted-foreground" data-testid="text-game-engines-subtitle">
            Choose from popular game engines or configure custom setups to start your publishing journey
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Supported Engines */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Supported Game Engines</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start your project with industry-standard game engines
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="grid-game-engines">
                {sortedEngines.map((engine) => (
                  <GameEngineCard 
                    key={engine.id} 
                    engine={engine} 
                    onStartProject={handleStartProject}
                  />
                ))}
              </div>
            </div>

            {/* Custom Engine */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Custom Setup</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use your own engine or framework for specialized projects
                </p>
              </div>
              
              <div className="max-w-md">
                <CustomEngineCard onCreateCustom={() => setShowCustomDialog(true)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Creation Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent data-testid="dialog-create-project">
          <DialogHeader>
            <DialogTitle>Start {selectedEngine?.name} Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a template to get started with {selectedEngine?.name}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {selectedEngine?.templateProjects.map((template) => (
                <Button 
                  key={template}
                  variant="outline"
                  onClick={() => handleCreateProject(template)}
                  className="h-auto p-4 text-left justify-start"
                  data-testid={`button-template-${template.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div>
                    <Code className="w-5 h-5 mb-2" />
                    <div className="font-medium">{template}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Project Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent data-testid="dialog-custom-project">
          <DialogHeader>
            <DialogTitle>Create Custom Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="Enter project name..."
                value={customProjectName}
                onChange={(e) => setCustomProjectName(e.target.value)}
                data-testid="input-custom-project-name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Engine/Framework (Optional)</label>
              <Select value={customEngineType} onValueChange={setCustomEngineType}>
                <SelectTrigger data-testid="select-custom-engine-type">
                  <SelectValue placeholder="Select engine type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript/HTML5</SelectItem>
                  <SelectItem value="typescript">TypeScript/React</SelectItem>
                  <SelectItem value="python">Python (Pygame)</SelectItem>
                  <SelectItem value="cpp">C++/SDL</SelectItem>
                  <SelectItem value="csharp">C# (.NET)</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="rust">Rust (Bevy/ggez)</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="swift">Swift (iOS)</SelectItem>
                  <SelectItem value="kotlin">Kotlin (Android)</SelectItem>
                  <SelectItem value="flutter">Flutter/Dart</SelectItem>
                  <SelectItem value="react-native">React Native</SelectItem>
                  <SelectItem value="other">Other Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCustomDialog(false)}
                data-testid="button-cancel-custom"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCustomProject}
                data-testid="button-create-custom-project"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}