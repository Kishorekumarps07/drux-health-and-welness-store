"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Simple, stable implementation of a Slide-over (Sheet) for React 19
// Bypasses problematic library logic that injects scripts

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function Sheet({ children, open: controlledOpen, onOpenChange }: { 
  children: React.ReactNode, 
  open?: boolean, 
  onOpenChange?: (open: boolean) => void 
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SheetContext)
  if (!context) return null

  return (
    <button
      type="button"
      onClick={() => context.setOpen(true)}
      className={cn("focus:outline-none", className)}
      data-slot="sheet-trigger"
      {...props}
    >
      {children}
    </button>
  )
}

function SheetClose({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SheetContext)
  if (!context) return null

  return (
    <button
      type="button"
      onClick={() => context.setOpen(false)}
      className={cn("focus:outline-none", className)}
      data-slot="sheet-close"
      {...props}
    >
      {children}
    </button>
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
}: {
  className?: string
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const context = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (context?.open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [context?.open])

  if (!mounted || !context?.open) return null

  const sideClasses = {
    top: "inset-x-0 top-0 h-auto border-b animate-in slide-in-from-top duration-300",
    bottom: "inset-x-0 bottom-0 h-auto border-t animate-in slide-in-from-bottom duration-300",
    left: "inset-y-0 left-0 h-full w-3/4 border-r animate-in slide-in-from-left duration-300 sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l animate-in slide-in-from-right duration-300 sm:max-w-sm",
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex" data-slot="sheet-portal">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => context.setOpen(false)}
        role="presentation"
      />
      {/* Content panel */}
      <div
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-white p-6 shadow-xl",
          sideClasses[side],
          className
        )}
        data-slot="sheet-content"
      >
        {children}
        {showCloseButton && (
          <button
            onClick={() => context.setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
