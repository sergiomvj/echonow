'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Bookmark,
  MoreHorizontal
} from 'lucide-react'
import { Article } from '@/types'
import { formatRelativeTime, getBiasColor, getBiasLabel, formatNumber } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLiked(!isLiked)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSaved(!isSaved)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    // Implement share functionality
  }

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="relative h-48 md:h-64">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20 flex items-center justify-center">
              <TrendingUp className="h-12 w-12 text-echo-cyan" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge variant="default">{article.category}</Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge 
              variant={article.biasScore < 0.3 ? 'success' : article.biasScore < 0.6 ? 'warning' : 'destructive'}
              className="text-xs"
            >
              {getBiasLabel(article.biasScore)}
            </Badge>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle className="line-clamp-2 group-hover:text-echo-cyan transition-colors">
            <Link href={`/article/${article.id}`}>
              {article.title}
            </Link>
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {article.summary}
          </p>
        </CardHeader>

        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {article.readTime}min
            </span>
            <span>{formatRelativeTime(article.createdAt)}</span>
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {formatNumber(article.viewCount)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`h-8 w-8 p-0 ${isSaved ? 'text-echo-cyan' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className="p-4 hover:shadow-md transition-all duration-200 group">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            {article.imageUrl ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-echo-cyan" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {article.category}
              </Badge>
              <Badge 
                variant={article.biasScore < 0.3 ? 'success' : article.biasScore < 0.6 ? 'warning' : 'destructive'}
                className="text-xs"
              >
                {getBiasLabel(article.biasScore)}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-echo-cyan transition-colors">
              <Link href={`/article/${article.id}`}>
                {article.title}
              </Link>
            </h3>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{formatRelativeTime(article.createdAt)}</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {formatNumber(article.viewCount)}
                </span>
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {formatNumber(article.likes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-echo-cyan/20 to-echo-amber/20 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-echo-cyan" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="default">{article.category}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge 
            variant={article.biasScore < 0.3 ? 'success' : article.biasScore < 0.6 ? 'warning' : 'destructive'}
            className="text-xs"
          >
            {getBiasLabel(article.biasScore)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 group-hover:text-echo-cyan transition-colors mb-2">
          <Link href={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {article.summary}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {article.readTime}min
          </span>
          <span>{formatRelativeTime(article.createdAt)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-7 w-7 p-0 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-7 w-7 p-0"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}