import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc, and } from "drizzle-orm";
import { 
  users, 
  projects, 
  metrics,
  assets,
  assetBundles,
  cartItems,
  purchases,
  gameLibrary,
  chats,
  chatMembers,
  messages,
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
import type { IStorage } from "./storage";

// Validate and configure database connection with proper error handling
function initializeDatabaseConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const error = new Error(
      'DATABASE_URL environment variable is required. ' +
      'Please set DATABASE_URL to your PostgreSQL connection string.'
    );
    console.error('Database configuration error:', error.message);
    throw error;
  }

  try {
    // Validate URL format
    new URL(connectionString);
  } catch (urlError) {
    const error = new Error(
      'DATABASE_URL is not a valid URL format. ' +
      'Expected format: postgresql://user:password@host:port/database'
    );
    console.error('Database URL validation error:', error.message);
    throw error;
  }

  // Configure postgres client with production-safe settings
  const client = postgres(connectionString, {
    max: 20, // Maximum number of connections
    idle_timeout: 30, // Close connections after 30s of inactivity
    connect_timeout: 10, // Connection timeout in seconds
    onnotice: (notice) => {
      console.log('PostgreSQL notice:', notice);
    },
    onparameter: (key, value) => {
      console.log('PostgreSQL parameter:', key, value);
    }
  });

  return drizzle(client);
}

let db: ReturnType<typeof drizzle>;

