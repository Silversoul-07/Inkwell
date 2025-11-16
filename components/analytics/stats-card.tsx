'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: ReactNode
  description?: string
  trend?: 'up' | 'down'
}

export function StatsCard({ title, value, icon, description, trend }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend && (
          <div className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
