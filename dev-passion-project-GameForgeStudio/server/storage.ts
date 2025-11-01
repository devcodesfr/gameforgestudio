import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject, 
  type Metrics, 
  type InsertMetrics,
  type Asset,
  type InsertAsset,
  type AssetBundle,
  type InsertAssetBundle,
  type CartItem,
  type InsertCartItem,
  type Purchase,
  type InsertPurchase,
  type GameLibrary,
  type InsertGameLibrary,
  type Chat,
  type InsertChat,
  type ChatMember,
  type InsertChatMember,
  type Message,
  type InsertMessage,
  ProjectStatus, 
  GameEngine, 
  Platform,
  AssetCategory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Metrics operations
  getMetricsByUserId(userId: string): Promise<Metrics | undefined>;
  updateMetrics(userId: string, metrics: Partial<InsertMetrics>): Promise<Metrics>;

  // Asset Store operations
  getAllAssets(): Promise<Asset[]>;
  getAssetsByCategory(category: string): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  
  getAllBundles(): Promise<AssetBundle[]>;
  getBundle(id: string): Promise<AssetBundle | undefined>;
  createBundle(bundle: InsertAssetBundle): Promise<AssetBundle>;
  
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: string, itemId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;

  // Game Library operations
  getGameLibraryByUserId(userId: string): Promise<GameLibrary[]>;
  addToGameLibrary(item: InsertGameLibrary): Promise<GameLibrary>;

  // Buttonz Chat operations
  getAllChats(): Promise<Chat[]>;
  getChat(id: string): Promise<Chat | undefined>;
  getChatsByUserId(userId: string): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: string, updates: Partial<Chat>): Promise<Chat | undefined>;
  deleteChat(id: string): Promise<boolean>;

  getChatMembers(chatId: string): Promise<ChatMember[]>;
  addChatMember(chatMember: InsertChatMember): Promise<ChatMember>;
  removeChatMember(chatId: string, userId: string): Promise<boolean>;
  getUserChats(userId: string): Promise<Chat[]>;

  getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, content: string): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private metrics: Map<string, Metrics>;
  private assets: Map<string, Asset>;
  private bundles: Map<string, AssetBundle>;
  private cartItems: Map<string, CartItem>;
  private purchases: Map<string, Purchase>;
  private gameLibrary: Map<string, GameLibrary>;
  private chats: Map<string, Chat>;
  private chatMembers: Map<string, ChatMember>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.metrics = new Map();
    this.assets = new Map();
    this.bundles = new Map();
    this.cartItems = new Map();
    this.purchases = new Map();
    this.gameLibrary = new Map();
    this.chats = new Map();
    this.chatMembers = new Map();
    this.messages = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user with profile data
    const defaultUser: User = {
      id: "user-1",
      username: "alex.rodriguez",
      password: "hashed_password",
      email: "alex@gameforge.com",
      displayName: "Alex Rodriguez",
      role: "Lead Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300",
      bio: "Lead Developer with 8+ years experience in game development. Specializes in Unity and Unreal Engine.",
      jobTitle: "Lead Game Developer",
      status: "Working on new RPG project",
      location: "San Francisco, CA",
      portfolioLink: "https://alexrodriguez.dev",
      skills: ["Unity", "C#", "Game Architecture", "Team Leadership"],
      currentProject: "Crossy Road Clone",
      availability: "online",
      settings: {
        notifications: {
          projectUpdates: true,
          teamMessages: true,
          communityActivity: true,
        },
        privacy: {
          profileVisibility: "public",
          whoCanMessage: "everyone",
        },
      },
      createdAt: new Date("2024-01-15"),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create additional community users  
    const communityUser1: User = {
      id: "user-2",
      username: "sarah.chen",
      password: "hashed_password",
      email: "sarah@gameforge.com",
      displayName: "Sarah Chen",
      role: "Game Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      banner: null,
      bio: null,
      jobTitle: null,
      status: null,
      location: null,
      portfolioLink: null,
      skills: [],
      currentProject: null,
      availability: "online",
      settings: {
        notifications: {
          projectUpdates: true,
          teamMessages: true,
          communityActivity: true,
        },
        privacy: {
          profileVisibility: "public",
          whoCanMessage: "everyone",
        },
      },
      createdAt: new Date(),
    };
    this.users.set(communityUser1.id, communityUser1);

    const communityUser2: User = {
      id: "user-3",
      username: "james.wilson",
      password: "hashed_password",
      email: "james@gameforge.com",
      displayName: "James Wilson",
      role: "3D Artist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      banner: null,
      bio: null,
      jobTitle: null,
      status: null,
      location: null,
      portfolioLink: null,
      skills: [],
      currentProject: null,
      availability: "online",
      settings: {
        notifications: {
          projectUpdates: true,
          teamMessages: true,
          communityActivity: true,
        },
        privacy: {
          profileVisibility: "public",
          whoCanMessage: "everyone",
        },
      },
      createdAt: new Date(),
    };
    this.users.set(communityUser2.id, communityUser2);

    // Create sample projects
    const sampleProjects: Project[] = [
      {
        id: "proj-1",
        name: "Space Explorer VR",
        description: "An immersive VR experience exploring distant galaxies and alien worlds.",
        icon: "🚀",
        status: ProjectStatus.LIVE,
        engine: GameEngine.UNITY,
        platform: Platform.VR,
        ownerId: defaultUser.id,
        teamMembers: ["user-1", "user-2", "user-3"],
        features: ["Full VR support with hand tracking", "Procedurally generated planets", "Realistic space physics simulation", "Multiplayer exploration mode", "Dynamic weather systems"],
        screenshots: ["https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"],
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      },
      {
        id: "proj-2",
        name: "Fantasy Quest RPG",
        description: "Epic fantasy role-playing game with deep character customization and storyline.",
        icon: "⚔️",
        status: ProjectStatus.IN_PROGRESS,
        engine: GameEngine.UNREAL,
        platform: Platform.PC,
        ownerId: defaultUser.id,
        teamMembers: ["user-1", "user-4"],
        features: ["Character customization", "Open world exploration", "Dynamic quest system", "Skill trees", "Multiplayer co-op"],
        screenshots: [],
        lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      },
      {
        id: "proj-3",
        name: "Racing Championship",
        description: "High-speed racing game with realistic physics and multiplayer competitions.",
        icon: "🏎️",
        status: ProjectStatus.NOT_STARTED,
        engine: GameEngine.UNITY,
        platform: Platform.PC,
        ownerId: "user-2", // Owned by Sarah Chen (community project)
        teamMembers: ["user-2", "user-3"],
        features: ["Realistic physics", "Multiplayer racing", "Car customization", "Multiple tracks"],
        screenshots: [],
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "proj-4",
        name: "Puzzle Master 3D",
        description: "Mind-bending 3D puzzle game with innovative mechanics and beautiful visuals.",
        icon: "🧩",
        status: ProjectStatus.IN_PROGRESS,
        engine: GameEngine.GODOT,
        platform: Platform.MOBILE,
        ownerId: "user-3", // Owned by James Wilson (community project)
        teamMembers: ["user-3", "user-2", "user-1"],
        features: ["3D puzzle mechanics", "Physics-based gameplay", "Level editor", "Hint system"],
        screenshots: [],
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      },
      {
        id: "proj-5",
        name: "Cosmic Adventure",
        description: "Exploration game set in a vast universe with procedurally generated content.",
        icon: "🌟",
        status: ProjectStatus.LIVE,
        engine: GameEngine.HTML5,
        platform: Platform.WEB,
        ownerId: defaultUser.id,
        teamMembers: ["user-1", "user-3"],
        features: ["Procedural generation", "Space exploration", "Resource management", "Alien encounters"],
        screenshots: [],
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      },
      {
        id: "proj-6",
        name: "Retro Arcade Collection",
        description: "Collection of classic arcade games with modern twists and enhanced graphics.",
        icon: "🎮",
        status: ProjectStatus.IN_PROGRESS,
        engine: GameEngine.HTML5,
        platform: Platform.WEB,
        ownerId: "user-2", // Owned by Sarah Chen (community project)
        teamMembers: ["user-2", "user-3", "user-1"],
        features: ["Classic arcade games", "Modern graphics", "Leaderboards", "Achievement system"],
        screenshots: [],
        lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
    ];

    sampleProjects.forEach(project => this.projects.set(project.id, project));

    // Create sample metrics
    const sampleMetrics: Metrics = {
      id: "metrics-1",
      userId: defaultUser.id,
      activeProjects: 12,
      teamMembers: 100,
      assetsCreated: 847,
      gamesPublished: 23,
      revenue: 12745000, // $127,450 in cents
      updatedAt: new Date(),
    };
    this.metrics.set(defaultUser.id, sampleMetrics);

    // Create diverse sample assets across all categories
    const sampleAssets: Asset[] = [
      // MUSIC ASSETS
      {
        id: "asset-music-1",
        name: "Epic Fantasy Orchestra",
        description: "A sweeping orchestral piece perfect for fantasy games. Features full string sections, brass, and ethereal choir elements with dynamic crescendos.",
        category: "music",
        price: 2999, // $29.99
        originalPrice: 3499, // $34.99
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/music/epic-fantasy-orchestra.mp3",
        previewUrl: "/assets/previews/epic-fantasy-preview.mp3",
        tags: ["orchestral", "fantasy", "epic", "cinematic", "loop"],
        downloads: 8420,
        rating: 480, // 4.8 stars
        reviewCount: 156,
        fileSize: "12.5 MB",
        format: "MP3, WAV",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-music-2",
        name: "Cyberpunk Synthwave Pack",
        description: "5 retro-futuristic synthwave tracks with driving beats and neon atmosphere. Perfect for cyberpunk and sci-fi games.",
        category: "music",
        price: 1999, // $19.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/music/cyberpunk-synthwave-pack.zip",
        previewUrl: "/assets/previews/cyberpunk-preview.mp3",
        tags: ["synthwave", "cyberpunk", "electronic", "retro", "pack"],
        downloads: 5210,
        rating: 450, // 4.5 stars
        reviewCount: 89,
        fileSize: "45.2 MB",
        format: "MP3, OGG",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-music-3",
        name: "Peaceful Village Themes",
        description: "Gentle, acoustic melodies perfect for peaceful town areas, farming games, or cozy RPG environments.",
        category: "music",
        price: 799, // $7.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/music/peaceful-village.mp3",
        previewUrl: null,
        tags: ["acoustic", "peaceful", "village", "RPG", "ambient"],
        downloads: 12500,
        rating: 465, // 4.65 stars
        reviewCount: 203,
        fileSize: "8.7 MB",
        format: "MP3",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },

      // GRAPHICS ASSETS
      {
        id: "asset-graphics-1",
        name: "Medieval Castle Tileset",
        description: "Complete 2D tileset for medieval castle environments. Includes walls, towers, gates, and decorative elements. 32x32 pixel art style.",
        category: "graphics",
        price: 1499, // $14.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1520637836862-4d197d17c17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/graphics/medieval-castle-tileset.zip",
        previewUrl: null,
        tags: ["medieval", "castle", "tileset", "2D", "pixel-art"],
        downloads: 6750,
        rating: 470, // 4.7 stars
        reviewCount: 124,
        fileSize: "15.3 MB",
        format: "PNG, Unity Package",
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-graphics-2",
        name: "Sci-Fi UI Elements",
        description: "Futuristic user interface elements including buttons, panels, progress bars, and HUD components. Perfect for space games.",
        category: "graphics",
        price: 999, // $9.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/graphics/scifi-ui-elements.psd",
        previewUrl: null,
        tags: ["sci-fi", "UI", "interface", "HUD", "space"],
        downloads: 9200,
        rating: 440, // 4.4 stars  
        reviewCount: 187,
        fileSize: "22.1 MB",
        format: "PSD, PNG",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-graphics-3",
        name: "Hand-Painted Texture Pack",
        description: "50 high-resolution hand-painted textures for fantasy environments. Includes stone, wood, fabric, and magical materials.",
        category: "graphics",
        price: 2499, // $24.99
        originalPrice: 2999, // $29.99
        thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/graphics/hand-painted-textures.zip",
        previewUrl: null,
        tags: ["textures", "hand-painted", "fantasy", "high-res", "materials"],
        downloads: 3450,
        rating: 485, // 4.85 stars
        reviewCount: 67,
        fileSize: "128.5 MB",
        format: "TGA, PNG",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },

      // SOUND EFFECTS
      {
        id: "asset-sounds-1",
        name: "Magic Spells SFX Collection",
        description: "100+ magical sound effects including fireballs, lightning, healing spells, and mystical ambiences. High-quality WAV files.",
        category: "sounds",
        price: 1799, // $17.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/sounds/magic-spells-sfx.zip",
        previewUrl: "/assets/previews/magic-spells-preview.mp3",
        tags: ["magic", "spells", "fantasy", "SFX", "combat"],
        downloads: 7800,
        rating: 455, // 4.55 stars
        reviewCount: 142,
        fileSize: "87.3 MB",
        format: "WAV, OGG",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-sounds-2",
        name: "8-Bit Retro Sound Pack",
        description: "Classic chiptune sound effects reminiscent of 8-bit era games. Perfect for retro and arcade-style games.",
        category: "sounds",
        price: 599, // $5.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/sounds/8bit-retro-sounds.zip",
        previewUrl: null,
        tags: ["8-bit", "retro", "chiptune", "arcade", "classic"],
        downloads: 15600,
        rating: 475, // 4.75 stars
        reviewCount: 298,
        fileSize: "12.8 MB",
        format: "WAV, OGG",
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-sounds-3",
        name: "Horror Atmosphere Pack",
        description: "Spine-chilling ambient sounds and jump scares. Includes whispers, creaking doors, ghostly wails, and dark atmospheres.",
        category: "sounds",
        price: 1299, // $12.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/sounds/horror-atmosphere.zip",
        previewUrl: "/assets/previews/horror-preview.mp3",
        tags: ["horror", "scary", "atmosphere", "ambient", "thriller"],
        downloads: 4280,
        rating: 420, // 4.2 stars
        reviewCount: 95,
        fileSize: "65.4 MB",
        format: "WAV, MP3",
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      },

      // TOOLS
      {
        id: "asset-tools-1",
        name: "Level Design Blueprint System",
        description: "Advanced Unreal Engine blueprint system for rapid level prototyping. Includes modular building tools and snap-to-grid system.",
        category: "tools",
        price: 3999, // $39.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/tools/level-design-blueprints.zip",
        previewUrl: null,
        tags: ["unreal-engine", "blueprints", "level-design", "tools", "modular"],
        downloads: 2340,
        rating: 490, // 4.9 stars
        reviewCount: 78,
        fileSize: "45.7 MB",
        format: "Unreal Package",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-tools-2",
        name: "Mobile Performance Optimizer",
        description: "Unity tool for automatic texture compression, LOD generation, and mobile-specific optimizations. One-click performance boost.",
        category: "tools",
        price: 1999, // $19.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/tools/mobile-performance-optimizer.unitypackage",
        previewUrl: null,
        tags: ["unity", "mobile", "optimization", "performance", "utility"],
        downloads: 5680,
        rating: 435, // 4.35 stars
        reviewCount: 156,
        fileSize: "8.9 MB",
        format: "Unity Package",
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      },

      // SCRIPTS
      {
        id: "asset-scripts-1",
        name: "Advanced Dialogue System",
        description: "Complete C# dialogue system with branching conversations, character portraits, and localization support. Easy to integrate.",
        category: "scripts",
        price: 2799, // $27.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/dialogue-system.cs",
        previewUrl: null,
        tags: ["dialogue", "RPG", "conversation", "C#", "Unity"],
        downloads: 4560,
        rating: 460, // 4.6 stars
        reviewCount: 112,
        fileSize: "2.3 MB",
        format: "C# Script",
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-scripts-2",
        name: "Inventory & Crafting System",
        description: "Robust inventory management with drag-and-drop UI, item stacking, and crafting recipes. Fully customizable for any genre.",
        category: "scripts",
        price: 3499, // $34.99
        originalPrice: 4999, // $49.99
        thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/inventory-crafting-system.zip",
        previewUrl: null,
        tags: ["inventory", "crafting", "RPG", "UI", "system"],
        downloads: 3240,
        rating: 480, // 4.8 stars
        reviewCount: 87,
        fileSize: "5.7 MB",
        format: "C# Scripts, Unity Package",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-scripts-3",
        name: "FREE Basic Player Controller",
        description: "Essential 2D/3D player movement controller with jumping, ground detection, and smooth animations. Great starting point for beginners.",
        category: "scripts",
        price: 0, // FREE
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/basic-player-controller.cs",
        previewUrl: null,
        tags: ["free", "player", "movement", "beginner", "controller"],
        downloads: 28750,
        rating: 415, // 4.15 stars
        reviewCount: 456,
        fileSize: "150 KB",
        format: "C# Script",
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },

      // Additional varied assets to increase diversity...
      {
        id: "asset-music-4",
        name: "Ambient Space Drones",
        description: "Ethereal space ambiences perfect for exploration and atmosphere building in sci-fi games.",
        category: "music",
        price: 1299, // $12.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/music/ambient-space-drones.wav",
        previewUrl: null,
        tags: ["ambient", "space", "drones", "atmosphere", "sci-fi"],
        downloads: 2890,
        rating: 425, // 4.25 stars
        reviewCount: 67,
        fileSize: "34.2 MB",
        format: "WAV",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-graphics-4",
        name: "Cartoon Character Sprites",
        description: "Colorful 2D character sprites with walking, running, and idle animations. Perfect for casual mobile games.",
        category: "graphics",
        price: 899, // $8.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/graphics/cartoon-character-sprites.zip",
        previewUrl: null,
        tags: ["cartoon", "characters", "2D", "sprites", "animation"],
        downloads: 11200,
        rating: 445, // 4.45 stars
        reviewCount: 234,
        fileSize: "18.6 MB",
        format: "PNG, Spine",
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      },

      // ADDITIONAL MUSIC ASSETS
      {
        id: "asset-music-5",
        name: "Folk Acoustic Collection",
        description: "Warm acoustic guitar melodies and folk instruments perfect for relaxing indie games and cozy environments.",
        category: "music",
        price: 1599, // $15.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/music/folk-acoustic-collection.zip",
        previewUrl: "/assets/previews/folk-acoustic-preview.mp3",
        tags: ["folk", "acoustic", "guitar", "indie", "relaxing"],
        downloads: 6780,
        rating: 455, // 4.55 stars
        reviewCount: 134,
        fileSize: "28.4 MB",
        format: "MP3, OGG",
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },

      // ADDITIONAL GRAPHICS ASSETS
      {
        id: "asset-graphics-5",
        name: "Low-Poly 3D Environment Pack",
        description: "Beautiful low-poly 3D environments including forests, mountains, and villages. Optimized for mobile and VR platforms.",
        category: "graphics",
        price: 3299, // $32.99
        originalPrice: 3999, // $39.99
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/graphics/lowpoly-3d-environments.zip",
        previewUrl: null,
        tags: ["3D", "low-poly", "environment", "VR", "mobile"],
        downloads: 4120,
        rating: 470, // 4.7 stars
        reviewCount: 98,
        fileSize: "156.7 MB",
        format: "FBX, OBJ, Unity Package",
        createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      },

      // ADDITIONAL SOUND EFFECTS
      {
        id: "asset-sounds-4",
        name: "Nature & Wildlife Soundscape",
        description: "High-quality nature recordings including forest ambience, bird songs, water streams, and wildlife sounds for immersive environments.",
        category: "sounds",
        price: 2199, // $21.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/sounds/nature-wildlife-soundscape.zip",
        previewUrl: "/assets/previews/nature-preview.mp3",
        tags: ["nature", "ambient", "wildlife", "forest", "water"],
        downloads: 7650,
        rating: 485, // 4.85 stars
        reviewCount: 167,
        fileSize: "98.3 MB",
        format: "WAV, MP3",
        createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-sounds-5",
        name: "Action Combat SFX Arsenal",
        description: "Dynamic action sound effects pack with weapon sounds, explosions, impacts, and combat audio for intense gameplay moments.",
        category: "sounds",
        price: 1799, // $17.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/sounds/action-combat-sfx.zip",
        previewUrl: "/assets/previews/combat-preview.mp3",
        tags: ["action", "combat", "weapons", "explosions", "impacts"],
        downloads: 9340,
        rating: 460, // 4.6 stars
        reviewCount: 178,
        fileSize: "73.1 MB",
        format: "WAV, OGG",
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      },

      // ADDITIONAL TOOLS
      {
        id: "asset-tools-3",
        name: "Multiplayer Network Framework",
        description: "Complete networking solution for Unity with client-server architecture, lag compensation, and synchronized gameplay features.",
        category: "tools",
        price: 4999, // $49.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/tools/multiplayer-network-framework.unitypackage",
        previewUrl: null,
        tags: ["multiplayer", "networking", "Unity", "client-server", "synchronization"],
        downloads: 1890,
        rating: 475, // 4.75 stars
        reviewCount: 67,
        fileSize: "32.1 MB",
        format: "Unity Package, C# Scripts",
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-tools-4",
        name: "Game Analytics Dashboard",
        description: "Professional analytics tool for tracking player behavior, performance metrics, and game statistics with beautiful visualizations.",
        category: "tools",
        price: 2999, // $29.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/tools/game-analytics-dashboard.zip",
        previewUrl: null,
        tags: ["analytics", "dashboard", "metrics", "statistics", "visualization"],
        downloads: 3210,
        rating: 445, // 4.45 stars
        reviewCount: 89,
        fileSize: "18.9 MB",
        format: "Unity Package, Web Dashboard",
        createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      },

      // ADDITIONAL SCRIPTS
      {
        id: "asset-scripts-4",
        name: "Universal Save System",
        description: "Robust save/load system with encryption, cloud sync support, and automatic backup features. Works with any game genre.",
        category: "scripts",
        price: 2299, // $22.99
        originalPrice: 2799, // $27.99
        thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/universal-save-system.cs",
        previewUrl: null,
        tags: ["save", "load", "encryption", "cloud", "backup"],
        downloads: 8750,
        rating: 480, // 4.8 stars
        reviewCount: 198,
        fileSize: "3.2 MB",
        format: "C# Scripts",
        createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-scripts-5",
        name: "Smooth Camera Controller Pro",
        description: "Advanced camera system with cinematic transitions, follow modes, and customizable camera behaviors for 2D and 3D games.",
        category: "scripts",
        price: 1899, // $18.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/smooth-camera-controller.zip",
        previewUrl: null,
        tags: ["camera", "cinematic", "smooth", "2D", "3D"],
        downloads: 12340,
        rating: 465, // 4.65 stars
        reviewCount: 267,
        fileSize: "4.1 MB",
        format: "C# Scripts, Unity Package",
        createdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
      },
      {
        id: "asset-scripts-6",
        name: "AI Behavior Tree System",
        description: "Professional AI framework with visual behavior tree editor, state machines, and pathfinding integration for complex NPCs.",
        category: "scripts",
        price: 3799, // $37.99
        originalPrice: null,
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        fileUrl: "/assets/scripts/ai-behavior-tree-system.unitypackage",
        previewUrl: null,
        tags: ["AI", "behavior-tree", "NPC", "pathfinding", "editor"],
        downloads: 2670,
        rating: 495, // 4.95 stars
        reviewCount: 84,
        fileSize: "12.8 MB",
        format: "Unity Package, C# Scripts",
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      },
    ];

    // Add all sample assets to storage
    sampleAssets.forEach(asset => this.assets.set(asset.id, asset));

    // Create diverse sample asset bundles
    const sampleBundles: AssetBundle[] = [
      {
        id: "bundle-1",
        name: "Complete Indie Game Starter Pack",
        description: "Everything you need to create your first indie game! Includes music tracks, sound effects, UI elements, and essential scripts.",
        price: 4999, // $49.99
        originalPrice: 8999, // $89.99
        discount: 44,
        thumbnail: "https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-music-3", "asset-sounds-2", "asset-graphics-2", "asset-scripts-3"],
        downloads: 1250,
        rating: 475, // 4.75 stars
        reviewCount: 89,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      },
      {
        id: "bundle-2",
        name: "Premium AAA Audio Collection",
        description: "Professional-grade orchestral music and high-fidelity sound effects used by AAA studios. Premium quality guaranteed.",
        price: 9999, // $99.99
        originalPrice: 14999, // $149.99
        discount: 33,
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-music-1", "asset-music-2", "asset-sounds-1", "asset-sounds-3"],
        downloads: 456,
        rating: 495, // 4.95 stars
        reviewCount: 45,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        id: "bundle-3",
        name: "Retro Gaming Nostalgia Pack",
        description: "Relive the golden age of gaming! 8-bit music, pixel art graphics, and classic sound effects that bring back the arcade memories.",
        price: 1499, // $14.99
        originalPrice: 2499, // $24.99
        discount: 40,
        thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-sounds-2", "asset-graphics-4"],
        downloads: 2340,
        rating: 465, // 4.65 stars
        reviewCount: 156,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        id: "bundle-4",
        name: "Mobile Game Development Kit",
        description: "Optimized assets specifically for mobile games. Includes performance tools, mobile-friendly graphics, and lightweight audio.",
        price: 3999, // $39.99
        originalPrice: 5999, // $59.99
        discount: 33,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-tools-2", "asset-graphics-4", "asset-music-4"],
        downloads: 890,
        rating: 450, // 4.5 stars
        reviewCount: 67,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: "bundle-5",
        name: "Fantasy RPG Master Collection",
        description: "Epic fantasy bundle with orchestral music, magical sound effects, medieval graphics, and advanced RPG systems.",
        price: 7999, // $79.99
        originalPrice: 12999, // $129.99
        discount: 38,
        thumbnail: "https://images.unsplash.com/photo-1520637736862-4d197d17c17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-music-1", "asset-sounds-1", "asset-graphics-1", "asset-scripts-1", "asset-scripts-2"],
        downloads: 678,
        rating: 485, // 4.85 stars
        reviewCount: 112,
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      },
      {
        id: "bundle-6",
        name: "Horror Game Atmosphere Bundle",
        description: "Send chills down your players' spines! Dark ambient music, terrifying sound effects, and haunting visual elements.",
        price: 2999, // $29.99
        originalPrice: null,
        discount: 0,
        thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        assetIds: ["asset-sounds-3", "asset-music-4"],
        downloads: 1120,
        rating: 440, // 4.4 stars
        reviewCount: 78,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
    ];

    // Add all sample bundles to storage
    sampleBundles.forEach(bundle => this.bundles.set(bundle.id, bundle));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "developer",
      avatar: insertUser.avatar ?? null,
      banner: insertUser.banner ?? null,
      bio: insertUser.bio ?? null,
      jobTitle: insertUser.jobTitle ?? null,
      status: insertUser.status ?? null,
      location: insertUser.location ?? null,
      portfolioLink: insertUser.portfolioLink ?? null,
      skills: insertUser.skills || [],
      currentProject: insertUser.currentProject ?? null,
      availability: insertUser.availability || "online",
      settings: insertUser.settings ?? {
        notifications: {
          projectUpdates: true,
          teamMessages: true,
          communityActivity: true,
        },
        privacy: {
          profileVisibility: "public",
          whoCanMessage: "everyone",
        },
      },
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }

    // Don't allow updating id, password, or createdAt through this method
    const { id: _, password, createdAt, ...allowedUpdates } = updates;
    
    const updatedUser: User = {
      ...existingUser,
      ...allowedUpdates,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.ownerId === userId
    );
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id,
      status: insertProject.status || ProjectStatus.NOT_STARTED,
      icon: insertProject.icon || "🎮",
      teamMembers: insertProject.teamMembers || [],
      features: insertProject.features || [],
      screenshots: insertProject.screenshots || [],
      lastUpdated: now,
      createdAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { 
      ...project, 
      ...updates, 
      lastUpdated: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getMetricsByUserId(userId: string): Promise<Metrics | undefined> {
    return this.metrics.get(userId);
  }

  async updateMetrics(userId: string, updates: Partial<InsertMetrics>): Promise<Metrics> {
    const existing = this.metrics.get(userId);
    const metrics: Metrics = {
      id: existing?.id || randomUUID(),
      userId,
      activeProjects: 0,
      teamMembers: 0,
      assetsCreated: 0,
      gamesPublished: 0,
      revenue: 0,
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.metrics.set(userId, metrics);
    return metrics;
  }

  // Asset Store operations
  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      asset => asset.category === category
    );
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const now = new Date();
    const asset: Asset = {
      ...insertAsset,
      id,
      originalPrice: insertAsset.originalPrice ?? null,
      previewUrl: insertAsset.previewUrl ?? null,
      tags: insertAsset.tags ?? [],
      downloads: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(id, asset);
    return asset;
  }

  async getAllBundles(): Promise<AssetBundle[]> {
    return Array.from(this.bundles.values());
  }

  async getBundle(id: string): Promise<AssetBundle | undefined> {
    return this.bundles.get(id);
  }

  async createBundle(insertBundle: InsertAssetBundle): Promise<AssetBundle> {
    const id = randomUUID();
    const now = new Date();
    const bundle: AssetBundle = {
      ...insertBundle,
      id,
      originalPrice: insertBundle.originalPrice ?? null,
      discount: insertBundle.discount ?? 0,
      assetIds: insertBundle.assetIds ?? [],
      downloads: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.bundles.set(id, bundle);
    return bundle;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      assetId: insertCartItem.assetId ?? null,
      bundleId: insertCartItem.bundleId ?? null,
      quantity: insertCartItem.quantity ?? 1,
      createdAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    const item = this.cartItems.get(itemId);
    if (!item || item.userId !== userId) return false;
    return this.cartItems.delete(itemId);
  }

  async clearCart(userId: string): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.userId === userId
    );
    userItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const purchase: Purchase = {
      ...insertPurchase,
      id,
      status: insertPurchase.status ?? "completed",
      assetId: insertPurchase.assetId ?? null,
      bundleId: insertPurchase.bundleId ?? null,
      createdAt: new Date(),
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(
      purchase => purchase.userId === userId
    );
  }

  // Game Library operations
  async getGameLibraryByUserId(userId: string): Promise<GameLibrary[]> {
    return Array.from(this.gameLibrary.values()).filter(
      item => item.userId === userId
    );
  }

  async addToGameLibrary(insertItem: InsertGameLibrary): Promise<GameLibrary> {
    const id = randomUUID();
    const item: GameLibrary = {
      ...insertItem,
      id,
      gameIcon: insertItem.gameIcon ?? "🎮",
      gameDescription: insertItem.gameDescription ?? null,
      purchasedAt: new Date(),
      lastPlayed: null,
      playTime: insertItem.playTime ?? 0,
      favorite: insertItem.favorite ?? 0,
    };
    this.gameLibrary.set(id, item);
    return item;
  }

  // Buttonz Chat operations
  async getAllChats(): Promise<Chat[]> {
    return Array.from(this.chats.values());
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      chat => chat.createdBy === userId
    );
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID();
    const now = new Date();
    const chat: Chat = {
      ...insertChat,
      id,
      type: insertChat.type ?? "group",
      isMainChat: insertChat.isMainChat ?? 0,
      description: insertChat.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.chats.set(id, chat);
    return chat;
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    // Only allow updating mutable fields, preserve immutable ones
    const { id: _id, createdBy: _createdBy, createdAt: _createdAt, ...allowedUpdates } = updates;
    
    const updatedChat: Chat = {
      ...chat,
      ...allowedUpdates,
      updatedAt: new Date(),
    };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async deleteChat(id: string): Promise<boolean> {
    // Cascade delete related data
    const memberEntries = Array.from(this.chatMembers.entries());
    const chatMemberIds = memberEntries
      .filter(([_, member]) => member.chatId === id)
      .map(([memberId]) => memberId);
    
    const messageEntries = Array.from(this.messages.entries());
    const chatMessageIds = messageEntries
      .filter(([_, message]) => message.chatId === id)
      .map(([messageId]) => messageId);
    
    // Delete chat members
    chatMemberIds.forEach(memberId => this.chatMembers.delete(memberId));
    
    // Delete messages
    chatMessageIds.forEach(messageId => this.messages.delete(messageId));
    
    // Delete the chat
    return this.chats.delete(id);
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    return Array.from(this.chatMembers.values()).filter(
      member => member.chatId === chatId
    );
  }

  async addChatMember(insertChatMember: InsertChatMember): Promise<ChatMember> {
    // Check for existing membership to prevent duplicates
    const existingMember = Array.from(this.chatMembers.values()).find(
      member => member.chatId === insertChatMember.chatId && member.userId === insertChatMember.userId
    );
    
    if (existingMember) {
      return existingMember; // Return existing membership instead of creating duplicate
    }
    
    const id = randomUUID();
    const chatMember: ChatMember = {
      ...insertChatMember,
      id,
      role: insertChatMember.role ?? "member",
      joinedAt: new Date(),
    };
    this.chatMembers.set(id, chatMember);
    return chatMember;
  }

  async removeChatMember(chatId: string, userId: string): Promise<boolean> {
    const memberEntries = Array.from(this.chatMembers.entries());
    const memberEntry = memberEntries.find(([_, member]) => 
      member.chatId === chatId && member.userId === userId
    );
    if (!memberEntry) return false;
    return this.chatMembers.delete(memberEntry[0]);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    const userMemberships = Array.from(this.chatMembers.values()).filter(
      member => member.userId === userId
    );
    const chatIds = userMemberships.map(member => member.chatId);
    return Array.from(this.chats.values()).filter(
      chat => chatIds.includes(chat.id)
    );
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    const chatMessages = Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return chatMessages.slice(start, end);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      type: insertMessage.type ?? "text",
      editedAt: insertMessage.editedAt ?? null,
      replyToId: insertMessage.replyToId ?? null,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: string, content: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = {
      ...message,
      content,
      editedAt: new Date(),
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }
}

import { DatabaseStorage } from "./db-storage";

export const storage = new DatabaseStorage();
