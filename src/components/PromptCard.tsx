import { useState } from 'react'
import { Prompt, Tag, Version } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash, Clock, Copy, Eye, ClockCounterClockwise } from '@phosphor-icons/react'
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
          "relative bg-card border border-border hover:border-primary/50 transition-all duration-200 flex flex-col shadow-sm hover:shadow-md",
          isDragOver && "border-accent ring-2 ring-accent/40 bg-accent/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-accent/10 z-10 flex items-center justify-center rounded-xl border-2 border-accent border-dashed pointer-events-none">
            <div className="bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg">
              Drop to add tag
            </div>
          </div>
        )}
        
        <CardHeader className="pb-1 space-y-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold flex-1 line-clamp-2 leading-snug">
              {prompt.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="text-[10px] shrink-0 bg-primary/15 text-primary border-0 font-bold px-1.5 py-0.5 h-5"
            >
              v{currentVersion}
            </Badge>
          </div>
          
          {prompt.description && (
            <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-snug">
              {prompt.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 pt-0 px-3 pb-2 space-y-1.5">
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 font-medium border-0 h-5"
                  style={{
                    backgroundColor: getTagColor(tag) + '25',
                    color: getTagColor(tag)
                  }}
                >
                  {tag.split('/').pop()}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-0.5 text-[10px] text-muted-foreground pb-1.5 mt-auto">
            <div className="flex items-center justify-between">
              <span>Used:</span>
              <span className="font-semibold text-foreground">{prompt.usageCount}x</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span>{format(prompt.createdAt, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopy(prompt.content)
                }}
              >
                <Copy size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(true)
                }}
              >
                <Eye size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-accent hover:bg-accent/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(true)
                }}
              >
                <ClockCounterClockwise size={15} />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(prompt)
                }}
              >
                <Pencil size={15} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash size={15} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{prompt.title}" and all {versions.length} version{versions.length !== 1 ? 's' : ''}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(prompt.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[85vh] bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <DialogTitle className="text-xl font-bold">
                {prompt.title}
              </DialogTitle>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
                v{currentVersion}
              </Badge>
            </div>
            {prompt.description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {prompt.description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Tabs defaultValue="current" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="history">
                History ({versions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] w-full rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-4">
                  <div className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {prompt.content}
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <div>Modified: {format(prompt.modifiedAt, 'PPp')}</div>
                    <div>Created: {format(prompt.createdAt, 'PPp')}</div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleCopy(prompt.content)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Copy size={16} />
                  <span className="ml-2">Copy</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 mt-4">
              <ScrollArea className="h-[400px] w-full">
                {sortedVersions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <Clock size={48} weight="duotone" className="text-muted-foreground/30 mb-4" />
                    <h3 className="text-base font-semibold mb-2">
                      No Previous Versions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Previous versions will appear here when you edit this prompt
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-3">
                    {sortedVersions.map((version) => (
                      <Card key={version.id} className="bg-muted/30 border-border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-sm font-semibold">
                                  Version {version.versionNumber}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {format(version.timestamp, 'MMM d, yyyy')}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs">
                                {version.title}
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(version.content)}
                              className="hover:bg-primary/10 hover:border-primary/30"
                            >
                              <Copy size={14} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {version.description && (
                            <div className="text-xs text-muted-foreground bg-background/50 rounded p-2">
                              {version.description}
                            </div>
                          )}
                          <div className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-background/50 rounded p-3 max-h-32 overflow-y-auto">
                            {version.content}
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
