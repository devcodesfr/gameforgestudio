import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Activity,
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsPageProps {
  sidebarCollapsed?: boolean;
}

// Mock analytics data with time-based filtering
const generateAnalyticsData = (timeRange: string) => {
  const baseMetrics = {
    '24h': {
      totalPlayers: 892,
      activeToday: 892,
      revenue: 2450,
      avgSessionTime: '18m 12s',
      retentionRate: 68.5,
      crashRate: 0.05,
    },
    '7d': {
      totalPlayers: 4250,
      activeToday: 892,
      revenue: 12800,
      avgSessionTime: '20m 34s',
      retentionRate: 72.8,
      crashRate: 0.035,
    },
    '30d': {
      totalPlayers: 15420,
      activeToday: 892,
      revenue: 47300,
      avgSessionTime: '22m 18s',
      retentionRate: 76.2,
      crashRate: 0.02,
    },
    '90d': {
      totalPlayers: 38900,
      activeToday: 892,
      revenue: 128600,
      avgSessionTime: '24m 45s',
      retentionRate: 79.3,
      crashRate: 0.01,
    },
  };

  const playerDataSets = {
    '24h': [
      { date: 'Jan 23, 12:00', players: 120, sessions: 180, revenue: 450 },
      { date: 'Jan 23, 15:00', players: 156, sessions: 234, revenue: 680 },
      { date: 'Jan 23, 18:00', players: 234, sessions: 356, revenue: 890 },
      { date: 'Jan 23, 21:00', players: 198, sessions: 298, revenue: 720 },
      { date: 'Jan 24, 00:00', players: 89, sessions: 134, revenue: 320 },
      { date: 'Jan 24, 03:00', players: 45, sessions: 68, revenue: 180 },
      { date: 'Jan 24, 06:00', players: 78, sessions: 118, revenue: 290 },
    ],
    '7d': [
      { date: '2024-01-15', players: 450, sessions: 680, revenue: 1250 },
      { date: '2024-01-16', players: 520, sessions: 750, revenue: 1680 },
      { date: '2024-01-17', players: 480, sessions: 690, revenue: 1420 },
      { date: '2024-01-18', players: 610, sessions: 890, revenue: 2100 },
      { date: '2024-01-19', players: 580, sessions: 820, revenue: 1850 },
      { date: '2024-01-20', players: 720, sessions: 1050, revenue: 2450 },
      { date: '2024-01-21', players: 680, sessions: 980, revenue: 2200 },
    ],
    '30d': Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      players: Math.floor(Math.random() * 400) + 300,
      sessions: Math.floor(Math.random() * 600) + 400,
      revenue: Math.floor(Math.random() * 1500) + 800,
    })),
    '90d': Array.from({ length: 90 }, (_, i) => ({
      date: `2023-${Math.floor(i / 30) + 10}-${String((i % 30) + 1).padStart(2, '0')}`,
      players: Math.floor(Math.random() * 500) + 250,
      sessions: Math.floor(Math.random() * 750) + 350,
      revenue: Math.floor(Math.random() * 2000) + 600,
    })),
  };

  return {
    metrics: baseMetrics[timeRange as keyof typeof baseMetrics],
    playerData: playerDataSets[timeRange as keyof typeof playerDataSets],
  };
};

