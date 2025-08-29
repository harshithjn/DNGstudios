"use client"

import React from "react"
import { Plus, X } from "lucide-react"
import type { ScorePage } from "../hooks/useSupabase"

interface PageNavigationProps {
  pages: ScorePage[]
  currentPageIndex: number
  onPageChange: (pageIndex: number) => void
  onAddPage: () => void
  onRemovePage: (pageIndex: number) => void
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  currentPageIndex,
  onPageChange,
  onAddPage,
  onRemovePage,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Page Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto flex-1">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`group flex items-center min-w-0 rounded-t-lg border-b-2 transition-all duration-200 cursor-pointer ${
                index === currentPageIndex
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-transparent hover:border-gray-300 hover:bg-gray-50 text-gray-600"
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
                  className={`p-1 rounded-full transition-all duration-200 ${
                    index === currentPageIndex
                      ? "text-blue-600 hover:bg-blue-100"
                      : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
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
          onClick={onAddPage}
          className="ml-2 p-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-all duration-200 flex items-center gap-1"
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
