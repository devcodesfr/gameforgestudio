import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Rocket, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Gamepad2,
  Smartphone,
  Globe,
  Monitor,
  Package,
  GitBranch,
  Calendar,
  ExternalLink,
  Plus,
  Upload as UploadIcon,
  FileText,
  Target,
  Users,
  Zap
} from 'lucide-react';
import { SiItchdotio, SiGoogleplay, SiApple, SiEpicgames } from 'react-icons/si';
import steamLogo from "@assets/image_1758782591979.png";

// Steam icon component for consistency with other icons
const SteamIcon = ({ className }: { className?: string }) => (
  <img src={steamLogo} alt="Steam" className={`object-contain ${className}`} />
);

interface DistributionPageProps {
  sidebarCollapsed?: boolean;
}

// Mock data for platforms and releases
const PLATFORMS = [
  { id: 'steam', name: 'Steam', icon: SteamIcon, status: 'not-connected', color: 'bg-blue-600' },
  { id: 'epic', name: 'Epic Games', icon: SiEpicgames, status: 'not-connected', color: 'bg-gray-800' },
  { id: 'itch', name: 'itch.io', icon: SiItchdotio, status: 'not-connected', color: 'bg-red-500' },
  { id: 'web', name: 'Web Deploy', icon: Globe, status: 'not-connected', color: 'bg-green-600' },
  { id: 'android', name: 'Google Play', icon: SiGoogleplay, status: 'not-connected', color: 'bg-green-500' },
  { id: 'ios', name: 'App Store', icon: SiApple, status: 'not-connected', color: 'bg-gray-700' },
];

const RELEASES = [
  { id: '1', version: '1.2.3', channel: 'production', status: 'live', date: '2024-01-15', platforms: ['steam', 'web'] },
  { id: '2', version: '1.2.4-beta', channel: 'beta', status: 'testing', date: '2024-01-20', platforms: ['web'] },
  { id: '3', version: '1.3.0', channel: 'alpha', status: 'building', date: '2024-01-22', platforms: ['steam', 'web'] },
];

