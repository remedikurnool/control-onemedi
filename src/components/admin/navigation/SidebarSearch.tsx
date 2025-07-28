
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { navItems } from '@/nav-items';

interface SidebarSearchProps {
  onNavigate?: () => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const filteredItems = useMemo(() => {
    if (!searchValue) return navItems;
    return navItems.filter(item =>
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.url.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
    setSearchValue('');
    onNavigate?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-3">
          <Search className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Search pages...</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-[400px]">
        <Command>
          <CommandInput 
            placeholder="Search admin pages..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
            <CommandGroup heading="Admin Pages">
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => handleSelect(item.url)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SidebarSearch;
