'use client';

import { Menu, Settings } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent-primary flex items-center justify-center">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100">{APP_NAME}</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
