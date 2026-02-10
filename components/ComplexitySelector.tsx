// Component: ComplexitySelector.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Zap } from 'lucide-react';
import { ComplexityLevels } from '@/hooks/useTemplates';

interface ComplexitySelectorProps {
  complexityLevels: ComplexityLevels;
  userAccuracy?: number; // User's past performance
  onSelect: (level: 'easy' | 'medium' | 'hard') => void;
}

export function ComplexitySelector({ 
  complexityLevels, 
  userAccuracy,
  onSelect 
}: ComplexitySelectorProps) {
  const [selected, setSelected] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // Recommend level based on past performance
  const getRecommendation = () => {
    if (!userAccuracy) return 'medium';
    if (userAccuracy >= complexityLevels.easy.targetAccuracy) return 'medium';
    if (userAccuracy >= complexityLevels.medium.targetAccuracy) return 'hard';
    if (userAccuracy < 50) return 'easy';
    return 'medium';
  };
  
  const recommended = getRecommendation();
  
  return (
    <div className="space-y-4 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Difficulty Level</h2>
        <p className="text-muted-foreground">
          Select a difficulty that matches your current understanding
        </p>
        {userAccuracy && (
          <Badge variant="outline" className="text-sm">
            Your Recent Accuracy: {userAccuracy}%
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EASY LEVEL */}
        <Card 
          className={`cursor-pointer transition-all ${
            selected === 'easy' 
              ? 'ring-2 ring-green-500 bg-green-50/50' 
              : 'hover:border-green-300'
          }`}
          onClick={() => setSelected('easy')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-700">
                {complexityLevels.easy.name}
              </CardTitle>
              {recommended === 'easy' && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
            <CardDescription>{complexityLevels.easy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-green-600" />
                <span>Target Accuracy: {complexityLevels.easy.targetAccuracy}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Best for: First-time learners, review of basics
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MEDIUM LEVEL */}
        <Card 
          className={`cursor-pointer transition-all ${
            selected === 'medium' 
              ? 'ring-2 ring-yellow-500 bg-yellow-50/50' 
              : 'hover:border-yellow-300'
          }`}
          onClick={() => setSelected('medium')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-yellow-700">
                {complexityLevels.medium.name}
              </CardTitle>
              {recommended === 'medium' && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
            <CardDescription>{complexityLevels.medium.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-yellow-600" />
                <span>Target Accuracy: {complexityLevels.medium.targetAccuracy}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Best for: Standard practice, typical exam prep
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HARD LEVEL */}
        <Card 
          className={`cursor-pointer transition-all ${
            selected === 'hard' 
              ? 'ring-2 ring-red-500 bg-red-50/50' 
              : 'hover:border-red-300'
          }`}
          onClick={() => setSelected('hard')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-700">
                {complexityLevels.hard.name}
              </CardTitle>
              {recommended === 'hard' && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
            <CardDescription>{complexityLevels.hard.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-red-600" />
                <span>Target Accuracy: {complexityLevels.hard.targetAccuracy}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Best for: Advanced prep, challenging scenarios
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onSelect(recommended)}>
          Use Recommended
        </Button>
        <Button onClick={() => onSelect(selected)}>
          Start with {complexityLevels[selected].name}
        </Button>
      </div>
    </div>
  );
}