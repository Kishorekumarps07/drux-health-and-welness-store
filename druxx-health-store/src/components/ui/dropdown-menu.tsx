"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronRight, Circle } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Simple, stable implementation of a Dropdown Menu for React 19
// Bypasses problematic library logic that injects scripts

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: { 
  children: React.ReactNode, 
  open?: boolean, 
  onOpenChange?: (open: boolean) => void 
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left" data-slot="dropdown-menu">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({ 
  children, 
  className, 
  asChild = false,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) return null

  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn("focus:outline-none cursor-pointer", className)}
      data-slot="dropdown-menu-trigger"
      {...props}
    >
      {children}
    </Comp>
  )
}

function DropdownMenuContent({
  className,
  children,
  sideOffset = 4,
  align = "center",
}: {
  className?: string
  children: React.ReactNode
  sideOffset?: number
  align?: "start" | "center" | "end"
}) {
  const context = React.useContext(DropdownMenuContext)
  const [mounted, setMounted] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        context?.setOpen(false)
      }
    }
    if (context?.open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [context?.open])

  if (!mounted || !context?.open) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute right-0 z-50 mt-2 min-w-[8rem] origin-top-right overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{ top: "100%", marginTop: sideOffset }}
      data-slot="dropdown-menu-content"
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({
  className,
  children,
  onClick,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) {
  const context = React.useContext(DropdownMenuContext)
  
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e)
        context?.setOpen(false)
      }}
      data-slot="dropdown-menu-item"
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean
}) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}

function DropdownMenuGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dropdown-menu-group" {...props}>{children}</div>
}

// Minimal implementation of submenus and other variants for compatibility
function DropdownMenuPortal({ children }: { children: React.ReactNode }) { return <>{children}</>; }
function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
}
