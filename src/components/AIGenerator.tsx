import { useState } from 'react'
import { AIConfig } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkle } from '@phosphor-icons/react'
import { AIService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface AIGeneratorProps {
  open: boolean
  onClose: () => void
  aiConfig: AIConfig
  onGenerate: (content: string) => void
}

export function AIGenerator({ open, onClose, aiConfig, onGenerate }: AIGeneratorProps) {
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Enter a description first')
      return
    }

    if (!aiConfig.defaultProvider) {
      toast.error('Configure AI provider in settings first')
      return
    }

    setGenerating(true)
    try {
      const aiService = new AIService(aiConfig)
      const generated = await aiService.generateFromDescription(description)
      setResult(generated)
      toast.success('Prompt generated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate prompt')
    } finally {
      setGenerating(false)
    }
  }

  const handleAccept = () => {
    if (result) {
      onGenerate(result)
      setDescription('')
      setResult('')
    }
  }

  const handleClose = () => {
    setDescription('')
    setResult('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-accent" />
            Generate Prompt with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you want and let AI generate a prompt for you
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Create a prompt for summarizing technical documentation..."
              className="mt-1.5 resize-none h-24"
              disabled={generating}
            />
          </div>

          {result && (
            <div>
              <Label>Generated Prompt</Label>
              <Textarea
                value={result}
                onChange={e => setResult(e.target.value)}
                className="mt-1.5 resize-none h-48 font-mono text-sm"
              />
            </div>
          )}

          {!aiConfig.defaultProvider && (
            <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
              No AI provider configured. Set up OpenRouter or Ollama in settings to use this feature.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          {result ? (
            <Button onClick={handleAccept}>
              Accept & Edit
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={generating || !aiConfig.defaultProvider}
            >
              <Sparkle size={16} />
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
