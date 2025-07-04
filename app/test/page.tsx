"use client"

import Link from "next/link"
import { Card } from "@/app/components/ui"

const testPages = [
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🧪 Test & Demo Pages
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Welcome to the test dashboard. Here you can find all the test and demo pages 
            for development and testing purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testPages.map((page) => (
            <Link key={page.path} href={page.path}>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {page.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {page.category}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {page.description}
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  → View Test Page
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  )
} 