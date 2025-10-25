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
  const hasChildren = node.children.size > 0
  const isSelected = selectedTags.includes(node.fullPath)

  return (
    <div>
      <div className="flex items-center gap-1">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            <CaretRight
              size={14}
              className={cn(
                'transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </Button>
        )}
        {!hasChildren && <div className="w-5" />}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 justify-between h-7 px-2 text-xs',
            isSelected && 'bg-accent/20 text-accent-foreground'
          )}
          onClick={() => onTagClick(node.fullPath)}
        >
          <span className="truncate">{node.name}</span>
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
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
