import { useState } from 'react'
import { Tag, Prompt } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash } from '@phosphor-icons/react'
import { validateTagName, validateColor } from '@/lib/tag-utils'
import { toast } from 'sonner'
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

interface TagManagerProps {
  open: boolean
  onClose: () => void
  tags: Tag[]
  prompts: Prompt[]
  onTagsChange: (tags: Tag[]) => void
  onPromptsChange: (prompts: Prompt[]) => void
}

export function TagManager({ open, onClose, tags, prompts, onTagsChange, onPromptsChange }: TagManagerProps) {
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#8b5cf6')
  const [description, setDescription] = useState('')

  const handleCreateTag = () => {
    setEditingTag(null)
    setName('')
    setColor('#8b5cf6')
    setDescription('')
    setShowForm(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setName(tag.name)
    setColor(tag.color)
    setDescription(tag.description)
    setShowForm(true)
  }

  const handleSaveTag = () => {
    const nameValidation = validateTagName(name)
    if (!nameValidation.valid) {
      toast.error(nameValidation.error)
      return
    }

    const colorValidation = validateColor(color)
    if (!colorValidation.valid) {
      toast.error(colorValidation.error)
      return
    }

    if (editingTag) {
      const updatedTag: Tag = {
        ...editingTag,
        name,
        color,
        description
      }

      onTagsChange(tags.map(t => t.id === editingTag.id ? updatedTag : t))

      if (editingTag.name !== name) {
        onPromptsChange(
          prompts.map(p => ({
            ...p,
            tags: p.tags.map(t => t === editingTag.name ? name : t)
          }))
        )
      }

      toast.success('Tag updated')
    } else {
      if (tags.some(t => t.name === name)) {
        toast.error('Tag with this name already exists')
        return
      }

      const newTag: Tag = {
        id: crypto.randomUUID(),
        name,
        color,
        description,
        promptCount: 0
      }

      onTagsChange([...tags, newTag])
      toast.success('Tag created')
    }

    setShowForm(false)
  }

  const handleDeleteTag = (tag: Tag) => {
    const usageCount = prompts.filter(p => p.tags.includes(tag.name)).length

    if (usageCount > 0) {
      onPromptsChange(
        prompts.map(p => ({
          ...p,
          tags: p.tags.filter(t => t !== tag.name)
        }))
      )
    }

    onTagsChange(tags.filter(t => t.id !== tag.id))
    toast.success('Tag deleted')
  }

  const getTagUsageCount = (tagName: string) => {
    return prompts.filter(p => p.tags.includes(tagName)).length
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create and organize tags for your prompts
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          {!showForm ? (
            <div className="space-y-2">
              <Button onClick={handleCreateTag} className="w-full">
                <Plus size={16} />
                Create New Tag
              </Button>
              {tags.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tags yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{tag.name}</div>
                          {tag.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {tag.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {getTagUsageCount(tag.name)} prompt{getTagUsageCount(tag.name) !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTag(tag)}
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
                              <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{tag.name}" from all prompts using it.
                                {getTagUsageCount(tag.name) > 0 && (
                                  <span className="block mt-2 font-medium">
                                    {getTagUsageCount(tag.name)} prompt{getTagUsageCount(tag.name) !== 1 ? 's' : ''} will be affected.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTag(tag)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., coding/python or marketing"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use / to create hierarchies (e.g., category/subcategory)
                </p>
              </div>

              <div>
                <Label htmlFor="tag-color">Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="tag-color"
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tag-description">Description (optional)</Label>
                <Textarea
                  id="tag-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of this tag..."
                  className="mt-1.5 resize-none h-20"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/200 characters
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveTag} className="flex-1">
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
