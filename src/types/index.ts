export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'premium' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  authorType: 'ai' | 'human';
  biasScore: number;
  viewCount: number;
  likes: number;
  shares: number;
  sourceUrl?: string;
  imageUrl?: string;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
  isExclusive?: boolean;
  historicalComparison?: HistoricalComparison[];
}

export interface Short {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  articleId: string;
  category: string;
  tags: string[];
  viewCount: number;
  likes: number;
  shares: number;
  createdAt: Date;
}

export interface HistoricalComparison {
  id: string;
  title: string;
  description: string;
  year: number;
  relevanceScore: number;
  sourceUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
}

export interface Filter {
  type: 'region' | 'theme' | 'timeframe' | 'bias';
  value: string;
  label: string;
}

export interface ContentRequest {
  topic: string;
  type: 'article' | 'short' | 'analysis';
  customPrompt?: string;
  filters?: Filter[];
  userId: string;
}

export interface Community {
  suggestions: TopicSuggestion[];
  votes: Vote[];
  reactions: Reaction[];
}

export interface TopicSuggestion {
  id: string;
  title: string;
  description: string;
  userId: string;
  votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  createdAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  suggestionId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

export interface Reaction {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'article' | 'short';
  type: 'like' | 'share' | 'save' | 'bias-report';
  createdAt: Date;
}

export interface AIPrompt {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'short' | 'analysis';
  userId: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'premium' | 'pro';
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    aiGenerations: number;
    customPrompts: number;
    downloads: number;
  };
}

export interface Analytics {
  totalViews: number;
  totalShares: number;
  totalLikes: number;
  topCategories: { name: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  contentPerformance: { id: string; title: string; metric: number }[];
}