try {
  db = initializeDatabaseConnection();
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export class DatabaseStorage implements IStorage {
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor() {
    // Initialize with sample data only in development environment
    if (this.shouldInitializeSampleData()) {
      this.initializeSampleData();
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`Database operation failed (attempt ${attempt}/${this.maxRetries}) - ${context}:`, error);
        
        // Don't retry on certain types of errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Database operation failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  private isNonRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const message = error.message.toLowerCase();
    
    // Don't retry on validation errors, auth errors, or client errors
    return (
      message.includes('validation') ||
      message.includes('authentication') ||
      message.includes('authorization') ||
      message.includes('syntax error') ||
      message.includes('column') && message.includes('does not exist') ||
      message.includes('relation') && message.includes('does not exist')
    );
  }

  private shouldInitializeSampleData(): boolean {
    // Only initialize sample data in development or when explicitly enabled
    const nodeEnv = process.env.NODE_ENV || 'development';
    const enableSampleData = process.env.ENABLE_SAMPLE_DATA === 'true';
    
    return nodeEnv === 'development' || enableSampleData;
  }

  private async initializeSampleData() {
    try {
      // Check if we already have data
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return; // Data already exists
      }

      // Create default user
      const [defaultUser] = await db.insert(users).values({
        username: "alex.rodriguez",
        password: "hashed_password",
        email: "alex@gameforge.com",
        displayName: "Alex Rodriguez",
        role: "Lead Developer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      }).returning();

      // Create additional community users
      const [communityUser1] = await db.insert(users).values({
        username: "sarah.chen",
        password: "hashed_password",
        email: "sarah@gameforge.com",
        displayName: "Sarah Chen",
        role: "Game Designer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      }).returning();

      const [communityUser2] = await db.insert(users).values({
        username: "james.wilson",
        password: "hashed_password",
        email: "james@gameforge.com",
        displayName: "James Wilson",
        role: "3D Artist",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      }).returning();

      // Create sample projects
      await db.insert(projects).values([
        {
          name: "Space Explorer VR",
          description: "An immersive VR experience exploring distant galaxies and alien worlds.",
          icon: "🚀",
          status: ProjectStatus.LIVE,
          engine: GameEngine.UNITY,
          platform: Platform.VR,
          ownerId: defaultUser.id,
          teamMembers: [defaultUser.id, communityUser1.id, communityUser2.id],
          features: ["Full VR support with hand tracking", "Procedurally generated planets", "Realistic space physics simulation", "Multiplayer exploration mode", "Dynamic weather systems"],
          screenshots: ["https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"],
        },
        {
          name: "Fantasy Quest RPG",
          description: "Epic fantasy role-playing game with deep character customization and storyline.",
          icon: "⚔️",
          status: ProjectStatus.IN_PROGRESS,
          engine: GameEngine.UNREAL,
          platform: Platform.PC,
          ownerId: defaultUser.id,
          teamMembers: [defaultUser.id, communityUser1.id],
          features: ["Character customization", "Open world exploration", "Dynamic quest system", "Skill trees", "Multiplayer co-op"],
          screenshots: [],
        },
        {
          name: "Racing Championship",
          description: "High-speed racing game with realistic physics and multiplayer competitions.",
          icon: "🏎️",
          status: ProjectStatus.NOT_STARTED,
          engine: GameEngine.UNITY,
          platform: Platform.PC,
          ownerId: communityUser1.id,
          teamMembers: [communityUser1.id, communityUser2.id],
          features: ["Realistic physics", "Multiplayer racing", "Car customization", "Multiple tracks"],
          screenshots: [],
        },
        {
          name: "Puzzle Master 3D",
          description: "Mind-bending 3D puzzle game with innovative mechanics and beautiful visuals.",
          icon: "🧩",
          status: ProjectStatus.IN_PROGRESS,
          engine: GameEngine.GODOT,
          platform: Platform.MOBILE,
          ownerId: communityUser2.id,
          teamMembers: [communityUser2.id, communityUser1.id, defaultUser.id],
          features: ["3D puzzle mechanics", "Physics-based gameplay", "Level editor", "Hint system"],
          screenshots: [],
        },
        {
          name: "Cosmic Adventure",
          description: "Exploration game set in a vast universe with procedurally generated content.",
          icon: "🌟",
          status: ProjectStatus.LIVE,
          engine: GameEngine.HTML5,
          platform: Platform.WEB,
          ownerId: defaultUser.id,
          teamMembers: [defaultUser.id, communityUser2.id],
          features: ["Procedural generation", "Space exploration", "Resource management", "Alien encounters"],
          screenshots: [],
        },
        {
          name: "Retro Arcade Collection",
          description: "Collection of classic arcade games with modern twists and enhanced graphics.",
          icon: "🎮",
          status: ProjectStatus.IN_PROGRESS,
          engine: GameEngine.HTML5,
          platform: Platform.WEB,
          ownerId: communityUser1.id,
          teamMembers: [communityUser1.id, communityUser2.id, defaultUser.id],
          features: ["Classic arcade games", "Modern graphics", "Leaderboards", "Achievement system"],
          screenshots: [],
        },
        {
          name: "Console Warriors Fighting",
          description: "Intense 2D fighting game with unique characters and competitive multiplayer.",
          icon: "🥊",
          status: ProjectStatus.LIVE,
          engine: GameEngine.UNREAL,
          platform: Platform.CONSOLE,
          ownerId: communityUser2.id,
          teamMembers: [communityUser2.id, defaultUser.id],
          features: ["8 unique fighters", "Frame-perfect combat", "Online tournaments", "Story mode", "Cross-platform play"],
          screenshots: ["https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"],
        },
        {
          name: "City Builder Simulator",
          description: "Build and manage your dream city with realistic economics and citizen AI.",
          icon: "🏙️",
          status: ProjectStatus.IN_PROGRESS,
          engine: GameEngine.CUSTOM,
          platform: Platform.PC,
          ownerId: defaultUser.id,
          teamMembers: [defaultUser.id],
          features: ["Economic simulation", "Dynamic weather", "Traffic management", "Zoning system", "Disaster scenarios"],
          screenshots: [],
        },
        {
          name: "Horror Escape: Midnight Manor",
          description: "Psychological horror game set in an abandoned Victorian mansion.",
          icon: "👻",
          status: ProjectStatus.NOT_STARTED,
          engine: GameEngine.UNITY,
          platform: Platform.PC,
          ownerId: communityUser1.id,
          teamMembers: [communityUser1.id, communityUser2.id],
          features: ["Atmospheric horror", "Puzzle solving", "Multiple endings", "Voice acting", "Procedural scares"],
          screenshots: [],
        },
        {
          name: "Math Quest Academy",
          description: "Educational adventure game that makes learning mathematics fun and engaging.",
          icon: "📚",
          status: ProjectStatus.LIVE,
          engine: GameEngine.GODOT,
          platform: Platform.MOBILE,
          ownerId: communityUser2.id,
          teamMembers: [communityUser2.id],
          features: ["Grade-specific content", "Progress tracking", "Gamified learning", "Parent dashboard", "Offline mode"],
          screenshots: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"],
        },
        {
          name: "Space Strategy Command",
          description: "Real-time strategy game with galactic conquest and fleet management.",
          icon: "🛸",
          status: ProjectStatus.IN_PROGRESS,
          engine: GameEngine.CUSTOM,
          platform: Platform.PC,
          ownerId: defaultUser.id,
          teamMembers: [defaultUser.id, communityUser1.id, communityUser2.id],
          features: ["Fleet combat", "Resource management", "Diplomacy system", "Tech trees", "Modding support"],
          screenshots: [],
        },
        {
          name: "Ocean Explorer Adventure",
          description: "Immersive underwater exploration game with marine life discovery and treasure hunting.",
          icon: "🌊",
          status: ProjectStatus.LIVE,
          engine: GameEngine.HTML5,
          platform: Platform.MOBILE,
          ownerId: communityUser1.id,
          teamMembers: [communityUser1.id],
          features: ["Underwater exploration", "Marine creature catalog", "Treasure discovery", "Ocean conservation themes", "Relaxing gameplay"],
          screenshots: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"],
        },
      ]);

      // Create sample metrics for default user
      await db.insert(metrics).values({
        userId: defaultUser.id,
        activeProjects: 12,
        teamMembers: 100,
        assetsCreated: 847,
        gamesPublished: 23,
        revenue: 12745000, // $127,450 in cents
      });

      // Create diverse sample assets across all categories
      await db.insert(assets).values([
        // MUSIC ASSETS - Diverse themes and price ranges
        {
          name: "Epic Fantasy Orchestra",
          description: "A sweeping orchestral piece perfect for fantasy games. Features full string sections, brass, and ethereal choir elements with dynamic crescendos.",
          category: AssetCategory.MUSIC,
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
        },
        {
          name: "Cyberpunk Synthwave Pack",
          description: "5 retro-futuristic synthwave tracks with driving beats and neon atmosphere. Perfect for cyberpunk and sci-fi games.",
          category: AssetCategory.MUSIC,
          price: 1999, // $19.99
          thumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/music/cyberpunk-synthwave-pack.zip",
          previewUrl: "/assets/previews/cyberpunk-preview.mp3",
          tags: ["synthwave", "cyberpunk", "electronic", "retro", "pack"],
          downloads: 5210,
          rating: 450, // 4.5 stars
          reviewCount: 89,
          fileSize: "45.2 MB",
          format: "MP3, OGG",
        },
        {
          name: "Peaceful Village Themes",
          description: "Gentle, acoustic melodies perfect for peaceful town areas, farming games, or cozy RPG environments.",
          category: AssetCategory.MUSIC,
          price: 799, // $7.99
          thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/music/peaceful-village.mp3",
          tags: ["acoustic", "peaceful", "village", "RPG", "ambient"],
          downloads: 12500,
          rating: 465, // 4.65 stars
          reviewCount: 203,
          fileSize: "8.7 MB",
          format: "MP3",
        },
        {
          name: "Ambient Space Drones",
          description: "Ethereal space ambiences perfect for exploration and atmosphere building in sci-fi games.",
          category: AssetCategory.MUSIC,
          price: 1299, // $12.99
          thumbnail: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/music/ambient-space-drones.wav",
          tags: ["ambient", "space", "drones", "atmosphere", "sci-fi"],
          downloads: 2890,
          rating: 425, // 4.25 stars
          reviewCount: 67,
          fileSize: "34.2 MB",
          format: "WAV",
        },

        // GRAPHICS ASSETS - Different art styles and purposes
        {
          name: "Medieval Castle Tileset",
          description: "Complete 2D tileset for medieval castle environments. Includes walls, towers, gates, and decorative elements. 32x32 pixel art style.",
          category: AssetCategory.GRAPHICS,
          price: 1499, // $14.99
          thumbnail: "https://images.unsplash.com/photo-1520637836862-4d197d17c17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/graphics/medieval-castle-tileset.zip",
          tags: ["medieval", "castle", "tileset", "2D", "pixel-art"],
          downloads: 6750,
          rating: 470, // 4.7 stars
          reviewCount: 124,
          fileSize: "15.3 MB",
          format: "PNG, Unity Package",
        },
        {
          name: "Sci-Fi UI Elements",
          description: "Futuristic user interface elements including buttons, panels, progress bars, and HUD components. Perfect for space games.",
          category: AssetCategory.GRAPHICS,
          price: 999, // $9.99
          thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/graphics/scifi-ui-elements.psd",
          tags: ["sci-fi", "UI", "interface", "HUD", "space"],
          downloads: 9200,
          rating: 440, // 4.4 stars
          reviewCount: 187,
          fileSize: "22.1 MB",
          format: "PSD, PNG",
        },
        {
          name: "Hand-Painted Texture Pack",
          description: "50 high-resolution hand-painted textures for fantasy environments. Includes stone, wood, fabric, and magical materials.",
          category: AssetCategory.GRAPHICS,
          price: 2499, // $24.99
          originalPrice: 2999, // $29.99
          thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/graphics/hand-painted-textures.zip",
          tags: ["textures", "hand-painted", "fantasy", "high-res", "materials"],
          downloads: 3450,
          rating: 485, // 4.85 stars
          reviewCount: 67,
          fileSize: "128.5 MB",
          format: "TGA, PNG",
        },
        {
          name: "Cartoon Character Sprites",
          description: "Colorful 2D character sprites with walking, running, and idle animations. Perfect for casual mobile games.",
          category: AssetCategory.GRAPHICS,
          price: 899, // $8.99
          thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/graphics/cartoon-character-sprites.zip",
          tags: ["cartoon", "characters", "2D", "sprites", "animation"],
          downloads: 11200,
          rating: 445, // 4.45 stars
          reviewCount: 234,
          fileSize: "18.6 MB",
          format: "PNG, Spine",
        },

        // SOUND EFFECTS - Various game genres and moods
        {
          name: "Magic Spells SFX Collection",
          description: "100+ magical sound effects including fireballs, lightning, healing spells, and mystical ambiences. High-quality WAV files.",
          category: AssetCategory.SOUNDS,
          price: 1799, // $17.99
          thumbnail: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/sounds/magic-spells-sfx.zip",
          previewUrl: "/assets/previews/magic-spells-preview.mp3",
          tags: ["magic", "spells", "fantasy", "SFX", "combat"],
          downloads: 7800,
          rating: 455, // 4.55 stars
          reviewCount: 142,
          fileSize: "87.3 MB",
          format: "WAV, OGG",
        },
        {
          name: "8-Bit Retro Sound Pack",
          description: "Classic chiptune sound effects reminiscent of 8-bit era games. Perfect for retro and arcade-style games.",
          category: AssetCategory.SOUNDS,
          price: 599, // $5.99
          thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/sounds/8bit-retro-sounds.zip",
          tags: ["8-bit", "retro", "chiptune", "arcade", "classic"],
          downloads: 15600,
          rating: 475, // 4.75 stars
          reviewCount: 298,
          fileSize: "12.8 MB",
          format: "WAV, OGG",
        },
        {
          name: "Horror Atmosphere Pack",
          description: "Spine-chilling ambient sounds and jump scares. Includes whispers, creaking doors, ghostly wails, and dark atmospheres.",
          category: AssetCategory.SOUNDS,
          price: 1299, // $12.99
          thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/sounds/horror-atmosphere.zip",
          previewUrl: "/assets/previews/horror-preview.mp3",
          tags: ["horror", "scary", "atmosphere", "ambient", "thriller"],
          downloads: 4280,
          rating: 420, // 4.2 stars
          reviewCount: 95,
          fileSize: "65.4 MB",
          format: "WAV, MP3",
        },

        // TOOLS - Development productivity and workflow
        {
          name: "Level Design Blueprint System",
          description: "Advanced Unreal Engine blueprint system for rapid level prototyping. Includes modular building tools and snap-to-grid system.",
          category: AssetCategory.TOOLS,
          price: 3999, // $39.99
          thumbnail: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/tools/level-design-blueprints.zip",
          tags: ["unreal-engine", "blueprints", "level-design", "tools", "modular"],
          downloads: 2340,
          rating: 490, // 4.9 stars
          reviewCount: 78,
          fileSize: "45.7 MB",
          format: "Unreal Package",
        },
        {
          name: "Mobile Performance Optimizer",
          description: "Unity tool for automatic texture compression, LOD generation, and mobile-specific optimizations. One-click performance boost.",
          category: AssetCategory.TOOLS,
          price: 1999, // $19.99
          thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/tools/mobile-performance-optimizer.unitypackage",
          tags: ["unity", "mobile", "optimization", "performance", "utility"],
          downloads: 5680,
          rating: 435, // 4.35 stars
          reviewCount: 156,
          fileSize: "8.9 MB",
          format: "Unity Package",
        },

        // SCRIPTS - Game systems and functionality
        {
          name: "Advanced Dialogue System",
          description: "Complete C# dialogue system with branching conversations, character portraits, and localization support. Easy to integrate.",
          category: AssetCategory.SCRIPTS,
          price: 2799, // $27.99
          thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/dialogue-system.cs",
          tags: ["dialogue", "RPG", "conversation", "C#", "Unity"],
          downloads: 4560,
          rating: 460, // 4.6 stars
          reviewCount: 112,
          fileSize: "2.3 MB",
          format: "C# Script",
        },
        {
          name: "Inventory & Crafting System",
          description: "Robust inventory management with drag-and-drop UI, item stacking, and crafting recipes. Fully customizable for any genre.",
          category: AssetCategory.SCRIPTS,
          price: 3499, // $34.99
          originalPrice: 4999, // $49.99
          thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/inventory-crafting-system.zip",
          tags: ["inventory", "crafting", "RPG", "UI", "system"],
          downloads: 3240,
          rating: 480, // 4.8 stars
          reviewCount: 87,
          fileSize: "5.7 MB",
          format: "C# Scripts, Unity Package",
        },
        {
          name: "FREE Basic Player Controller",
          description: "Essential 2D/3D player movement controller with jumping, ground detection, and smooth animations. Great starting point for beginners.",
          category: AssetCategory.SCRIPTS,
          price: 0, // FREE
          thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/basic-player-controller.cs",
          tags: ["free", "player", "movement", "beginner", "controller"],
          downloads: 28750,
          rating: 415, // 4.15 stars
          reviewCount: 456,
          fileSize: "150 KB",
          format: "C# Script",
        },

        // ADDITIONAL MUSIC ASSETS (1 more)
        {
          name: "Folk Acoustic Collection",
          description: "Warm acoustic guitar melodies and folk instruments perfect for relaxing indie games and cozy environments.",
          category: AssetCategory.MUSIC,
          price: 1599, // $15.99
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/music/folk-acoustic-collection.zip",
          previewUrl: "/assets/previews/folk-acoustic-preview.mp3",
          tags: ["folk", "acoustic", "guitar", "indie", "relaxing"],
          downloads: 6780,
          rating: 455, // 4.55 stars
          reviewCount: 134,
          fileSize: "28.4 MB",
          format: "MP3, OGG",
        },

        // ADDITIONAL GRAPHICS ASSETS (1 more)
        {
          name: "Low-Poly 3D Environment Pack",
          description: "Beautiful low-poly 3D environments including forests, mountains, and villages. Optimized for mobile and VR platforms.",
          category: AssetCategory.GRAPHICS,
          price: 3299, // $32.99
          originalPrice: 3999, // $39.99
          thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/graphics/lowpoly-3d-environments.zip",
          tags: ["3D", "low-poly", "environment", "VR", "mobile"],
          downloads: 4120,
          rating: 470, // 4.7 stars
          reviewCount: 98,
          fileSize: "156.7 MB",
          format: "FBX, OBJ, Unity Package",
        },

        // ADDITIONAL SOUND EFFECTS (2 more)
        {
          name: "Nature & Wildlife Soundscape",
          description: "High-quality nature recordings including forest ambience, bird songs, water streams, and wildlife sounds for immersive environments.",
          category: AssetCategory.SOUNDS,
          price: 2199, // $21.99
          thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/sounds/nature-wildlife-soundscape.zip",
          previewUrl: "/assets/previews/nature-preview.mp3",
          tags: ["nature", "ambient", "wildlife", "forest", "water"],
          downloads: 7650,
          rating: 485, // 4.85 stars
          reviewCount: 167,
          fileSize: "98.3 MB",
          format: "WAV, MP3",
        },
        {
          name: "Action Combat SFX Arsenal",
          description: "Dynamic action sound effects pack with weapon sounds, explosions, impacts, and combat audio for intense gameplay moments.",
          category: AssetCategory.SOUNDS,
          price: 1799, // $17.99
          thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/sounds/action-combat-sfx.zip",
          previewUrl: "/assets/previews/combat-preview.mp3",
          tags: ["action", "combat", "weapons", "explosions", "impacts"],
          downloads: 9340,
          rating: 460, // 4.6 stars
          reviewCount: 178,
          fileSize: "73.1 MB",
          format: "WAV, OGG",
        },

        // ADDITIONAL TOOLS (2 more)
        {
          name: "Multiplayer Network Framework",
          description: "Complete networking solution for Unity with client-server architecture, lag compensation, and synchronized gameplay features.",
          category: AssetCategory.TOOLS,
          price: 4999, // $49.99
          thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/tools/multiplayer-network-framework.unitypackage",
          tags: ["multiplayer", "networking", "Unity", "client-server", "synchronization"],
          downloads: 1890,
          rating: 475, // 4.75 stars
          reviewCount: 67,
          fileSize: "32.1 MB",
          format: "Unity Package, C# Scripts",
        },
        {
          name: "Game Analytics Dashboard",
          description: "Professional analytics tool for tracking player behavior, performance metrics, and game statistics with beautiful visualizations.",
          category: AssetCategory.TOOLS,
          price: 2999, // $29.99
          thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/tools/game-analytics-dashboard.zip",
          tags: ["analytics", "dashboard", "metrics", "statistics", "visualization"],
          downloads: 3210,
          rating: 445, // 4.45 stars
          reviewCount: 89,
          fileSize: "18.9 MB",
          format: "Unity Package, Web Dashboard",
        },

        // ADDITIONAL SCRIPTS (3 more)
        {
          name: "Universal Save System",
          description: "Robust save/load system with encryption, cloud sync support, and automatic backup features. Works with any game genre.",
          category: AssetCategory.SCRIPTS,
          price: 2299, // $22.99
          originalPrice: 2799, // $27.99
          thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/universal-save-system.cs",
          tags: ["save", "load", "encryption", "cloud", "backup"],
          downloads: 8750,
          rating: 480, // 4.8 stars
          reviewCount: 198,
          fileSize: "3.2 MB",
          format: "C# Scripts",
        },
        {
          name: "Smooth Camera Controller Pro",
          description: "Advanced camera system with cinematic transitions, follow modes, and customizable camera behaviors for 2D and 3D games.",
          category: AssetCategory.SCRIPTS,
          price: 1899, // $18.99
          thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/smooth-camera-controller.zip",
          tags: ["camera", "cinematic", "smooth", "2D", "3D"],
          downloads: 12340,
          rating: 465, // 4.65 stars
          reviewCount: 267,
          fileSize: "4.1 MB",
          format: "C# Scripts, Unity Package",
        },
        {
          name: "AI Behavior Tree System",
          description: "Professional AI framework with visual behavior tree editor, state machines, and pathfinding integration for complex NPCs.",
          category: AssetCategory.SCRIPTS,
          price: 3799, // $37.99
          thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          fileUrl: "/assets/scripts/ai-behavior-tree-system.unitypackage",
          tags: ["AI", "behavior-tree", "NPC", "pathfinding", "editor"],
          downloads: 2670,
          rating: 495, // 4.95 stars
          reviewCount: 84,
          fileSize: "12.8 MB",
          format: "Unity Package, C# Scripts",
        },
      ]);

      // Create diverse themed asset bundles
      await db.insert(assetBundles).values([
        {
          name: "Complete Indie Game Starter Pack",
          description: "Everything you need to create your first indie game! Includes music tracks, sound effects, UI elements, and essential scripts.",
          price: 4999, // $49.99
          originalPrice: 8999, // $89.99
          discount: 44,
          thumbnail: "https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [], // In production, these would reference actual asset IDs
          downloads: 1250,
          rating: 475, // 4.75 stars
          reviewCount: 89,
        },
        {
          name: "Premium AAA Audio Collection",
          description: "Professional-grade orchestral music and high-fidelity sound effects used by AAA studios. Premium quality guaranteed.",
          price: 9999, // $99.99
          originalPrice: 14999, // $149.99
          discount: 33,
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [],
          downloads: 456,
          rating: 495, // 4.95 stars
          reviewCount: 45,
        },
        {
          name: "Retro Gaming Nostalgia Pack",
          description: "Relive the golden age of gaming! 8-bit music, pixel art graphics, and classic sound effects that bring back the arcade memories.",
          price: 1499, // $14.99
          originalPrice: 2499, // $24.99
          discount: 40,
          thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [],
          downloads: 2340,
          rating: 465, // 4.65 stars
          reviewCount: 156,
        },
        {
          name: "Mobile Game Development Kit",
          description: "Optimized assets specifically for mobile games. Includes performance tools, mobile-friendly graphics, and lightweight audio.",
          price: 3999, // $39.99
          originalPrice: 5999, // $59.99
          discount: 33,
          thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [],
          downloads: 890,
          rating: 450, // 4.5 stars
          reviewCount: 67,
        },
        {
          name: "Fantasy RPG Master Collection",
          description: "Epic fantasy bundle with orchestral music, magical sound effects, medieval graphics, and advanced RPG systems.",
          price: 7999, // $79.99
          originalPrice: 12999, // $129.99
          discount: 38,
          thumbnail: "https://images.unsplash.com/photo-1520637736862-4d197d17c17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [],
          downloads: 678,
          rating: 485, // 4.85 stars
          reviewCount: 112,
        },
        {
          name: "Horror Game Atmosphere Bundle",
          description: "Send chills down your players' spines! Dark ambient music, terrifying sound effects, and haunting visual elements.",
          price: 2999, // $29.99
          thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          assetIds: [],
          downloads: 1120,
          rating: 440, // 4.4 stars
          reviewCount: 78,
        },
      ]);

      console.log("Sample data initialized successfully");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    }, `getUser(${id})`);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    }, `getUserByUsername(${username})`);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    }, `getUserByEmail(${email})`);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.executeWithRetry(async () => {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    }, `createUser(${insertUser.username})`);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    return this.executeWithRetry(async () => {
      // Don't allow updating id, password directly, or createdAt through this method
      const { id: _, password, createdAt, ...allowedUpdates } = updates;
      
      const [user] = await db.update(users)
        .set(allowedUpdates)
        .where(eq(users.id, id))
        .returning();
      return user;
    }, `updateUser(${id})`);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return result[0];
    }, `getProject(${id})`);
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(projects).where(eq(projects.ownerId, userId)).orderBy(desc(projects.lastUpdated));
      return result;
    }, `getProjectsByUserId(${userId})`);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(projects).orderBy(desc(projects.lastUpdated));
      return result;
    }, 'getAllProjects');
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    return this.executeWithRetry(async () => {
      const [project] = await db.insert(projects).values({
        ...insertProject,
        lastUpdated: new Date(),
      }).returning();
      return project;
    }, `createProject(${insertProject.name})`);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    return this.executeWithRetry(async () => {
      const [project] = await db.update(projects)
        .set({
          ...updates,
          lastUpdated: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();
      return project;
    }, `updateProject(${id})`);
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
      return result.length > 0;
    }, `deleteProject(${id})`);
  }

  async getMetricsByUserId(userId: string): Promise<Metrics | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(metrics).where(eq(metrics.userId, userId)).limit(1);
      return result[0];
    }, `getMetricsByUserId(${userId})`);
  }

  async updateMetrics(userId: string, updates: Partial<InsertMetrics>): Promise<Metrics> {
    return this.executeWithRetry(async () => {
      // Try to update existing metrics first
      const [existingMetric] = await db.update(metrics)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(metrics.userId, userId))
        .returning();

      if (existingMetric) {
        return existingMetric;
      }

      // If no existing metrics, create new ones
      const [newMetric] = await db.insert(metrics).values({
        userId,
        activeProjects: 0,
        teamMembers: 0,
        assetsCreated: 0,
        gamesPublished: 0,
        revenue: 0,
        ...updates,
      }).returning();

      return newMetric;
    }, `updateMetrics(${userId})`);
  }

  // Asset Store operations
  async getAllAssets(): Promise<Asset[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(assets).orderBy(desc(assets.createdAt));
      return result;
    }, 'getAllAssets');
  }

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(assets).where(eq(assets.category, category)).orderBy(desc(assets.createdAt));
      return result;
    }, `getAssetsByCategory(${category})`);
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
      return result[0];
    }, `getAsset(${id})`);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    return this.executeWithRetry(async () => {
      const [asset] = await db.insert(assets).values({
        ...insertAsset,
        updatedAt: new Date(),
      }).returning();
      return asset;
    }, `createAsset(${insertAsset.name})`);
  }

  async getAllBundles(): Promise<AssetBundle[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(assetBundles).orderBy(desc(assetBundles.createdAt));
      return result;
    }, 'getAllBundles');
  }

  async getBundle(id: string): Promise<AssetBundle | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(assetBundles).where(eq(assetBundles.id, id)).limit(1);
      return result[0];
    }, `getBundle(${id})`);
  }

  async createBundle(insertBundle: InsertAssetBundle): Promise<AssetBundle> {
    return this.executeWithRetry(async () => {
      const [bundle] = await db.insert(assetBundles).values({
        ...insertBundle,
        updatedAt: new Date(),
      }).returning();
      return bundle;
    }, `createBundle(${insertBundle.name})`);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
      return result;
    }, `getCartItems(${userId})`);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    return this.executeWithRetry(async () => {
      const [cartItem] = await db.insert(cartItems).values(insertCartItem).returning();
      return cartItem;
    }, `addToCart(${insertCartItem.userId})`);
  }

  async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await db.delete(cartItems).where(eq(cartItems.id, itemId)).returning({ id: cartItems.id });
      return result.length > 0;
    }, `removeFromCart(${userId}, ${itemId})`);
  }

  async clearCart(userId: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning({ id: cartItems.id });
      return result.length > 0;
    }, `clearCart(${userId})`);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    return this.executeWithRetry(async () => {
      const [purchase] = await db.insert(purchases).values(insertPurchase).returning();
      return purchase;
    }, `createPurchase(${insertPurchase.userId})`);
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
      return result;
    }, `getPurchasesByUserId(${userId})`);
  }

  // Game Library operations
  async getGameLibraryByUserId(userId: string): Promise<GameLibrary[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(gameLibrary).where(eq(gameLibrary.userId, userId)).orderBy(desc(gameLibrary.purchasedAt));
      return result;
    }, `getGameLibraryByUserId(${userId})`);
  }

  async addToGameLibrary(insertItem: InsertGameLibrary): Promise<GameLibrary> {
    return this.executeWithRetry(async () => {
      const [item] = await db.insert(gameLibrary).values(insertItem).returning();
      return item;
    }, `addToGameLibrary(${insertItem.userId})`);
  }

  // Buttonz Chat operations
  async getAllChats(): Promise<Chat[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(chats).orderBy(desc(chats.createdAt));
      return result;
    }, 'getAllChats');
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
      return result[0];
    }, `getChat(${id})`);
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(chats).where(eq(chats.createdBy, userId)).orderBy(desc(chats.createdAt));
      return result;
    }, `getChatsByUserId(${userId})`);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    return this.executeWithRetry(async () => {
      const [chat] = await db.insert(chats).values({
        ...insertChat,
        updatedAt: new Date(),
      }).returning();
      return chat;
    }, `createChat(${insertChat.name})`);
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<Chat | undefined> {
    return this.executeWithRetry(async () => {
      // Only allow updating mutable fields, preserve immutable ones
      const { id: _id, createdBy: _createdBy, createdAt: _createdAt, ...allowedUpdates } = updates;
      
      const [updatedChat] = await db.update(chats)
        .set({
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .where(eq(chats.id, id))
        .returning();
      
      return updatedChat;
    }, `updateChat(${id})`);
  }

  async deleteChat(id: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      // Cascade delete related data
      await db.delete(messages).where(eq(messages.chatId, id));
      await db.delete(chatMembers).where(eq(chatMembers.chatId, id));
      
      const result = await db.delete(chats).where(eq(chats.id, id)).returning({ id: chats.id });
      return result.length > 0;
    }, `deleteChat(${id})`);
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(chatMembers).where(eq(chatMembers.chatId, chatId)).orderBy(desc(chatMembers.joinedAt));
      return result;
    }, `getChatMembers(${chatId})`);
  }

  async addChatMember(insertChatMember: InsertChatMember): Promise<ChatMember> {
    return this.executeWithRetry(async () => {
      // Check for existing membership to prevent duplicates
      const existing = await db.select().from(chatMembers)
        .where(and(
          eq(chatMembers.chatId, insertChatMember.chatId),
          eq(chatMembers.userId, insertChatMember.userId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        return existing[0]; // Return existing membership instead of creating duplicate
      }
      
      const [chatMember] = await db.insert(chatMembers).values(insertChatMember).returning();
      return chatMember;
    }, `addChatMember(${insertChatMember.chatId}, ${insertChatMember.userId})`);
  }

  async removeChatMember(chatId: string, userId: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await db.delete(chatMembers)
        .where(and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ))
        .returning({ id: chatMembers.id });
      return result.length > 0;
    }, `removeChatMember(${chatId}, ${userId})`);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select({
        id: chats.id,
        name: chats.name,
        description: chats.description,
        type: chats.type,
        isMainChat: chats.isMainChat,
        createdBy: chats.createdBy,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
        .from(chats)
        .innerJoin(chatMembers, eq(chats.id, chatMembers.chatId))
        .where(eq(chatMembers.userId, userId))
        .orderBy(desc(chats.updatedAt));
      
      return result;
    }, `getUserChats(${userId})`);
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.createdAt))
        .limit(limit || 50)
        .offset(offset || 0);
      return result;
    }, `getMessages(${chatId})`);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    return this.executeWithRetry(async () => {
      const [message] = await db.insert(messages).values(insertMessage).returning();
      return message;
    }, `createMessage(${insertMessage.chatId})`);
  }

  async updateMessage(id: string, content: string): Promise<Message | undefined> {
    return this.executeWithRetry(async () => {
      const [updatedMessage] = await db.update(messages)
        .set({
          content,
          editedAt: new Date(),
        })
        .where(eq(messages.id, id))
        .returning();
      
      return updatedMessage;
    }, `updateMessage(${id})`);
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await db.delete(messages).where(eq(messages.id, id)).returning({ id: messages.id });
      return result.length > 0;
    }, `deleteMessage(${id})`);
  }
}