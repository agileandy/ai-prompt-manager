import { AIConfig } from './types'

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  async generateFromDescription(description: string): Promise<string> {
    if (!this.config.defaultProvider) {
      throw new Error('No AI provider configured')
    }

    const systemPrompt = this.config.systemPrompts.generation
    const temperature = this.config.temperature.generation

    if (this.config.defaultProvider === 'openrouter') {
      return this.callOpenRouter(systemPrompt, description, temperature)
    } else {
      return this.callOllama(systemPrompt, description, temperature)
    }
  }

  async optimizePrompt(prompt: string): Promise<string> {
    if (!this.config.defaultProvider) {
      throw new Error('No AI provider configured')
    }

    const systemPrompt = this.config.systemPrompts.optimization
    const temperature = this.config.temperature.optimization

    if (this.config.defaultProvider === 'openrouter') {
      return this.callOpenRouter(systemPrompt, prompt, temperature)
    } else {
      return this.callOllama(systemPrompt, prompt, temperature)
    }
  }

  private async callOpenRouter(
    systemPrompt: string,
    userMessage: string,
    temperature: number
  ): Promise<string> {
    const { apiKey, model, timeout } = this.config.openrouter

    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Prompt Manager'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature,
          max_tokens: 2000
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async callOllama(
    systemPrompt: string,
    userMessage: string,
    temperature: number
  ): Promise<string> {
    const { endpoint, model, timeout } = this.config.ollama

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          stream: false,
          options: {
            temperature
          }
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`)
      }

      const data = await response.json()
      return data.message?.content || ''
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async testConnection(provider: 'openrouter' | 'ollama'): Promise<boolean> {
    try {
      if (provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.config.openrouter.apiKey}`
          }
        })
        return response.ok
      } else {
        const response = await fetch(`${this.config.ollama.endpoint}/api/tags`)
        return response.ok
      }
    } catch {
      return false
    }
  }

  async getOpenRouterModels(): Promise<Array<{ id: string; name: string }>> {
    const { apiKey } = this.config.openrouter
    if (!apiKey) return []

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) return []

      const data = await response.json()
      return data.data?.map((model: any) => ({
        id: model.id,
        name: model.name || model.id
      })) || []
    } catch {
      return []
    }
  }

  async getOllamaModels(): Promise<Array<{ id: string; name: string }>> {
    const { endpoint } = this.config.ollama

    try {
      const response = await fetch(`${endpoint}/api/tags`)
      if (!response.ok) return []

      const data = await response.json()
      return data.models?.map((model: any) => ({
        id: model.name,
        name: model.name
      })) || []
    } catch {
      return []
    }
  }
}
