// ─────────────────────────────────────────────────────────────────
// BuildTok Database Seeder
// ─────────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Comment = require('../models/Comment');

// Initial mock users data (passwords will be hashed via User pre-save hook)
const mockUsers = [
  {
    name: 'Aryan Kapoor',
    username: 'aryanbuilds',
    email: 'aryan@buildtok.dev',
    password: 'password123',
    bio: 'Full-stack engineer. Building the future with React, Rust & AI. Ex-Google.',
    skills: ['React', 'Rust', 'TypeScript', 'Go', 'AWS'],
    isPro: true,
    verified: true,
    badge: 'Top Creator',
    location: 'San Francisco, CA',
    website: 'https://aryan.dev',
    github: 'aryankapoor',
  },
  {
    name: 'Priya Sharma',
    username: 'priyabuilds',
    email: 'priya@buildtok.dev',
    password: 'password123',
    bio: 'Design engineer & creative coder. Turning ideas into beautiful products.',
    skills: ['Figma', 'React', 'Three.js', 'CSS', 'Animation'],
    isPro: true,
    verified: true,
    badge: 'Design Pro',
    location: 'Bangalore, India',
    website: 'https://priya.design',
    github: 'priyasharma',
  },
  {
    name: 'Zaid Hassan',
    username: 'zaiddev',
    email: 'zaid@buildtok.dev',
    password: 'password123',
    bio: 'AI/ML engineer building intelligent systems. Stanford CS dropout.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Go', 'Kubernetes'],
    isPro: false,
    verified: true,
    badge: 'AI Pioneer',
    location: 'London, UK',
    website: 'https://zaid.ai',
    github: 'zaidhassan',
  },
  {
    name: 'Sofia Chen',
    username: 'sofiaships',
    email: 'sofia@buildtok.dev',
    password: 'password123',
    bio: 'Indie hacker. Solo built 3 profitable SaaS. Love Swift & beautiful UIs.',
    skills: ['Swift', 'Kotlin', 'Flutter', 'Firebase', 'Figma'],
    isPro: true,
    verified: true,
    badge: 'Indie Legend',
    location: 'Tokyo, Japan',
    website: 'https://sofia.app',
    github: 'sofiachendev',
  },
  {
    name: 'Marcus Williams',
    username: 'marcusw3b',
    email: 'marcus@buildtok.dev',
    password: 'password123',
    bio: 'Web3 & DeFi builder. Solidity enthusiast. Protocol researcher.',
    skills: ['Solidity', 'Rust', 'React', 'Ethereum', 'TypeScript'],
    isPro: false,
    verified: false,
    badge: 'Web3 Builder',
    location: 'Amsterdam, Netherlands',
    website: 'https://marcus.eth',
    github: 'marcusw3b',
  },
  {
    name: 'Aisha Patel',
    username: 'aishacodes',
    email: 'aisha@buildtok.dev',
    password: 'password123',
    bio: 'Robotics & embedded systems. Making robots dance with Python & C++.',
    skills: ['Python', 'C++', 'ROS', 'Raspberry Pi', 'TensorFlow'],
    isPro: true,
    verified: true,
    badge: 'Robotics Pro',
    location: 'MIT, Cambridge',
    website: 'https://aisha.bot',
    github: 'aishapatel',
  },
];

