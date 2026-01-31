"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { cn } from "@/lib/utils"


const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    rotateX: 40,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 15,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    rotateX: 10,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.1,
    }
  }
};

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
        "outline-none",
        className
      )}
      asChild
      {...props}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex items-center gap-2 cursor-pointer"
      >
        {children}
      </motion.div>
    </DropdownMenuPrimitive.Trigger>
  )
}

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  className?: string;
  sideOffset?: number;
  children?: React.ReactNode;
  maxHeight?: string | number;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  maxHeight = "100vh", // Adjusted for mobile menu potential
  children,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <AnimatePresence>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          className="z-50"
          asChild
          {...props}
        >
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "w-72 rounded-xl border shadow-xl overflow-hidden [perspective:800px] [transform-style:preserve-3d]",
              "bg-white/95 border-neutral-900/10 backdrop-blur-md", // Increased opacity for better readability
              "dark:bg-neutral-900/95 dark:border-neutral-50/10",
              className
            )}
            style={{
              transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
            }}
          >
            <div className={cn(
              "absolute inset-0 z-0",
              "bg-gradient-to-br from-indigo-500/5 to-purple-500/5",
              "dark:from-indigo-500/10 dark:to-purple-500/10"
            )} />

            <div className="absolute inset-0 backdrop-blur-sm z-10" />

            <div
              className="relative z-20 overflow-y-auto scrollbar-none p-2"
              style={{
                maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
              }}
            >
              {children}
            </div>
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </AnimatePresence>
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus:bg-neutral-100 focus:text-neutral-900",
        "dark:focus:bg-neutral-800 dark:focus:text-neutral-50",
        inset && "pl-8",
        className
      )}
      asChild
      {...props}
    >
        <motion.div variants={itemVariants} className="w-full flex items-center">
            {children}
        </motion.div>
    </DropdownMenuPrimitive.Item>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-neutral-100 dark:bg-neutral-800", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  // DropdownMenuCheckboxItem,
  // DropdownMenuRadioItem,
  // DropdownMenuSubTrigger,
  // DropdownMenuSubContent,
}
