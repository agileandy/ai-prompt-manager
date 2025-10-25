import { Tag } from './types'

export interface TagNode {
  name: string
  fullPath: string
  count: number
  directCount: number
  color: string
  description: string
  children: Map<string, TagNode>
  level: number
}

export function buildTagTree(tags: Tag[], prompts: any[]): TagNode {
  const root: TagNode = {
    name: '',
    fullPath: '',
    count: 0,
    directCount: 0,
    color: '',
    description: '',
    children: new Map(),
    level: 0
  }

  tags.forEach(tag => {
    const parts = tag.name.split('/')
    let current = root

    parts.forEach((part, index) => {
      const fullPath = parts.slice(0, index + 1).join('/')
      
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          fullPath,
          count: 0,
          directCount: 0,
          color: tag.color,
          description: tag.description,
          children: new Map(),
          level: index + 1
        })
      }

      current = current.children.get(part)!
      
      if (index === parts.length - 1) {
        current.color = tag.color
        current.description = tag.description
      }
    })
  })

  updateCounts(root, prompts)
  return root
}

function updateCounts(node: TagNode, prompts: any[]): number {
  let totalCount = 0

  if (node.fullPath) {
    node.directCount = prompts.filter(p => p.tags.includes(node.fullPath)).length
    totalCount = node.directCount
  }

  node.children.forEach(child => {
    totalCount += updateCounts(child, prompts)
  })

  node.count = totalCount
  return totalCount
}

export function getAllTagPaths(tagName: string): string[] {
  const parts = tagName.split('/')
  const paths: string[] = []
  
  for (let i = 1; i <= parts.length; i++) {
    paths.push(parts.slice(0, i).join('/'))
  }
  
  return paths
}

export function getChildTags(parentPath: string, allTags: Tag[]): Tag[] {
  const prefix = parentPath + '/'
  return allTags.filter(tag => tag.name.startsWith(prefix))
}

export function validateTagName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Tag name cannot be empty' }
  }

  if (name.length > 50) {
    return { valid: false, error: 'Tag name must be 50 characters or less' }
  }

  if (!/^[a-zA-Z0-9\s\-_/]+$/.test(name)) {
    return { valid: false, error: 'Tag name can only contain letters, numbers, spaces, hyphens, underscores, and forward slashes' }
  }

  if (name.startsWith('/') || name.endsWith('/') || name.includes('//')) {
    return { valid: false, error: 'Invalid tag hierarchy structure' }
  }

  return { valid: true }
}

export function validateColor(color: string): { valid: boolean; error?: string } {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { valid: false, error: 'Color must be in hex format (#RRGGBB)' }
  }

  return { valid: true }
}

export function sortTagNodes(nodes: Map<string, TagNode>): TagNode[] {
  return Array.from(nodes.values()).sort((a, b) => a.name.localeCompare(b.name))
}
