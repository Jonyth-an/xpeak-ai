"use client"

import Link from "next/link"
import { Card, Button, Text } from "@/app/components/ui"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

const testPages = [
  {
    title: "Unified Button System Overview",
    description: "Overview and documentation of the unified button system, including design rationale and usage patterns.",
    path: "/test/button-overview",
    category: "Design System"
  },
  {
    title: "Design Tokens Demo",
    description: "Interactive showcase of all design tokens, utilities, and semantic components",
    path: "/test/design-tokens-demo",
    category: "Design System"
  },
  {
    title: "AsChild Pattern Demo",
    description: "Interactive showcase of the asChild pattern implementation, demonstrating flexible component rendering",
    path: "/test/asChild-demo",
    category: "Design System"
  },
  {
    title: "Optimistic UI Test",
    description: "Test optimistic UI updates and error handling",
    path: "/test/optimistic",
    category: "UI/UX"
  },
  {
    title: "shadcn/ui Integration Test",
    description: "Test integration between shadcn/ui and custom design tokens",
    path: "/test/shadcn",
    category: "UI/UX"
  },
  {
    title: "Supabase Client Test",
    description: "Test Supabase connection and authentication",
    path: "/test/supabase",
    category: "Backend"
  },
  {
    title: "Word Maze Test",
    description: "Test Word Maze functionality and enhanced tags",
    path: "/test/word-maze",
    category: "Features"
  },
  {
    title: "Sagea Animation",
    description: "Test Sagea animation and orbital learning journey",
    path: "/test/sagea-animation",
    category: "Features"
  }
]

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent py-token-2xl">
      <div className="max-w-7xl mx-auto px-token-md">
        <div className="text-center mb-token-2xl">
          <Text variant="h1" as="h1" className="mb-token-md">🧪 Test & Demo Pages</Text>
          <Text variant="lead" className="text-token-text-tertiary max-w-2xl mx-auto">
            Welcome to the test dashboard. Here you can find all the test and demo pages 
            for development and testing purposes.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-lg">
          {testPages.map((page) => (
            <Link key={page.path} href={page.path} className="group">
              <Card className="p-token-lg hover:shadow-token-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-token-surface/80 backdrop-blur-sm border-2 border-token-border">
                <div className="flex items-start justify-between mb-token-md">
                  <Text variant="h3" as="h3" className="text-token-xl font-token-semibold text-token-text">
                    {page.title}
                  </Text>
                  <span className="text-token-xs px-token-sm py-token-xs bg-token-primary/10 text-token-primary rounded-token-full">
                    {page.category}
                  </span>
                </div>
                <Text variant="body" className="text-token-text-tertiary text-token-sm leading-relaxed">
                  {page.description}
                </Text>
                <div className="mt-token-lg text-token-primary text-token-sm font-token-medium group-hover:underline">
                  → View Test Page
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-token-2xl text-center">
          <Link href="/">
            <Button variant="primary" size="md" className="inline-flex">
              ← Back to Main Site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 