export interface Prompt {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  createdAt: number
  modifiedAt: number
  usageCount: number
}

export interface Tag {
  id: string
  name: string
  color: string
  description: string
  promptCount: number
}

export interface Version {
  id: string
  promptId: string
  content: string
  timestamp: number
}

export interface AIConfig {
  defaultProvider: 'openrouter' | 'ollama' | null
  openrouter: {
    enabled: boolean
    apiKey: string
    model: string
    timeout: number
    retries: number
  }
  ollama: {
    enabled: boolean
    endpoint: string
    model: string
    timeout: number
    retries: number
  }
  systemPrompts: {
    generation: string
    optimization: string
  }
  temperature: {
    generation: number
    optimization: number
  }
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  defaultProvider: null,
  openrouter: {
    enabled: false,
    apiKey: '',
    model: 'openai/gpt-4',
    timeout: 30000,
    retries: 3
  },
  ollama: {
    enabled: false,
    endpoint: 'http://localhost:11434',
    model: 'llama2',
    timeout: 60000,
    retries: 2
  },
  systemPrompts: {
    generation: 'You are an AI assistant that helps generate high-quality prompts based on user descriptions. Be clear, specific, and actionable.',
    optimization: 'You are an AI assistant that helps optimize and improve existing prompts for better clarity and effectiveness. Maintain the original intent while improving structure and clarity.'
  },
  temperature: {
    generation: 0.7,
    optimization: 0.3
  }
}
