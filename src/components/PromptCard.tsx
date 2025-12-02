import { useState } from 'react'
import { Prompt, Tag, Version } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash, Clock, Copy, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PromptCardProps {
  prompt: Prompt
  tags: Tag[]
  versions: Version[]
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onUsePrompt: (id: string) => void
  onTagAssigned?: (promptId: string, tagPath: string) => void
}

export function PromptCard({ prompt, tags, versions, onEdit, onDelete, onUsePrompt, onTagAssigned }: PromptCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    onUsePrompt(prompt.id)
    toast.success('Copied to clipboard')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const tagPath = e.dataTransfer.getData('tagPath')
    if (tagPath && onTagAssigned && !prompt.tags.includes(tagPath)) {
      onTagAssigned(prompt.id, tagPath)
    }
  }

  const getTagColor = (tagPath: string) => {
    const tag = tags.find(t => t.name === tagPath)
    return tag?.color || '#888888'
  }

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)
  const currentVersion = versions.length + 1

  return (
    <>
      <Card 
        className={cn(
          "group hover:border-accent transition-colors cursor-pointer relative",
          isDragOver && "border-accent ring-2 ring-accent/50 bg-accent/5"
        )}
        onClick={() => setShowDetails(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg border-2 border-accent border-dashed pointer-events-none">
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium text-sm">
              Drop to add tag
            </div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base truncate">{prompt.title}</CardTitle>
                <Badge variant="outline" className="text-xs shrink-0">
                  v{currentVersion}
                </Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2">
                {prompt.description || 'No description'}
              </CardDescription>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(prompt)
                }}
              >
                <Pencil size={16} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => {
                e.stopPropagation()
                handleCopy(prompt.content)
              }}
            >
              <Copy size={14} />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{prompt.title}</DialogTitle>
              <Badge variant="outline">v{currentVersion}</Badge>
            </div>
            <DialogDescription>{prompt.description || 'No description'}</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="current" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Version</TabsTrigger>
              <TabsTrigger value="history">Version History ({versions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Content</div>
                    <p className="text-sm font-mono whitespace-pre-wrap">{prompt.content}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      <div>Modified: {format(prompt.modifiedAt, 'PPpp')}</div>
                      <div>Created: {format(prompt.createdAt, 'PPpp')}</div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button onClick={() => handleCopy(prompt.content)}>
                  <Copy size={16} />
                  Copy Current Version
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <ScrollArea className="h-[400px] w-full">
                {sortedVersions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Clock size={48} className="text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Previous Versions</h3>
                    <p className="text-sm text-muted-foreground">
                      Previous versions will appear here when you edit this prompt
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {sortedVersions.map((version) => (
                      <Card key={version.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-sm">Version {version.versionNumber}</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {format(version.timestamp, 'PP')}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs mt-1">
                                {version.title}
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(version.content)}
                            >
                              <Copy size={14} />
                              Copy
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {version.description && (
                              <div className="text-xs text-muted-foreground">
                                {version.description}
                              </div>
                            )}
                            <div className="text-sm font-mono text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-3 max-h-32 overflow-y-auto">
                              {version.content}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(version.timestamp, 'PPpp')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
