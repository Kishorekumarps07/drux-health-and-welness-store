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
  triggerRef: React.RefObject<any>
} | null>(null)

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: { 
  children: React.ReactNode, 
  open?: boolean, 
  onOpenChange?: (open: boolean) => void 
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen
  const triggerRef = React.useRef<any>(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
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
      ref={context.triggerRef}
      onClick={(e) => {
        props.onClick?.(e)
        context.setOpen(!context.open)
      }}
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
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })

  const updatePosition = React.useCallback(() => {
    if (!context?.triggerRef.current) return
    const rect = context.triggerRef.current.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft
    
    const top = rect.bottom + scrollTop + sideOffset
    const left = align === "end" 
      ? rect.right + scrollLeft 
      : align === "start" 
        ? rect.left + scrollLeft 
        : rect.left + scrollLeft + (rect.width / 2)

    setCoords({ top, left })
  }, [context?.triggerRef, sideOffset, align])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!context?.open) return

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        context?.triggerRef.current && !context.triggerRef.current.contains(event.target as Node)
      ) {
        context.setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [context?.open, updatePosition])

  if (!mounted || !context?.open) return null

  let transform = "none"
  if (align === "end") {
    transform = "translateX(-100%)"
  } else if (align === "center") {
    transform = "translateX(-50%)"
  }

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: `${coords.top}px`,
    left: `${coords.left}px`,
    right: "auto",
    transform,
    zIndex: 9999,
  }

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={dropdownStyle}
      data-slot="dropdown-menu-content"
    >
      {children}
    </div>,
    document.body
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
