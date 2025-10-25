import { useState, useEffect } from 'react'
import { AIConfig } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AIService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  config: AIConfig
  onSave: (config: AIConfig) => void
}

export function SettingsDialog({ open, onClose, config, onSave }: SettingsDialogProps) {
  const [localConfig, setLocalConfig] = useState<AIConfig>(config)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config, open])

  const handleSave = () => {
    onSave(localConfig)
    toast.success('Settings saved')
    onClose()
  }

  const handleTest = async (provider: 'openrouter' | 'ollama') => {
    setTesting(true)
    try {
      const aiService = new AIService(localConfig)
      const success = await aiService.testConnection(provider)
      if (success) {
        toast.success(`${provider === 'openrouter' ? 'OpenRouter' : 'Ollama'} connection successful`)
      } else {
        toast.error('Connection failed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Configure AI providers for prompt generation and optimization
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="openrouter" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openrouter">OpenRouter</TabsTrigger>
              <TabsTrigger value="ollama">Ollama</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="openrouter" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="or-enabled">Enable OpenRouter</Label>
                <Switch
                  id="or-enabled"
                  checked={localConfig.openrouter.enabled}
                  onCheckedChange={enabled =>
                    setLocalConfig({
                      ...localConfig,
                      openrouter: { ...localConfig.openrouter, enabled }
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="or-api-key">API Key</Label>
                <Input
                  id="or-api-key"
                  type="password"
                  value={localConfig.openrouter.apiKey}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      openrouter: { ...localConfig.openrouter, apiKey: e.target.value }
                    })
                  }
                  placeholder="sk-or-..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="or-model">Model</Label>
                <Input
                  id="or-model"
                  value={localConfig.openrouter.model}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      openrouter: { ...localConfig.openrouter, model: e.target.value }
                    })
                  }
                  placeholder="openai/gpt-4"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="or-timeout">Timeout (ms)</Label>
                  <Input
                    id="or-timeout"
                    type="number"
                    value={localConfig.openrouter.timeout}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        openrouter: { ...localConfig.openrouter, timeout: parseInt(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="or-retries">Retries</Label>
                  <Input
                    id="or-retries"
                    type="number"
                    value={localConfig.openrouter.retries}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        openrouter: { ...localConfig.openrouter, retries: parseInt(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleTest('openrouter')}
                disabled={testing || !localConfig.openrouter.apiKey}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </TabsContent>

            <TabsContent value="ollama" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ol-enabled">Enable Ollama</Label>
                <Switch
                  id="ol-enabled"
                  checked={localConfig.ollama.enabled}
                  onCheckedChange={enabled =>
                    setLocalConfig({
                      ...localConfig,
                      ollama: { ...localConfig.ollama, enabled }
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="ol-endpoint">Endpoint</Label>
                <Input
                  id="ol-endpoint"
                  value={localConfig.ollama.endpoint}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      ollama: { ...localConfig.ollama, endpoint: e.target.value }
                    })
                  }
                  placeholder="http://localhost:11434"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="ol-model">Model</Label>
                <Input
                  id="ol-model"
                  value={localConfig.ollama.model}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      ollama: { ...localConfig.ollama, model: e.target.value }
                    })
                  }
                  placeholder="llama2"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ol-timeout">Timeout (ms)</Label>
                  <Input
                    id="ol-timeout"
                    type="number"
                    value={localConfig.ollama.timeout}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        ollama: { ...localConfig.ollama, timeout: parseInt(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="ol-retries">Retries</Label>
                  <Input
                    id="ol-retries"
                    type="number"
                    value={localConfig.ollama.retries}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        ollama: { ...localConfig.ollama, retries: parseInt(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleTest('ollama')}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label htmlFor="default-provider">Default Provider</Label>
                <select
                  id="default-provider"
                  value={localConfig.defaultProvider || ''}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      defaultProvider: e.target.value as 'openrouter' | 'ollama' | null
                    })
                  }
                  className="w-full mt-1.5 px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">None</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama</option>
                </select>
              </div>

              <div>
                <Label htmlFor="gen-prompt">Generation System Prompt</Label>
                <Textarea
                  id="gen-prompt"
                  value={localConfig.systemPrompts.generation}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      systemPrompts: { ...localConfig.systemPrompts, generation: e.target.value }
                    })
                  }
                  className="mt-1.5 resize-none h-24"
                />
              </div>

              <div>
                <Label htmlFor="opt-prompt">Optimization System Prompt</Label>
                <Textarea
                  id="opt-prompt"
                  value={localConfig.systemPrompts.optimization}
                  onChange={e =>
                    setLocalConfig({
                      ...localConfig,
                      systemPrompts: { ...localConfig.systemPrompts, optimization: e.target.value }
                    })
                  }
                  className="mt-1.5 resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gen-temp">Generation Temperature</Label>
                  <Input
                    id="gen-temp"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.temperature.generation}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        temperature: { ...localConfig.temperature, generation: parseFloat(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="opt-temp">Optimization Temperature</Label>
                  <Input
                    id="opt-temp"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.temperature.optimization}
                    onChange={e =>
                      setLocalConfig({
                        ...localConfig,
                        temperature: { ...localConfig.temperature, optimization: parseFloat(e.target.value) }
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
