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
      <div className="flex items-center gap-1 group">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => setExpanded(!expanded)}
          >
            <CaretRight
              size={14}
              weight="bold"
              className={cn(
                'transition-transform text-muted-foreground',
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
            'flex-1 justify-between h-8 px-2 text-sm cursor-grab active:cursor-grabbing font-medium',
            isSelected && 'bg-accent/10 text-accent',
            !isSelected && 'hover:bg-muted hover:text-foreground',
            isDragging && 'opacity-40'
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
              "ml-2 h-5 px-1.5 text-xs font-semibold",
              isSelected && "bg-accent/20 text-accent"
            )}
          >
            {node.count}
          </Badge>
        </Button>
      </div>
      {hasChildren && expanded && (
        <div className="ml-5 mt-1 space-y-1 border-l border-border pl-2">
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
