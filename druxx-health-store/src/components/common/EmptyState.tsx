"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center",
      "bg-white rounded-[2.5rem] border border-gray-100",
      className
    )}>
      <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mb-6 text-[#A6D608]">
        <Icon size={40} />
      </div>
      <h2 className="font-heading font-black text-2xl text-[#1E1E1E] mb-2">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-8">{description}</p>
      
      {action && (
        action.href ? (
          <Button asChild className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-2xl h-12 px-8">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button 
            onClick={action.onClick}
            className="bg-[#A6D608] hover:bg-[#8ab506] text-[#1E1E1E] font-bold rounded-2xl h-12 px-8"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
};