const PERFORMANCE_ISSUES = [
  { 
    id: '1', 
    type: 'crash', 
    message: 'Memory leak in Level 3', 
    severity: 'high', 
    count: 23,
    game: 'Mystic Adventure RPG',
    firstReported: '2024-01-15',
    lastOccurrence: '2024-01-21',
    affectedPlatforms: ['Windows', 'Steam Deck'],
    playerFeedback: [
      { player: 'GamerPro2024', message: 'Game crashes consistently when entering the crystal cave area. Lost my progress twice!', timestamp: '2024-01-21 14:30' },
      { player: 'RPGFan87', message: 'Memory usage spikes to 8GB then crashes. Only happens in Level 3.', timestamp: '2024-01-20 09:15' },
      { player: 'CasualPlayer', message: 'Crashed during boss fight. Very frustrating experience.', timestamp: '2024-01-19 16:22' }
    ],
    technicalDetails: 'Memory usage increases from 2GB to 8GB over 15 minutes in Level 3. Possible texture memory leak in crystal cave environment.'
  },
  { 
    id: '2', 
    type: 'performance', 
    message: 'Frame drops during boss fights', 
    severity: 'medium', 
    count: 156,
    game: 'Combat Arena Elite',
    firstReported: '2024-01-10',
    lastOccurrence: '2024-01-21',
    affectedPlatforms: ['Windows', 'macOS', 'Linux'],
    playerFeedback: [
      { player: 'CompetitiveGamer', message: 'FPS drops to 30 during final boss phase. Really affects gameplay in ranked matches.', timestamp: '2024-01-21 20:45' },
      { player: 'StreamerDude', message: 'My viewers can see the stuttering during boss fights. Makes my streams look bad.', timestamp: '2024-01-20 15:30' },
      { player: 'HardcorePlayer', message: 'Performance is fine until bosses spawn particle effects. Then it gets choppy.', timestamp: '2024-01-18 11:20' }
    ],
    technicalDetails: 'Particle system optimization needed. Boss ability effects cause CPU spikes and reduce framerate by 40-60%.'
  },
  { 
    id: '3', 
    type: 'bug', 
    message: 'Save system occasionally fails', 
    severity: 'high', 
    count: 8,
    game: 'Kingdom Builder Saga',
    firstReported: '2024-01-12',
    lastOccurrence: '2024-01-20',
    affectedPlatforms: ['iOS', 'Android'],
    playerFeedback: [
      { player: 'MobileGamer2024', message: 'Lost 3 hours of progress! Save button worked but progress wasn\'t actually saved.', timestamp: '2024-01-20 12:00' },
      { player: 'PhonePlayer', message: 'Happens when switching apps during save. Very annoying bug.', timestamp: '2024-01-18 14:15' },
      { player: 'TabletUser', message: 'Kingdom disappeared after game crashed during auto-save. Please fix this!', timestamp: '2024-01-17 10:30' }
    ],
    technicalDetails: 'Save corruption occurs when app is interrupted during write operation. Need to implement atomic save transactions.'
  },
  { 
    id: '4', 
    type: 'performance', 
    message: 'Slow loading on mobile devices', 
    severity: 'low', 
    count: 89,
    game: 'Puzzle Quest Mobile',
    firstReported: '2024-01-08',
    lastOccurrence: '2024-01-21',
    affectedPlatforms: ['iOS', 'Android'],
    playerFeedback: [
      { player: 'CommutingGamer', message: 'Takes forever to load levels. I only have short breaks at work.', timestamp: '2024-01-21 08:30' },
      { player: 'PuzzleFan', message: 'Loading times are about 30 seconds on my older phone. Could be faster.', timestamp: '2024-01-19 19:45' },
      { player: 'CasualPuzzler', message: 'Not a huge issue but definitely slower than other puzzle games I play.', timestamp: '2024-01-16 13:20' }
    ],
    technicalDetails: 'Asset compression and level streaming optimization needed. Current level files are not optimized for mobile bandwidth.'
  },
];

