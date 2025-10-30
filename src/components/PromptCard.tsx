import { Prompt, Tag, Version } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash, Clock, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PromptCardProps {
  prompt: Prompt
  tags: Tag[]
  versions: Version[]
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onUsePrompt: (id: string) => void
}

export function PromptCard({ prompt, tags, versions, onEdit, onDelete, onUsePrompt }: PromptCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
    onUsePrompt(prompt.id)
    toast.success('Copied to clipboard')
  }

  const getTagColor = (tagPath: string) => {
    const tag = tags.find(t => t.name === tagPath)
    return tag?.color || '#888888'
  }

  return (
    <Card className="group hover:border-accent transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-1 truncate">{prompt.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              {prompt.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(prompt)}
            >
              <Pencil size={16} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{prompt.title}" and all its version history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(prompt.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: getTagColor(tag) + '20',
                  borderColor: getTagColor(tag),
                  color: getTagColor(tag)
                }}
              >
                {tag.split('/').pop()}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 font-mono">
          {prompt.content}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDistanceToNow(prompt.modifiedAt, { addSuffix: true })}
            </span>
            {versions.length > 0 && (
              <span>{versions.length + 1} version{versions.length > 0 ? 's' : ''}</span>
            )}
            <span className="flex items-center gap-1 text-accent font-medium">
              <Copy size={12} weight="fill" />
              {prompt.usageCount}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={handleCopy}
          >
            <Copy size={14} />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