// Initial mock projects data
const mockProjectsRaw = [
  {
    title: 'NeuroChat AI',
    description: 'Real-time AI chat platform powered by GPT-4 Turbo with memory, personalization, and multi-modal inputs. Built with Next.js 14 and streaming responses.',
    techStack: ['Next.js', 'TypeScript', 'Python', 'TensorFlow', 'Redis'],
    githubLink: 'https://github.com/aryankapoor/neurochat',
    liveDemoLink: 'https://neurochat.aryan.dev',
    views: 89000,
    category: 'AI',
    trending: true,
    featured: true,
    tags: ['AI', 'Chat', 'GPT-4', 'Realtime'],
    creatorIndex: 0, // Aryan
  },
  {
    title: 'Orbital Design System',
    description: 'A complete, production-ready design system with 200+ components, full Figma kit, and React library. Used by 50+ startups worldwide.',
    techStack: ['React', 'TypeScript', 'Figma', 'Storybook', 'TailwindCSS'],
    githubLink: 'https://github.com/priyasharma/orbital',
    liveDemoLink: 'https://orbital.priya.design',
    views: 241000,
    category: 'Design',
    trending: true,
    featured: true,
    tags: ['Design System', 'React', 'Open Source'],
    creatorIndex: 1, // Priya
  },
  {
    title: 'Tensor Studio',
    description: 'Visual ML model builder that lets you drag-and-drop layers and train models in the browser. No code needed. WebGPU-accelerated.',
    techStack: ['Python', 'TensorFlow', 'WebAssembly', 'React', 'WebGL'],
    githubLink: 'https://github.com/zaidhassan/tensorstudio',
    liveDemoLink: 'https://tensorstudio.zaid.ai',
    views: 67000,
    category: 'AI',
    trending: true,
    featured: false,
    tags: ['Machine Learning', 'Visual', 'No-Code', 'WebGPU'],
    creatorIndex: 2, // Zaid
  },
  {
    title: 'SwiftPay — Mobile Banking',
    description: 'A beautifully designed mobile banking app with instant transfers, spending analytics, and AI-powered financial insights. Built fully in SwiftUI.',
    techStack: ['Swift', 'SwiftUI', 'Firebase', 'Core ML', 'Stripe'],
    githubLink: 'https://github.com/sofiachendev/swiftpay',
    liveDemoLink: 'https://apps.apple.com/swiftpay',
    views: 312000,
    category: 'Mobile',
    trending: true,
    featured: true,
    tags: ['iOS', 'Banking', 'SwiftUI', 'FinTech'],
    creatorIndex: 3, // Sofia
  },
  {
    title: 'DeFi Vault Protocol',
    description: 'An audited DeFi yield aggregator with auto-compounding strategies. $2.8M TVL. Supports 12 protocols across Ethereum and Polygon.',
    techStack: ['Solidity', 'React', 'TypeScript', 'Ethereum', 'Hardhat'],
    githubLink: 'https://github.com/marcusw3b/defivault',
    liveDemoLink: 'https://defivault.marcus.eth',
    views: 48000,
    category: 'Blockchain',
    trending: false,
    featured: false,
    tags: ['DeFi', 'Ethereum', 'Smart Contracts', 'Yield'],
    creatorIndex: 4, // Marcus
  },
  {
    title: 'ArmBot Vision System',
    description: 'An open-source 6-DOF robotic arm with real-time computer vision for object detection, grasping, and autonomous sorting. Runs on Raspberry Pi 4.',
    techStack: ['Python', 'C++', 'ROS', 'TensorFlow', 'OpenCV'],
    githubLink: 'https://github.com/aishapatel/armbot',
    liveDemoLink: 'https://aisha.bot/armbot',
    views: 134000,
    category: 'Robotics',
    trending: true,
    featured: true,
    tags: ['Robotics', 'Computer Vision', 'Open Source', 'Hardware'],
    creatorIndex: 5, // Aisha
  },
  {
    title: 'Astro CMS',
    description: 'A headless CMS built for developers. Real-time collaborative editing, Git-based versioning, and instant edge deployment. 10x faster than Contentful.',
    techStack: ['Go', 'React', 'PostgreSQL', 'Redis', 'Docker'],
    githubLink: 'https://github.com/aryankapoor/astrocms',
    liveDemoLink: 'https://astrocms.aryan.dev',
    views: 56000,
    category: 'Web Development',
    trending: false,
    featured: false,
    tags: ['CMS', 'Headless', 'Go', 'Real-time'],
    creatorIndex: 0, // Aryan
  },
  {
    title: 'Lumina — 3D Portfolio Builder',
    description: 'A drag-and-drop 3D portfolio builder using Three.js and WebGL. Create stunning spatial portfolios in minutes. 4,000+ portfolios created.',
    techStack: ['Three.js', 'React', 'TypeScript', 'WebGL', 'Vercel'],
    githubLink: 'https://github.com/priyasharma/lumina',
    liveDemoLink: 'https://lumina.priya.design',
    views: 478000,
    category: 'Design',
    trending: true,
    featured: true,
    tags: ['3D', 'Portfolio', 'Three.js', 'Creative'],
    creatorIndex: 1, // Priya
  },
];

const seedDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buildtok';
  console.log(`Connecting to database: ${MONGO_URI}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding.');

    // 1. Clear existing collection data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Comment.deleteMany({});
    console.log('✨ Database cleared.');

    // 2. Create Users
    console.log('👤 Seeding users...');
    const createdUsers = [];
    for (const uData of mockUsers) {
      const newUser = new User(uData);
      await newUser.save();
      createdUsers.push(newUser);
      console.log(`   Created user: @${newUser.username}`);
    }

    // Add some followers/following relationships
    console.log('👥 Establishing follow networks...');
    // Aryan (0) follows Priya (1), Zaid (2), Aisha (5)
    // Priya (1) follows Aryan (0), Sofia (3)
    // Sofia (3) follows Aryan (0), Priya (1)
    // Aisha (5) follows Aryan (0), Priya (1), Zaid (2), Sofia (3)
    const followPairs = [
      [0, 1], [0, 2], [0, 5],
      [1, 0], [1, 3],
      [3, 0], [3, 1],
      [5, 0], [5, 1], [5, 2], [5, 3]
    ];

    for (const [followerIdx, followedIdx] of followPairs) {
      const follower = createdUsers[followerIdx];
      const followed = createdUsers[followedIdx];
      follower.following.push(followed._id);
      followed.followers.push(follower._id);
    }

    // Save users with follow relations updated
    for (const user of createdUsers) {
      await user.save();
    }
    console.log('   Follow relationships updated.');

    // 3. Create Projects
    console.log('📹 Seeding projects...');
    const createdProjects = [];
    for (const pData of mockProjectsRaw) {
      const creator = createdUsers[pData.creatorIndex];
      const projectDoc = new Project({
        ...pData,
        creator: creator._id,
        // Mock video and thumbnail URLs using public placeholder images/videos
        videoUrl: {
          url: 'https://res.cloudinary.com/demo/video/upload/c_scale,h_300/dog.mp4',
          publicId: 'demo/dog',
        },
        thumbnail: {
          url: 'https://picsum.photos/400/600',
          publicId: 'placeholder_picsum',
        },
      });

      // Set some random likes and saves among the seeded users
      createdUsers.forEach((usr, index) => {
        // Liked/saved by random users
        if ((index + pData.creatorIndex) % 2 === 0) {
          projectDoc.likes.push(usr._id);
        }
        if ((index + pData.creatorIndex) % 3 === 0) {
          projectDoc.saves.push(usr._id);
          usr.savedProjects.push(projectDoc._id);
        }
      });

      await projectDoc.save();
      createdProjects.push(projectDoc);
      console.log(`   Created project: "${projectDoc.title}" by @${creator.username}`);
    }

    // Resave users to persist their savedProjects list
    for (const user of createdUsers) {
      await user.save();
    }

    // 4. Create Comments
    console.log('💬 Seeding comments...');
    // Comment structures:
    // Project 0 (NeuroChat AI) comments
    const p0 = createdProjects[0];
    const commentsList = [
      {
        user: createdUsers[1], // Priya
        text: 'This is absolutely insane. The streaming responses are so smooth! How did you handle the WebSocket reconnection logic?',
        likes: [createdUsers[0]._id, createdUsers[2]._id],
        replies: [
          {
            user: createdUsers[0], // Aryan
            text: 'Thanks! Used Exponential backoff with jitter. Happy to write a blog post on it 🙌',
            likes: [createdUsers[1]._id],
          }
        ]
      },
      {
        user: createdUsers[2], // Zaid
        text: 'Just starred on GitHub. The Redis caching strategy is genius. This is going to scale beautifully.',
        likes: [createdUsers[0]._id],
        replies: []
      },
      {
        user: createdUsers[3], // Sofia
        text: 'Perfect timing — we were looking for something exactly like this at work. How does the memory system handle context window limits?',
        likes: [createdUsers[1]._id, createdUsers[5]._id],
        replies: []
      },
      {
        user: createdUsers[5], // Aisha
        text: 'Incredible work! The UI is so clean. Love how you designed the message threading. Shipping this to production soon?',
        likes: [],
        replies: []
      }
    ];

    for (const cData of commentsList) {
      const commentDoc = new Comment({
        project: p0._id,
        user: cData.user._id,
        text: cData.text,
        likes: cData.likes,
      });
      await commentDoc.save();

      // Create nested replies
      for (const rData of cData.replies) {
        const replyDoc = new Comment({
          project: p0._id,
          user: rData.user._id,
          text: rData.text,
          likes: rData.likes,
          parentComment: commentDoc._id,
        });
        await replyDoc.save();

        commentDoc.replies.push(replyDoc._id);
      }

      if (commentDoc.replies.length > 0) {
        await commentDoc.save();
      }
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  }
};

seedDB();
