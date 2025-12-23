import { useState } from 'react'
import { TagNode, sortTagNodes } from '@/lib/tag-utils'
import { Button } from '@/components/ui/button'
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
  const [expanded, setExpanded] = useState(true)
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
      <div className="flex items-center gap-0.5">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            <CaretRight
              size={12}
              weight="bold"
              className={cn(
                'transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 justify-between h-7 px-2 text-xs cursor-grab active:cursor-grabbing font-medium',
            isSelected && 'bg-primary/15 text-primary',
            !isSelected && 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
            isDragging && 'opacity-40'
          )}
          onClick={() => onTagClick(node.fullPath)}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <span className="truncate">{node.name}</span>
          <span className={cn("ml-1.5 text-xs", isSelected ? "text-primary/80" : "text-muted-foreground/60")}>
            {node.count}
          </span>
        </Button>
      </div>
      {hasChildren && expanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-1.5">
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