export default function AnalyticsPage({ sidebarCollapsed = false }: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // Get filtered data based on selected time range
  const { metrics, playerData } = generateAnalyticsData(timeRange);

  const handleViewIssueDetails = (issue: any) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'crash': return AlertCircle;
      case 'performance': return Zap;
      case 'bug': return RefreshCw;
      default: return AlertCircle;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-analytics-title">
                Analytics
              </h1>
              <p className="text-muted-foreground" data-testid="text-analytics-subtitle">
                Track performance and understand player behavior across your games
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32" data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" data-testid="button-export-data">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8" data-testid="grid-metrics">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                  <p className="text-2xl font-bold" data-testid="metric-total-players">{formatNumber(metrics.totalPlayers)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold" data-testid="metric-active-today">{formatNumber(metrics.activeToday)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold" data-testid="metric-revenue">{formatCurrency(metrics.revenue)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session</p>
                  <p className="text-2xl font-bold" data-testid="metric-session-time">{metrics.avgSessionTime}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retention</p>
                  <p className="text-2xl font-bold" data-testid="metric-retention">{metrics.retentionRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crash Rate</p>
                  <p className="text-2xl font-bold" data-testid="metric-crash-rate">{metrics.crashRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="player-analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="player-analytics" data-testid="tab-player-analytics">Player Analytics</TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
              <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
              <TabsTrigger value="behavior" data-testid="tab-behavior">Behavior</TabsTrigger>
            </TabsList>

            {/* Player Analytics Tab */}
            <TabsContent value="player-analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Daily Active Players</span>
                  </h3>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={playerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          tickFormatter={(value) => value.split(' ')[0].split('-').slice(-1)[0] || value.split(', ')[1] || value}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          formatter={(value) => [`${formatNumber(Number(value))} players`, 'Active Players']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="players" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Player Demographics</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>New Players</span>
                      <Badge className="bg-green-100 text-green-800">+12% this week</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Returning Players</span>
                      <Badge className="bg-blue-100 text-blue-800">68.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Age</span>
                      <span className="font-medium">28.5 years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Top Region</span>
                      <span className="font-medium">North America (45%)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <div className="space-y-6">
                {/* Performance Charts Row */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Performance Metrics</span>
                  </h3>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'FPS', value: 58.2, fill: '#22c55e' },
                        { name: 'Memory (GB)', value: 2.1, fill: '#eab308' },
                        { name: 'Load Time (s)', value: 4.2, fill: '#3b82f6' },
                        { name: 'CPU Usage (%)', value: 45.3, fill: '#f97316' },
                        { name: 'GPU Usage (%)', value: 72.8, fill: '#8b5cf6' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}`, name]} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">System Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Average FPS</span>
                        <span className="font-medium text-green-600">58.2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Memory Usage</span>
                        <span className="font-medium text-yellow-600">2.1 GB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Loading Time</span>
                        <span className="font-medium text-blue-600">4.2s</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Error Tracking</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Total Errors</span>
                        <span className="font-medium text-red-600">276</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Critical Issues</span>
                        <span className="font-medium text-red-600">31</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Resolution Rate</span>
                        <span className="font-medium text-green-600">87%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Platform Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Windows</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mobile</span>
                        <span className="font-medium">24%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Web</span>
                        <span className="font-medium">8%</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent Issues</h3>
                  <div className="space-y-4" data-testid="list-performance-issues">
                    {PERFORMANCE_ISSUES.map((issue) => {
                      const IconComponent = getIssueIcon(issue.type);
                      return (
                        <div key={issue.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`issue-${issue.id}`}>
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {issue.count} occurrences
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewIssueDetails(issue)}
                              data-testid={`button-view-details-${issue.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue">
              <div className="space-y-6">
                {/* Revenue Trends Chart */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Revenue Trends</span>
                  </h3>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={playerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          tickFormatter={(value) => value.split(' ')[0].split('-').slice(-1)[0] || value.split(', ')[1] || value}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          formatter={(value) => [`${formatCurrency(Number(value))}`, 'Revenue']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#22c55e" 
                          fill="#22c55e" 
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Revenue Breakdown</span>
                    </h3>
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Revenue']} />
                          <Pie 
                            data={[
                              { name: 'In-App Purchases', value: 18450 },
                              { name: 'Game Sales', value: 4200 },
                              { name: 'DLC Sales', value: 1930 }
                            ]}
                            dataKey="value" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={60}
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#22c55e" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>In-App Purchases</span>
                        </div>
                        <span className="font-medium">{formatCurrency(18450)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Game Sales</span>
                        </div>
                        <span className="font-medium">{formatCurrency(4200)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>DLC Sales</span>
                        </div>
                        <span className="font-medium">{formatCurrency(1930)}</span>
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(metrics.revenue)}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Daily Revenue Summary</h3>
                    <div className="space-y-4">
                      {playerData.slice(-5).map((day) => (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{day.date}</span>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">{formatCurrency(day.revenue)}</span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(day.revenue / 2500) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior">
              <div className="space-y-6">
                {/* Engagement Metrics Chart */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Feature Engagement Overview</span>
                  </h3>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { name: 'Main Game', engagement: 92, fill: '#22c55e' },
                          { name: 'Social Features', engagement: 67, fill: '#3b82f6' },
                          { name: 'Shop/Store', engagement: 45, fill: '#f59e0b' },
                          { name: 'Settings', engagement: 23, fill: '#6b7280' }
                        ]} 
                        layout="horizontal"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]} 
                          fontSize={12}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          fontSize={12}
                          width={80}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Engagement']}
                          labelStyle={{ color: '#000' }}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                        />
                        <Bar 
                          dataKey="engagement" 
                          radius={[0, 4, 4, 0]}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#6b7280" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Player Journey</h3>
                    <div className="space-y-6">
                    {/* Play Time Metrics */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Average Play Time</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>First Session</span>
                          <span className="font-medium text-green-600">12m 30s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>First Week</span>
                          <span className="font-medium text-green-600">2h 45m</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>First Month</span>
                          <span className="font-medium text-blue-600">8h 20m</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Long-term Players</span>
                          <span className="font-medium text-purple-600">24h 15m</span>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Behavior by Platform */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Purchase Price per Platform</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Steam</span>
                          </div>
                          <span className="font-medium">$18.60 avg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Mobile</span>
                          </div>
                          <span className="font-medium">$6.20 avg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Web</span>
                          </div>
                          <span className="font-medium">$3.80 avg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>Console</span>
                          </div>
                          <span className="font-medium">$24.50 avg</span>
                        </div>
                      </div>
                    </div>

                    {/* Journey Milestones */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Journey Milestones</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>First Purchase Rate</span>
                          <span className="font-medium text-green-600">23.4%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>30-Day Retention</span>
                          <span className="font-medium text-blue-600">45.2%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Becomes Loyal Player</span>
                          <span className="font-medium text-purple-600">18.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Engagement Metrics</h3>
                  <div className="space-y-6">
                    {/* Session Patterns */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Session Patterns</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Daily Sessions</span>
                          <span className="font-medium text-blue-600">2.8 avg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Session Duration</span>
                          <span className="font-medium text-green-600">22m 18s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Time Between Sessions</span>
                          <span className="font-medium text-purple-600">6.5 hours</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Peak Play Time</span>
                          <span className="font-medium text-orange-600">7-9 PM</span>
                        </div>
                      </div>
                    </div>

                    {/* Feature Engagement */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Feature Engagement</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Main Game Loop</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <span className="text-sm font-medium">92%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Social Features</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '67%' }}></div>
                            </div>
                            <span className="text-sm font-medium">67%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Shop/Store</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <span className="text-sm font-medium">45%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Settings/Options</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gray-500 rounded-full" style={{ width: '23%' }}></div>
                            </div>
                            <span className="text-sm font-medium">23%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Heatmap */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground">User Interaction Heatmap</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Toggle heatmap view
                            const heatmapContainer = document.getElementById('heatmap-container');
                            if (heatmapContainer) {
                              heatmapContainer.style.display = heatmapContainer.style.display === 'none' ? 'block' : 'none';
                            }
                          }}
                          data-testid="button-view-heatmap"
                        >
                          View Heatmap
                        </Button>
                      </div>
                      <div id="heatmap-container" style={{ display: 'none' }} className="mt-4">
                        <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-muted-foreground/30">
                          <div className="grid grid-cols-8 gap-1 mb-3">
                            {Array.from({ length: 64 }, (_, i) => {
                              // Create realistic user interaction patterns
                              const row = Math.floor(i / 8);
                              const col = i % 8;
                              
                              // Hot spots for typical UI interactions
                              let intensity = 0.1; // base low activity
                              
                              // Top row (navigation/menu area) - high activity
                              if (row === 0) intensity = 0.7 + (Math.random() * 0.2);
                              
                              // Left and right edges (sidebar/toolbars) - medium activity
                              else if (col === 0 || col === 7) intensity = 0.4 + (Math.random() * 0.3);
                              
                              // Center area (main content) - variable activity
                              else if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
                                intensity = 0.3 + (Math.random() * 0.4);
                              }
                              
                              // Bottom right (action buttons area) - high activity
                              else if (row >= 6 && col >= 6) intensity = 0.6 + (Math.random() * 0.3);
                              
                              // Add some randomness but keep patterns
                              intensity = Math.min(0.95, intensity + (Math.random() * 0.1));
                              
                              const color = intensity > 0.7 ? 'bg-red-500' : 
                                           intensity > 0.4 ? 'bg-yellow-500' : 
                                           intensity > 0.2 ? 'bg-green-500' : 'bg-blue-200';
                              
                              const opacityLevel = Math.floor(intensity * 8) + 2;
                              const clampedOpacity = Math.min(10, Math.max(2, opacityLevel));
                              
                              return (
                                <div 
                                  key={i} 
                                  className={`h-4 w-4 rounded-sm ${color} opacity-${clampedOpacity}0`}
                                  title={`Interaction: ${(intensity * 100).toFixed(1)}% | Position: ${row},${col}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Low Activity</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            </div>
                            <span>High Activity</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Visual representation of user interaction patterns across game interface
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Issue Details Modal */}
      <Dialog open={showIssueModal} onOpenChange={setShowIssueModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-issue-details">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedIssue && (
                <>
                  {(() => {
                    const IconComponent = getIssueIcon(selectedIssue.type);
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  <span>{selectedIssue.message}</span>
                  <Badge className={getSeverityColor(selectedIssue.severity)}>
                    {selectedIssue.severity}
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedIssue && `${selectedIssue.count} occurrences reported in ${selectedIssue.game}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-6">
              {/* Issue Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Issue Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Game:</strong> {selectedIssue.game}</div>
                    <div><strong>Type:</strong> {selectedIssue.type}</div>
                    <div><strong>First Reported:</strong> {selectedIssue.firstReported}</div>
                    <div><strong>Last Occurrence:</strong> {selectedIssue.lastOccurrence}</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Affected Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.affectedPlatforms.map((platform: string) => (
                      <Badge key={platform} variant="outline">{platform}</Badge>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Technical Details */}
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Technical Analysis</h4>
                <p className="text-sm text-muted-foreground">{selectedIssue.technicalDetails}</p>
              </Card>

              {/* Player Feedback */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Player Feedback ({selectedIssue.playerFeedback.length} reports)</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedIssue.playerFeedback.map((feedback: any, index: number) => (
                    <div key={index} className="border border-border rounded-lg p-3 bg-muted/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{feedback.player}</span>
                        <span className="text-xs text-muted-foreground">{feedback.timestamp}</span>
                      </div>
                      <p className="text-sm">{feedback.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}