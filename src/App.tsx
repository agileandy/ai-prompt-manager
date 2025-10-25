import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Prompt, Tag, Version, AIConfig, DEFAULT_AI_CONFIG } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, Plus, Gear, Tag as TagIcon, Sparkle } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { PromptCard } from '@/components/PromptCard'
import { TagTree } from '@/components/TagTree'
import { PromptEditor } from '@/components/PromptEditor'
import { AIGenerator } from '@/components/AIGenerator'
import { SettingsDialog } from '@/components/SettingsDialog'
import { TagManager } from '@/components/TagManager'
import { buildTagTree } from '@/lib/tag-utils'

function App() {
  const [prompts, setPrompts] = useKV<Prompt[]>('prompts', [])
  const [tags, setTags] = useKV<Tag[]>('tags', [])
  const [versions, setVersions] = useKV<Version[]>('versions', [])
  const [aiConfig, setAIConfig] = useKV<AIConfig>('ai-config', DEFAULT_AI_CONFIG)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)

  const tagTree = useMemo(() => buildTagTree(tags || [], prompts || []), [tags, prompts])

  const filteredPrompts = useMemo(() => {
    if (!prompts) return []
    return prompts.filter(prompt => {
      const matchesSearch = searchQuery === '' ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => prompt.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [prompts, searchQuery, selectedTags])

  const handleCreatePrompt = () => {
    setEditingPrompt(null)
    setShowEditor(true)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleSavePrompt = (prompt: Prompt) => {
    setPrompts(currentPrompts => {
      if (!currentPrompts) return [prompt]
      const existing = currentPrompts.find(p => p.id === prompt.id)
      
      if (existing && existing.content !== prompt.content) {
        setVersions(currentVersions => [
          ...(currentVersions || []),
          {
            id: crypto.randomUUID(),
            promptId: prompt.id,
            content: existing.content,
            timestamp: Date.now()
          }
        ])
      }

      if (existing) {
        return currentPrompts.map(p => p.id === prompt.id ? prompt : p)
      } else {
        return [...currentPrompts, prompt]
      }
    })

    prompt.tags.forEach(tagPath => {
      const existingTag = (tags || []).find(t => t.name === tagPath)
      if (!existingTag) {
        setTags(currentTags => [
          ...(currentTags || []),
          {
            id: crypto.randomUUID(),
            name: tagPath,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            description: '',
            promptCount: 0
          }
        ])
      }
    })

    setShowEditor(false)
    const existing = (prompts || []).find(p => p.id === prompt.id)
    toast.success(existing ? 'Prompt updated' : 'Prompt created')
  }

  const handleDeletePrompt = (id: string) => {
    setPrompts(currentPrompts => (currentPrompts || []).filter(p => p.id !== id))
    setVersions(currentVersions => (currentVersions || []).filter(v => v.promptId !== id))
    toast.success('Prompt deleted')
  }

  const handleTagClick = (tagPath: string) => {
    setSelectedTags(current => 
      current.includes(tagPath)
        ? current.filter(t => t !== tagPath)
        : [...current, tagPath]
    )
  }

  const handleAIGenerate = (content: string) => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'AI Generated Prompt',
      description: 'Generated with AI',
      content,
      tags: [],
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      usageCount: 0
    }
    setEditingPrompt(newPrompt)
    setShowAIGenerator(false)
    setShowEditor(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkle size={28} weight="fill" className="text-accent" />
            <h1 className="text-2xl font-bold tracking-tight">AI Prompt Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
            >
              <TagIcon size={16} />
              Manage Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Gear size={16} />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tags</h2>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mb-2"
                onClick={() => setSelectedTags([])}
              >
                Clear Filters
              </Button>
            )}
          </div>
          <TagTree
            tree={tagTree}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAIGenerator(true)} variant="outline">
                <Sparkle size={16} />
                Generate with AI
              </Button>
              <Button onClick={handleCreatePrompt}>
                <Plus size={16} />
                New Prompt
              </Button>
            </div>

            {filteredPrompts.length === 0 ? (
              <div className="text-center py-16">
                <Sparkle size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {(prompts || []).length === 0 ? 'No prompts yet' : 'No matching prompts'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {(prompts || []).length === 0
                    ? 'Create your first prompt to get started'
                    : 'Try adjusting your search or filters'}
                </p>
                {(prompts || []).length === 0 && (
                  <Button onClick={handleCreatePrompt}>
                    <Plus size={16} />
                    Create First Prompt
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    tags={tags || []}
                    versions={(versions || []).filter(v => v.promptId === prompt.id)}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onUsePrompt={(id) => {
                      setPrompts(current =>
                        (current || []).map(p =>
                          p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
                        )
                      )
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <PromptEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        prompt={editingPrompt}
        tags={tags || []}
        aiConfig={aiConfig || DEFAULT_AI_CONFIG}
        onSave={handleSavePrompt}
      />

      <AIGenerator
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        aiConfig={aiConfig || DEFAULT_AI_CONFIG}
        onGenerate={handleAIGenerate}
      />

      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        config={aiConfig || DEFAULT_AI_CONFIG}
        onSave={setAIConfig}
      />

      <TagManager
        open={showTagManager}
        onClose={() => setShowTagManager(false)}
        tags={tags || []}
        prompts={prompts || []}
        onTagsChange={setTags}
        onPromptsChange={setPrompts}
      />

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
