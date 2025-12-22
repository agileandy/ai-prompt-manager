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
          "group relative bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/40 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30",
          isDragOver && "border-accent ring-2 ring-accent/50 bg-accent/10 shadow-2xl shadow-accent/20 scale-[1.02]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {isDragOver && (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-md z-10 flex items-center justify-center rounded-lg border-2 border-accent border-dashed pointer-events-none">
            <div className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold text-sm shadow-xl">
              Drop to add tag
            </div>
          </div>
        )}
        
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-bold flex-1 min-w-0 line-clamp-2 leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {prompt.title}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="text-xs shrink-0 bg-muted/80 text-muted-foreground font-semibold px-2.5 py-1 border border-border/40"
            >
              v{currentVersion}
            </Badge>
          </div>
          
          <CardDescription className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {prompt.description || 'No description provided'}
          </CardDescription>
          
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {prompt.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-3 py-1 font-medium rounded-full border transition-all hover:scale-105"
                  style={{
                    backgroundColor: getTagColor(tag) + '20',
                    borderColor: getTagColor(tag) + '40',
                    color: getTagColor(tag)
                  }}
                >
                  {tag.split('/').pop()}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 pt-0">
          <div className="grid grid-cols-2 gap-3 text-xs flex-1">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <div className="text-muted-foreground/70 mb-1 font-medium uppercase tracking-wide text-[10px]">Usage</div>
              <div className="text-foreground font-bold text-lg">{prompt.usageCount}</div>
              <div className="text-muted-foreground/60 text-[10px] mt-0.5">times used</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <div className="text-muted-foreground/70 mb-1 font-medium uppercase tracking-wide text-[10px]">Last Used</div>
              <div className="text-foreground font-semibold text-xs leading-tight">
                {prompt.usageCount > 0 ? formatDistanceToNow(prompt.modifiedAt, { addSuffix: true }) : 'Never'}
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t border-border/30">
            <div className="text-[10px] text-muted-foreground/60 mb-3 uppercase tracking-wide font-medium">
              Created {format(prompt.createdAt, 'dd MMM yyyy')}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 flex-1 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all group/btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetails(true)
                }}
              >
                <ClockCounterClockwise size={18} weight="duotone" className="group-hover/btn:scale-110 transition-transform" />
                History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all group/btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopy(prompt.content)
                }}
              >
                <Copy size={18} weight="duotone" className="group-hover/btn:scale-110 transition-transform" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(prompt)
                }}
              >
                <Pencil size={18} weight="duotone" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash size={18} weight="duotone" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/40">
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
        <DialogContent className="max-w-5xl max-h-[90vh] bg-card/95 backdrop-blur-xl border-border/40">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                {prompt.title}
              </DialogTitle>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">v{currentVersion}</Badge>
            </div>
            <DialogDescription className="text-base text-muted-foreground/80">
              {prompt.description || 'No description'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="current" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30">
              <TabsTrigger value="current" className="data-[state=active]:bg-card data-[state=active]:shadow-md">Current Version</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-card data-[state=active]:shadow-md">
                Version History ({versions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4 mt-6">
              <ScrollArea className="h-[450px] w-full rounded-xl border border-border/40 bg-muted/20 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-muted-foreground/70 mb-3 uppercase tracking-wide font-semibold">Content</div>
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-foreground/90 bg-card/50 rounded-lg p-4 border border-border/30">
                      {prompt.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-border/30 text-xs text-muted-foreground/70">
                    <div>
                      <span className="font-semibold">Modified:</span> {format(prompt.modifiedAt, 'PPpp')}
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span> {format(prompt.createdAt, 'PPpp')}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleCopy(prompt.content)}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  <Copy size={16} weight="duotone" />
                  Copy Current Version
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 mt-6">
              <ScrollArea className="h-[450px] w-full">
                {sortedVersions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full"></div>
                      <Clock size={80} weight="duotone" className="text-muted-foreground/30 relative" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                      No Previous Versions
                    </h3>
                    <p className="text-sm text-muted-foreground/80 max-w-sm leading-relaxed">
                      Previous versions will appear here when you edit this prompt
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {sortedVersions.map((version) => (
                      <Card key={version.id} className="bg-card/50 border-border/40 hover:border-primary/30 transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-base font-bold">Version {version.versionNumber}</CardTitle>
                                <Badge variant="secondary" className="text-xs bg-muted/50">
                                  {format(version.timestamp, 'PP')}
                                </Badge>
                              </div>
                              <CardDescription className="text-sm">
                                {version.title}
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(version.content)}
                              className="hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                            >
                              <Copy size={14} weight="duotone" />
                              Copy
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {version.description && (
                            <div className="text-sm text-muted-foreground/80 bg-muted/20 rounded-lg p-3 border border-border/30">
                              {version.description}
                            </div>
                          )}
                          <div className="text-sm font-mono text-muted-foreground/90 whitespace-pre-wrap bg-muted/30 rounded-lg p-4 max-h-40 overflow-y-auto border border-border/30">
                            {version.content}
                          </div>
                          <div className="text-xs text-muted-foreground/60">
                            {format(version.timestamp, 'PPpp')}
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
