
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff, X } from 'lucide-react';
import { navItems } from '@/nav-items';
import { toast } from 'sonner';

interface FavoriteItem {
  url: string;
  title: string;
  addedAt: string;
}

interface FavoritesManagerProps {
  currentPath?: string;
  compact?: boolean;
}

const FavoritesManager: React.FC<FavoritesManagerProps> = ({ currentPath, compact = false }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('admin-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    localStorage.setItem('admin-favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const isFavorite = (url: string) => favorites.some(fav => fav.url === url);

  const toggleFavorite = (url: string) => {
    const navItem = navItems.find(item => item.url === url);
    if (!navItem) return;

    if (isFavorite(url)) {
      const newFavorites = favorites.filter(fav => fav.url !== url);
      saveFavorites(newFavorites);
      toast.success(`Removed ${navItem.title} from favorites`);
    } else {
      const newFavorite: FavoriteItem = {
        url,
        title: navItem.title,
        addedAt: new Date().toISOString()
      };
      const newFavorites = [...favorites, newFavorite];
      saveFavorites(newFavorites);
      toast.success(`Added ${navItem.title} to favorites`);
    }
  };

  const removeFavorite = (url: string) => {
    const newFavorites = favorites.filter(fav => fav.url !== url);
    saveFavorites(newFavorites);
    const navItem = navItems.find(item => item.url === url);
    if (navItem) {
      toast.success(`Removed ${navItem.title} from favorites`);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {favorites.slice(0, 5).map((favorite) => {
          const navItem = navItems.find(item => item.url === favorite.url);
          if (!navItem) return null;
          
          return (
            <Link
              key={favorite.url}
              to={favorite.url}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <navItem.icon className="w-4 h-4" />
              <span className="truncate">{favorite.title}</span>
              <Star className="w-3 h-3 fill-current text-yellow-500 ml-auto" />
            </Link>
          );
        })}
        {favorites.length === 0 && (
          <p className="text-sm text-muted-foreground px-3">No favorites yet</p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Favorites
        </CardTitle>
        <CardDescription>
          Quick access to your most used pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentPath && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(currentPath)}
              className="gap-2"
            >
              {isFavorite(currentPath) ? (
                <>
                  <StarOff className="w-4 h-4" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Add to Favorites
                </>
              )}
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          {favorites.map((favorite) => {
            const navItem = navItems.find(item => item.url === favorite.url);
            if (!navItem) return null;
            
            return (
              <div
                key={favorite.url}
                className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <navItem.icon className="w-4 h-4" />
                <Link
                  to={favorite.url}
                  className="flex-1 text-sm hover:underline"
                >
                  {favorite.title}
                </Link>
                <Badge variant="secondary" className="text-xs">
                  {new Date(favorite.addedAt).toLocaleDateString()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFavorite(favorite.url)}
                  className="p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
          {favorites.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No favorites yet. Add pages to your favorites for quick access.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoritesManager;
