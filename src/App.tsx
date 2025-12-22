import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Prompt, Tag, Version, AIConfig, DEFAULT_AI_CONFIG } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, Plus, Gear, Tag as TagIcon, Sparkle, ArrowsLeftRight } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { PromptCard } from '@/components/PromptCard'
import { TagTree } from '@/components/TagTree'
import { PromptEditor } from '@/components/PromptEditor'
import { AIGenerator } from '@/components/AIGenerator'
import { SettingsDialog } from '@/components/SettingsDialog'
import { TagManager } from '@/components/TagManager'
import { ImportExport } from '@/components/ImportExport'
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
  const [showImportExport, setShowImportExport] = useState(false)

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
      
      if (existing && (existing.content !== prompt.content || existing.title !== prompt.title || existing.description !== prompt.description)) {
        const existingVersions = (versions || []).filter(v => v.promptId === prompt.id)
        const nextVersionNumber = existingVersions.length + 1
        
        setVersions(currentVersions => [
          ...(currentVersions || []),
          {
            id: crypto.randomUUID(),
            promptId: prompt.id,
            content: existing.content,
            title: existing.title,
            description: existing.description,
            timestamp: existing.modifiedAt,
            versionNumber: nextVersionNumber
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

  const handleTagAssigned = (promptId: string, tagPath: string) => {
    setPrompts(currentPrompts => {
      if (!currentPrompts) return []
      return currentPrompts.map(p => {
        if (p.id === promptId && !p.tags.includes(tagPath)) {
          toast.success(`Tag "${tagPath.split('/').pop()}" added to "${p.title}"`)
          return { ...p, tags: [...p.tags, tagPath], modifiedAt: Date.now() }
        }
        return p
      })
    })

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
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkle size={20} weight="duotone" className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">AI Prompt Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportExport(true)}
              className="hover:bg-muted/70 text-muted-foreground hover:text-foreground"
            >
              <ArrowsLeftRight size={18} weight="duotone" />
              Import/Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagManager(true)}
              className="hover:bg-muted/70 text-muted-foreground hover:text-foreground"
            >
              <TagIcon size={18} weight="duotone" />
              Manage Tags
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="hover:bg-muted/70 text-muted-foreground hover:text-foreground"
            >
              <Gear size={18} weight="duotone" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-border/50 bg-background p-6 overflow-y-auto">
          <div className="mb-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">AI Prompts</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">Organize with tags</p>
            </div>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-foreground font-medium">
                All Prompts
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
                Untagged
              </button>
            </div>
          </div>
          
          <div className="mb-6 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TAGS</h3>
            {selectedTags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border/50 hover:bg-muted/50"
                onClick={() => setSelectedTags([])}
              >
                Clear {selectedTags.length} Filter{selectedTags.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
          <TagTree
            tree={tagTree}
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </aside>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-[1800px] mx-auto p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass
                  size={18}
                  weight="duotone"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-card border-border/50 rounded-xl"
                />
              </div>
              <Button 
                onClick={() => setShowAIGenerator(true)} 
                variant="outline"
                className="h-11 px-5 border-border/50 hover:bg-muted/50 rounded-xl"
              >
                <Sparkle size={18} weight="duotone" />
                Generate with AI
              </Button>
              <Button 
                onClick={handleCreatePrompt}
                className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus size={18} weight="bold" />
                New Prompt
              </Button>
            </div>

            {filteredPrompts.length === 0 ? (
              <div className="text-center py-20">
                <Sparkle size={64} weight="duotone" className="text-muted-foreground/40 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {(prompts || []).length === 0 ? 'No prompts yet' : 'No matching prompts'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {(prompts || []).length === 0
                    ? 'Create your first prompt to get started'
                    : 'Try adjusting your search or filters'}
                </p>
                {(prompts || []).length === 0 && (
                  <Button 
                    onClick={handleCreatePrompt}
                    className="bg-primary hover:bg-primary/90 h-11 px-6 rounded-xl"
                  >
                    <Plus size={18} weight="bold" />
                    Create First Prompt
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
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
                    onTagAssigned={handleTagAssigned}
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

      <ImportExport
        open={showImportExport}
        onClose={() => setShowImportExport(false)}
        prompts={prompts || []}
        versions={versions || []}
        onImport={(newPrompts, newVersions) => {
          setPrompts(currentPrompts => [...(currentPrompts || []), ...newPrompts])
          setVersions(currentVersions => [...(currentVersions || []), ...newVersions])
        }}
      />

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
