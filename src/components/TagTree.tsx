import { useState } from 'react'
import { TagNode, sortTagNodes } from '@/lib/tag-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TagTreeProps {
  tree: TagNode
  selectedTags: string[]
  onTagClick: (tagPath: string) => void
}

export function TagTree({ tree, selectedTags, onTagClick }: TagTreeProps) {
  return (
    <div className="space-y-1">
      {sortTagNodes(tree.children).map(node => (
        <TagTreeNode
          key={node.fullPath}
          node={node}
          selectedTags={selectedTags}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  )
}

interface TagTreeNodeProps {
  node: TagNode
  selectedTags: string[]
  onTagClick: (tagPath: string) => void
}

function TagTreeNode({ node, selectedTags, onTagClick }: TagTreeNodeProps) {
  const [expanded, setExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hasChildren = node.children.size > 0
  const isSelected = selectedTags.includes(node.fullPath)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('tagPath', node.fullPath)
    e.dataTransfer.effectAllowed = 'copy'
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 group">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-muted/50 transition-all"
            onClick={() => setExpanded(!expanded)}
          >
            <CaretRight
              size={16}
              weight="bold"
              className={cn(
                'transition-all duration-200 text-muted-foreground group-hover:text-foreground',
                expanded && 'rotate-90 text-accent'
              )}
            />
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 justify-between h-9 px-3 text-sm cursor-grab active:cursor-grabbing transition-all duration-200 font-medium',
            isSelected && 'bg-accent/20 text-accent border-l-2 border-accent shadow-sm',
            !isSelected && 'hover:bg-muted/50 hover:text-foreground',
            isDragging && 'opacity-40 scale-95'
          )}
          onClick={() => onTagClick(node.fullPath)}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <span className="truncate">{node.name}</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 h-6 px-2 text-xs font-semibold transition-all",
              isSelected && "bg-accent/30 text-accent border-accent/40"
            )}
          >
            {node.count}
          </Badge>
        </Button>
      </div>
      {hasChildren && expanded && (
        <div className="ml-6 mt-1.5 space-y-1.5 border-l-2 border-border/30 pl-3 relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 to-transparent"></div>
          {sortTagNodes(node.children).map(child => (
            <TagTreeNode
              key={child.fullPath}
              node={child}
              selectedTags={selectedTags}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
