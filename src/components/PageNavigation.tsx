"use client"

import React from "react"
import { Plus, X } from "lucide-react"
import type { ScorePage } from "../hooks/useLocalStorage"
import type { ScoreMode } from "./ModeSelector"

interface PageNavigationProps {
  pages: ScorePage[]
  currentPageIndex: number
  onPageChange: (pageIndex: number) => void
  onAddPage: () => void
  onRemovePage: (pageIndex: number) => void
  scoreMode: ScoreMode
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onRemovePage,
  scoreMode,
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Page Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto flex-1">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`group flex items-center min-w-0 rounded-lg transition-all duration-200 cursor-pointer ${
                index === currentPageIndex
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600"
              }`}
            >
              <button
                onClick={() => onPageChange(index)}
                className="flex items-center px-4 py-2 min-w-0 flex-1"
                title={page.title}
              >
                <span className="truncate text-sm font-medium">
                  {page.title}
                </span>
              </button>
              
              {/* Close button - only show on hover and if more than 1 page */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemovePage(index)
                  }}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    index === currentPageIndex
                      ? "text-slate-600 hover:bg-slate-200"
                      : "text-slate-400 hover:bg-slate-500 hover:text-white"
                  } opacity-0 group-hover:opacity-100`}
                  title="Close page"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Page Button */}
        <button
          onClick={() => {
            console.log('Add Page button clicked!')
            onAddPage()
          }}
          className="ml-4 px-4 py-2 rounded-lg text-white transition-all duration-200 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
          title="Add new page"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Page</span>
        </button>
      </div>
    </div>
  )
}

export default PageNavigation
