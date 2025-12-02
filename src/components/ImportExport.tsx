import { useState } from 'react'
import { Prompt, Version } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Download, Upload, FileArrowDown, FileArrowUp } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ImportExportProps {
  open: boolean
  onClose: () => void
  prompts: Prompt[]
  versions: Version[]
  onImport: (prompts: Prompt[], versions: Version[]) => void
}

interface ExternalFormat {
  title: string
  description: string
  text: string
  version: number
  isLatest: number
  parentId: number | null
  createdAt: string
  lastUsedAt: string | null
  timesUsed: number
  id: number
}

export function ImportExport({ open, onClose, prompts, versions, onImport }: ImportExportProps) {
  const [importText, setImportText] = useState('')
  const [activeTab, setActiveTab] = useState('export')

  const convertToExternalFormat = (): ExternalFormat[] => {
    const externalData: ExternalFormat[] = []
    let idCounter = 1

    prompts.forEach(prompt => {
      const promptVersions = versions
        .filter(v => v.promptId === prompt.id)
        .sort((a, b) => a.versionNumber - b.versionNumber)

      promptVersions.forEach(version => {
        externalData.push({
          title: version.title,
          description: version.description,
          text: version.content,
          version: version.versionNumber,
          isLatest: 0,
          parentId: version.versionNumber === 1 ? null : idCounter - 1,
          createdAt: new Date(version.timestamp).toISOString(),
          lastUsedAt: null,
          timesUsed: 0,
          id: idCounter++
        })
      })

      externalData.push({
        title: prompt.title,
        description: prompt.description,
        text: prompt.content,
        version: promptVersions.length + 1,
        isLatest: 1,
        parentId: promptVersions.length > 0 ? idCounter - 1 : null,
        createdAt: new Date(prompt.createdAt).toISOString(),
        lastUsedAt: prompt.usageCount > 0 ? new Date(prompt.modifiedAt).toISOString() : null,
        timesUsed: prompt.usageCount,
        id: idCounter++
      })
    })

    return externalData
  }

  const handleExport = () => {
    const externalData = convertToExternalFormat()
    const jsonString = JSON.stringify(externalData, null, 2)
    
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Prompts exported successfully')
  }

  const handleCopyExport = () => {
    const externalData = convertToExternalFormat()
    const jsonString = JSON.stringify(externalData, null, 2)
    navigator.clipboard.writeText(jsonString)
    toast.success('Export data copied to clipboard')
  }

  const convertFromExternalFormat = (externalData: ExternalFormat[]): { prompts: Prompt[], versions: Version[] } => {
    const promptMap = new Map<string, Prompt>()
    const versionList: Version[] = []

    const sortedData = [...externalData].sort((a, b) => a.id - b.id)
    const versionGroups = new Map<string, ExternalFormat[]>()

    sortedData.forEach(item => {
      const key = item.title
      if (!versionGroups.has(key)) {
        versionGroups.set(key, [])
      }
      versionGroups.get(key)!.push(item)
    })

    versionGroups.forEach((items, title) => {
      const sortedItems = items.sort((a, b) => a.version - b.version)
      const latestItem = sortedItems.find(item => item.isLatest === 1) || sortedItems[sortedItems.length - 1]
      
      const promptId = crypto.randomUUID()
      
      const prompt: Prompt = {
        id: promptId,
        title: latestItem.title,
        description: latestItem.description,
        content: latestItem.text,
        tags: [],
        createdAt: new Date(sortedItems[0].createdAt).getTime(),
        modifiedAt: new Date(latestItem.createdAt).getTime(),
        usageCount: latestItem.timesUsed
      }
      
      promptMap.set(promptId, prompt)

      sortedItems.forEach((item, index) => {
        if (item.isLatest !== 1 && index < sortedItems.length - 1) {
          const version: Version = {
            id: crypto.randomUUID(),
            promptId: promptId,
            content: item.text,
            title: item.title,
            description: item.description,
            timestamp: new Date(item.createdAt).getTime(),
            versionNumber: item.version
          }
          versionList.push(version)
        }
      })
    })

    return {
      prompts: Array.from(promptMap.values()),
      versions: versionList
    }
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText) as ExternalFormat[]
      
      if (!Array.isArray(parsed)) {
        toast.error('Invalid format: Expected an array')
        return
      }

      const { prompts: newPrompts, versions: newVersions } = convertFromExternalFormat(parsed)
      
      onImport(newPrompts, newVersions)
      setImportText('')
      toast.success(`Imported ${newPrompts.length} prompts with ${newVersions.length} versions`)
      onClose()
    } catch (error) {
      toast.error('Invalid JSON format')
      console.error(error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
      toast.success('File loaded - click Import to add prompts')
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import/Export Prompts</DialogTitle>
          <DialogDescription>
            Export your prompts to backup or share, or import prompts from a JSON file
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">
              <FileArrowDown size={16} className="mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileArrowUp size={16} className="mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 space-y-4">
              <div className="text-sm text-muted-foreground">
                Export {prompts.length} prompts and {versions.length} versions
              </div>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(convertToExternalFormat(), null, 2)}
                </pre>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCopyExport}>
                <Upload size={16} />
                Copy to Clipboard
              </Button>
              <Button onClick={handleExport}>
                <Download size={16} />
                Download JSON
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="import" className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload JSON File</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Or Paste JSON</label>
                <Textarea
                  placeholder="Paste your exported JSON data here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="font-mono text-xs h-[350px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importText.trim()}>
                <Upload size={16} />
                Import Prompts
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
