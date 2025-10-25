import { useState, useEffect } from 'react'
import { Prompt, Tag, AIConfig } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkle, X } from '@phosphor-icons/react'
import { AIService } from '@/lib/ai-service'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PromptEditorProps {
  open: boolean
  onClose: () => void
  prompt: Prompt | null
  tags: Tag[]
  aiConfig: AIConfig
  onSave: (prompt: Prompt) => void
}

export function PromptEditor({ open, onClose, prompt, tags, aiConfig, onSave }: PromptEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [optimizing, setOptimizing] = useState(false)

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      setDescription(prompt.description)
      setContent(prompt.content)
      setSelectedTags(prompt.tags)
    } else {
      setTitle('')
      setDescription('')
      setContent('')
      setSelectedTags([])
    }
  }, [prompt, open])

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!content.trim()) {
      toast.error('Content is required')
      return
    }

    const savedPrompt: Prompt = {
      id: prompt?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags: selectedTags,
      createdAt: prompt?.createdAt || Date.now(),
      modifiedAt: Date.now(),
      usageCount: prompt?.usageCount || 0
    }

    onSave(savedPrompt)
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast.error('Add some content first')
      return
    }

    if (!aiConfig.defaultProvider) {
      toast.error('Configure AI provider in settings first')
      return
    }

    setOptimizing(true)
    try {
      const aiService = new AIService(aiConfig)
      const optimized = await aiService.optimizePrompt(content)
      setContent(optimized)
      toast.success('Prompt optimized')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to optimize prompt')
    } finally {
      setOptimizing(false)
    }
  }

  const availableTags = tags.map(t => t.name).filter(t => !selectedTags.includes(t))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{prompt ? 'Edit Prompt' : 'New Prompt'}</DialogTitle>
          <DialogDescription>
            {prompt ? 'Modify your prompt details' : 'Create a new AI prompt'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter prompt title..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this prompt..."
                className="mt-1.5 resize-none h-20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="content">Content</Label>
                {aiConfig.defaultProvider && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOptimize}
                    disabled={optimizing}
                  >
                    <Sparkle size={14} />
                    {optimizing ? 'Optimizing...' : 'Optimize with AI'}
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Enter your prompt content..."
                className="mt-1.5 resize-none h-48 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Type tag name (e.g., coding/python)..."
                  list="available-tags"
                />
                <Button onClick={handleAddTag} type="button">Add</Button>
              </div>
              <datalist id="available-tags">
                {availableTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