export default function DistributionPage({ sidebarCollapsed = false }: DistributionPageProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [showNewReleaseDialog, setShowNewReleaseDialog] = useState(false);
  const [releaseForm, setReleaseForm] = useState({
    version: '',
    channel: 'production',
    releaseNotes: '',
    platforms: [] as string[],
    buildType: 'automatic',
    scheduleType: 'immediate',
    scheduledDate: '',
    rolloutType: 'full'
  });
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500 text-white';
      case 'testing': return 'bg-yellow-500 text-white';
      case 'building': return 'bg-blue-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return CheckCircle;
      case 'testing': return Clock;
      case 'building': return Settings;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-distribution-title">
                Distribution
              </h1>
              <p className="text-muted-foreground" data-testid="text-distribution-subtitle">
                Publish and deploy your games across multiple platforms
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              data-testid="button-new-release"
              onClick={() => setShowNewReleaseDialog(true)}
            >
              <Rocket className="w-4 h-4 mr-2" />
              New Release
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <Tabs defaultValue="platforms" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platforms" data-testid="tab-platforms">Platforms</TabsTrigger>
              <TabsTrigger value="releases" data-testid="tab-releases">Releases</TabsTrigger>
            </TabsList>

            {/* Platforms Tab */}
            <TabsContent value="platforms">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Platform Connections</h2>
                  <Button variant="outline" data-testid="button-connect-platform">
                    <Upload className="w-4 h-4 mr-2" />
                    Connect Platform
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-platforms">
                  {PLATFORMS.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <Card key={platform.id} className="p-6 hover:shadow-lg transition-all" data-testid={`card-platform-${platform.id}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {platform.id === 'steam' ? (
                              <IconComponent className="h-10" />
                            ) : (
                              <div className={`p-2 rounded-lg ${platform.color}`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold">{platform.name}</h3>
                              <Badge 
                                className={platform.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                data-testid={`status-${platform.id}`}
                              >
                                {platform.status === 'connected' ? 'Connected' : 'Not Connected'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {platform.status === 'connected' ? (
                            <>
                              <Button variant="outline" size="sm" className="w-full" data-testid={`button-manage-${platform.id}`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
                              </Button>
                              <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-store-${platform.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Store Page
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="w-full" data-testid={`button-connect-${platform.id}`}>
                              Connect {platform.name}
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Releases Tab */}
            <TabsContent value="releases">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Live Project Management</h2>
                  <div className="flex items-center space-x-4">
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Channels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="alpha">Alpha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Age Ratings Section */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Age Ratings & Compliance</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">ESRB Rating</span>
                        <Badge variant="outline">E for Everyone</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">PEGI Rating</span>
                        <Badge variant="outline">3</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">CERO Rating</span>
                        <Badge variant="outline">A (All Ages)</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">USK Rating</span>
                        <Badge variant="outline">0</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-update-ratings">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Age Ratings
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Live Releases */}
                <div className="space-y-4" data-testid="list-releases">
                  {RELEASES.map((release) => {
                    const StatusIcon = getStatusIcon(release.status);
                    return (
                      <Card key={release.id} className="p-6" data-testid={`card-release-${release.id}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="w-5 h-5" />
                              <div>
                                <h3 className="font-semibold text-lg">{release.version}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" data-testid={`badge-channel-${release.id}`}>
                                    {release.channel}
                                  </Badge>
                                  <Badge className={getStatusColor(release.status)} data-testid={`badge-status-${release.id}`}>
                                    {release.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Released</p>
                              <p className="font-medium">{release.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {release.platforms.map(platformId => {
                                const platform = PLATFORMS.find(p => p.id === platformId);
                                if (!platform) return null;
                                const IconComponent = platform.icon;
                                return platformId === 'steam' ? (
                                  <IconComponent key={platformId} className="h-6" />
                                ) : (
                                  <div key={platformId} className={`p-1 rounded ${platform.color}`}>
                                    <IconComponent className="w-4 h-4 text-white" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Live Management Actions */}
                        {release.status === 'live' && (
                          <div className="flex items-center space-x-3 pt-3 border-t border-border">
                            <Button variant="outline" size="sm" data-testid={`button-update-release-${release.id}`}>
                              <Settings className="w-4 h-4 mr-2" />
                              Update Release
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-hotfix-${release.id}`}>
                              <Zap className="w-4 h-4 mr-2" />
                              Deploy Hotfix
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-rollback-${release.id}`}>
                              <GitBranch className="w-4 h-4 mr-2" />
                              Rollback
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-view-details-${release.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* New Release Dialog */}
      <Dialog open={showNewReleaseDialog} onOpenChange={setShowNewReleaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-new-release">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Create New Release</span>
            </DialogTitle>
            <DialogDescription>
              Configure and deploy your game across multiple platforms with version management and build automation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Release Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Release Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version Number</Label>
                  <Input
                    id="version"
                    placeholder="e.g., 1.3.0, 2.0.0-beta"
                    value={releaseForm.version}
                    onChange={(e) => setReleaseForm(prev => ({ ...prev, version: e.target.value }))}
                    data-testid="input-version"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="channel">Release Channel</Label>
                  <Select 
                    value={releaseForm.channel} 
                    onValueChange={(value) => setReleaseForm(prev => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger data-testid="select-channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="alpha">Alpha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="release-notes">Release Notes</Label>
                <Textarea
                  id="release-notes"
                  placeholder="Describe what's new in this release..."
                  value={releaseForm.releaseNotes}
                  onChange={(e) => setReleaseForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
                  rows={4}
                  data-testid="textarea-release-notes"
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Platform Deployment</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon;
                  const isSelected = releaseForm.platforms.includes(platform.id);
                  return (
                    <div 
                      key={platform.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setReleaseForm(prev => ({
                          ...prev,
                          platforms: isSelected 
                            ? prev.platforms.filter(p => p !== platform.id)
                            : [...prev.platforms, platform.id]
                        }));
                      }}
                      data-testid={`platform-select-${platform.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox checked={isSelected} />
                        {platform.id === 'steam' ? (
                          <IconComponent className="h-9" />
                        ) : (
                          <div className={`p-2 rounded ${platform.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {platform.status === 'connected' ? 'Ready to deploy' : 'Setup required'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform-Specific Configuration */}
            {releaseForm.platforms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Platform Configuration</span>
                </h3>
                
                <div className="space-y-4">
                  {releaseForm.platforms.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    if (!platform) return null;
                    const IconComponent = platform.icon;
                    
                    return (
                      <Card key={platformId} className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          {platform.id === 'steam' ? (
                            <IconComponent className="h-9" />
                          ) : (
                            <div className={`p-2 rounded ${platform.color}`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <h4 className="font-semibold">{platform.name} Configuration</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Build Target</Label>
                            <Select defaultValue="release">
                              <SelectTrigger data-testid={`select-build-target-${platformId}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="release">Release Build</SelectItem>
                                <SelectItem value="debug">Debug Build</SelectItem>
                                <SelectItem value="optimized">Optimized Build</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Package Format</Label>
                            <Select defaultValue={platformId === 'steam' ? 'steam-package' : platformId === 'web' ? 'web-bundle' : 'standard'}>
                              <SelectTrigger data-testid={`select-package-format-${platformId}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {platformId === 'steam' && (
                                  <>
                                    <SelectItem value="steam-package">Steam Package</SelectItem>
                                    <SelectItem value="standalone">Standalone Executable</SelectItem>
                                  </>
                                )}
                                {platformId === 'web' && (
                                  <>
                                    <SelectItem value="web-bundle">Web Bundle</SelectItem>
                                    <SelectItem value="pwa">Progressive Web App</SelectItem>
                                  </>
                                )}
                                {(platformId === 'android' || platformId === 'ios') && (
                                  <>
                                    <SelectItem value="standard">Standard Package</SelectItem>
                                    <SelectItem value="universal">Universal Binary</SelectItem>
                                  </>
                                )}
                                {platformId === 'itch' && (
                                  <>
                                    <SelectItem value="standard">Standard Build</SelectItem>
                                    <SelectItem value="html5">HTML5 Game</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {platformId === 'steam' && (
                            <div className="space-y-2 md:col-span-2">
                              <Label>Steam Configuration</Label>
                              <div className="flex items-center space-x-2">
                                <Checkbox data-testid={`checkbox-steam-achievements-${platformId}`} />
                                <Label className="text-sm">Enable Steam Achievements</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox data-testid={`checkbox-steam-workshop-${platformId}`} />
                                <Label className="text-sm">Enable Steam Workshop</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox data-testid={`checkbox-steam-cloud-${platformId}`} />
                                <Label className="text-sm">Enable Steam Cloud Saves</Label>
                              </div>
                            </div>
                          )}
                          
                          {(platformId === 'android' || platformId === 'ios') && (
                            <div className="space-y-2 md:col-span-2">
                              <Label>Mobile Configuration</Label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Minimum OS Version</Label>
                                  <Input 
                                    placeholder={platformId === 'android' ? "API Level 21" : "iOS 12.0"}
                                    data-testid={`input-min-os-${platformId}`}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Target Architecture</Label>
                                  <Select defaultValue="universal">
                                    <SelectTrigger data-testid={`select-architecture-${platformId}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="universal">Universal</SelectItem>
                                      <SelectItem value="arm64">ARM64</SelectItem>
                                      <SelectItem value="x86_64">x86_64</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {platformId === 'web' && (
                            <div className="space-y-2 md:col-span-2">
                              <Label>Web Configuration</Label>
                              <div className="flex items-center space-x-2">
                                <Checkbox data-testid={`checkbox-web-offline-${platformId}`} />
                                <Label className="text-sm">Enable Offline Mode</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox data-testid={`checkbox-web-compression-${platformId}`} />
                                <Label className="text-sm">Enable Asset Compression</Label>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Build Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Build Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Build Type</Label>
                  <Select 
                    value={releaseForm.buildType} 
                    onValueChange={(value) => setReleaseForm(prev => ({ ...prev, buildType: value }))}
                  >
                    <SelectTrigger data-testid="select-build-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic Build</SelectItem>
                      <SelectItem value="manual">Manual Upload</SelectItem>
                      <SelectItem value="existing">Use Existing Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rollout Strategy</Label>
                  <Select 
                    value={releaseForm.rolloutType} 
                    onValueChange={(value) => setReleaseForm(prev => ({ ...prev, rolloutType: value }))}
                  >
                    <SelectTrigger data-testid="select-rollout-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Release</SelectItem>
                      <SelectItem value="staged">Staged Rollout</SelectItem>
                      <SelectItem value="beta-test">Beta Test Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Release Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Release Scheduling</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={releaseForm.scheduleType === 'immediate'}
                    onCheckedChange={(checked) => 
                      checked && setReleaseForm(prev => ({ ...prev, scheduleType: 'immediate' }))
                    }
                    data-testid="checkbox-immediate"
                  />
                  <div>
                    <Label>Release Immediately</Label>
                    <p className="text-sm text-muted-foreground">Deploy as soon as builds are ready</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={releaseForm.scheduleType === 'scheduled'}
                    onCheckedChange={(checked) => 
                      checked && setReleaseForm(prev => ({ ...prev, scheduleType: 'scheduled' }))
                    }
                    data-testid="checkbox-scheduled"
                  />
                  <div className="flex-1">
                    <Label>Schedule for Later</Label>
                    <p className="text-sm text-muted-foreground">Set a specific date and time</p>
                    {releaseForm.scheduleType === 'scheduled' && (
                      <div className="mt-2">
                        <Input
                          type="datetime-local"
                          value={releaseForm.scheduledDate}
                          onChange={(e) => setReleaseForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          data-testid="input-scheduled-date"
                          className={
                            releaseForm.scheduleType === 'scheduled' && !releaseForm.scheduledDate
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }
                        />
                        {releaseForm.scheduleType === 'scheduled' && !releaseForm.scheduledDate && (
                          <p className="text-sm text-red-500 mt-1">
                            Please select a date and time for the scheduled release
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewReleaseDialog(false)}
              data-testid="button-cancel-release"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Handle release creation
                toast({
                  title: "Release Created!",
                  description: `Version ${releaseForm.version} is now being prepared for deployment to ${releaseForm.platforms.length} platform(s).`
                });
                setShowNewReleaseDialog(false);
                // Reset form
                setReleaseForm({
                  version: '',
                  channel: 'production',
                  releaseNotes: '',
                  platforms: [],
                  buildType: 'automatic',
                  scheduleType: 'immediate',
                  scheduledDate: '',
                  rolloutType: 'full'
                });
              }}
              disabled={
                !releaseForm.version || 
                releaseForm.platforms.length === 0 ||
                (releaseForm.scheduleType === 'scheduled' && !releaseForm.scheduledDate)
              }
              data-testid="button-create-release"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Create Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}