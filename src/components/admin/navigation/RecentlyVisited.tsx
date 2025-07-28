
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import { navItems } from '@/nav-items';

interface VisitedItem {
  url: string;
  title: string;
  visitedAt: string;
  visitCount: number;
}

interface RecentlyVisitedProps {
  compact?: boolean;
  maxItems?: number;
}

const RecentlyVisited: React.FC<RecentlyVisitedProps> = ({ compact = false, maxItems = 5 }) => {
  const [visitedPages, setVisitedPages] = useState<VisitedItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    const savedHistory = localStorage.getItem('admin-visit-history');
    if (savedHistory) {
      setVisitedPages(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const navItem = navItems.find(item => item.url === location.pathname);
    if (navItem && location.pathname !== '/admin') {
      const existingIndex = visitedPages.findIndex(item => item.url === location.pathname);
      let newHistory: VisitedItem[];

      if (existingIndex !== -1) {
        // Update existing item
        newHistory = [...visitedPages];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          visitedAt: new Date().toISOString(),
          visitCount: newHistory[existingIndex].visitCount + 1
        };
      } else {
        // Add new item
        const newItem: VisitedItem = {
          url: location.pathname,
          title: navItem.title,
          visitedAt: new Date().toISOString(),
          visitCount: 1
        };
        newHistory = [newItem, ...visitedPages];
      }

      // Sort by most recent visit and limit to 20 items
      newHistory = newHistory
        .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
        .slice(0, 20);

      setVisitedPages(newHistory);
      localStorage.setItem('admin-visit-history', JSON.stringify(newHistory));
    }
  }, [location.pathname, visitedPages]);

  const displayItems = visitedPages.slice(0, maxItems);

  if (compact) {
    return (
      <div className="space-y-2">
        {displayItems.map((item) => {
          const navItem = navItems.find(nav => nav.url === item.url);
          if (!navItem) return null;
          
          return (
            <Link
              key={item.url}
              to={item.url}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <navItem.icon className="w-4 h-4" />
              <span className="truncate">{item.title}</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {item.visitCount}
              </Badge>
            </Link>
          );
        })}
        {displayItems.length === 0 && (
          <p className="text-sm text-muted-foreground px-3">No recent visits</p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recently Visited
        </CardTitle>
        <CardDescription>
          Your most recently accessed pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayItems.map((item) => {
            const navItem = navItems.find(nav => nav.url === item.url);
            if (!navItem) return null;
            
            return (
              <div
                key={item.url}
                className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <navItem.icon className="w-4 h-4" />
                <Link
                  to={item.url}
                  className="flex-1 text-sm hover:underline flex items-center gap-2"
                >
                  {item.title}
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.visitCount} visits
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.visitedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
          {displayItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent visits yet. Navigate to admin pages to see your history.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentlyVisited;
