import { api, APIError, ErrCode } from 'encore.dev/api'
import { secret } from 'encore.dev/config'

// ---- Secrets ----------------------------------------------------------------

const DeepseekApiKey = secret('DeepSeekAPIKey')

// ---- Shared Helpers ---------------------------------------------------------

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

interface DeepseekMessage {
  role: string
  content: string
}

async function callDeepseek(
  messages: DeepseekMessage[],
  temperature: number,
  maxTokens: number,
  jsonMode = false
): Promise<string> {
  const body: Record<string, unknown> = {
    model: 'deepseek-chat',
    messages,
    temperature,
    max_tokens: maxTokens,
  }

  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DeepseekApiKey()}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new APIError(ErrCode.Unavailable, `DeepSeek API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function cleanJsonOutput(text: string): string {
  // Strip markdown code fences (any language tag: ```json, ```JSON, ```ts, etc.)
  let cleaned = text.replace(/```[^\n]*\n?/g, '').trim()

  // Extract JSON using brace-counting to find the matching close bracket.
  // This is more robust than lastIndexOf which breaks when the LLM adds
  // commentary containing braces after the JSON block.
  const startObj = cleaned.indexOf('{')
  const startArr = cleaned.indexOf('[')
  let start: number
  let openBracket: string
  let closeBracket: string

  if (startObj === -1 && startArr === -1) return cleaned
  if (startObj === -1) {
    start = startArr
    openBracket = '['
    closeBracket = ']'
  } else if (startArr === -1) {
    start = startObj
    openBracket = '{'
    closeBracket = '}'
  } else if (startObj < startArr) {
    start = startObj
    openBracket = '{'
    closeBracket = '}'
  } else {
    start = startArr
    openBracket = '['
    closeBracket = ']'
  }

  // Walk forward from the opening bracket, counting depth while respecting strings
  let depth = 0
  let inString = false
  let escaped = false
  let end = -1

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\' && inString) {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (ch === openBracket) depth++
      else if (ch === closeBracket) {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
  }

  if (end === -1) {
    // Brace counting failed (unbalanced), fall back to lastIndexOf
    end = cleaned.lastIndexOf(closeBracket)
  }
  if (end === -1) return cleaned
  cleaned = cleaned.slice(start, end + 1)

  // Remove single-line comments (// ...) that are NOT inside JSON strings.
  // Process line by line: track whether we're inside a string to avoid
  // stripping comment-like content within string values.
  cleaned = cleaned
    .split('\n')
    .map((line) => {
      let inStr = false
      let esc = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (esc) {
          esc = false
          continue
        }
        if (ch === '\\') {
          esc = true
          continue
        }
        if (ch === '"') {
          inStr = !inStr
          continue
        }
        if (!inStr && ch === '/' && line[i + 1] === '/') {
          return line.slice(0, i).trimEnd()
        }
      }
      return line
    })
    .join('\n')

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')

  // Fix missing commas between array elements: }  \n  {
  cleaned = cleaned.replace(/\}(\s*\r?\n\s*)\{/g, '},$1{')

  // Fix missing commas between object properties:
  // "value" or number/true/false/null at end of line, followed by "key" on next line
  cleaned = cleaned.replace(
    /(["}\]\d]|true|false|null)\s*\r?\n(\s*")/g,
    '$1,\n$2'
  )

  return cleaned.trim()
}

// ---- Health Check -----------------------------------------------------------

interface HealthResponse {
  message: string
}

export const healthCheck = api(
  { method: 'GET', path: '/', expose: true },
  async (): Promise<HealthResponse> => {
    return { message: 'Code Review Practice API - Running' }
  }
)

interface DetailedHealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  environment: string
}

/**
 * Detailed health check endpoint for monitoring.
 * Used by Encore Cloud and Vercel to verify backend is running.
 */
export const health = api(
  { expose: true, method: 'GET', path: '/api/health' },
  async (): Promise<DetailedHealthResponse> => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.ENCORE_ENVIRONMENT || 'development',
    }
  }
)

// ---- DeepSeek Generic Endpoint ----------------------------------------------

interface DeepseekRequest {
  prompt: string
}

interface DeepseekResponse {
  success: boolean
  output: string
}

export const deepseek = api(
  { method: 'POST', path: '/api/deepseek', expose: true },
  async (req: DeepseekRequest): Promise<DeepseekResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, 'Prompt is required')
    }

    const isJsonRequest =
      req.prompt.includes('Format as JSON') ||
      req.prompt.includes('Return ONLY valid JSON')

    let output = await callDeepseek(
      [{ role: 'user', content: req.prompt }],
      0.7,
      8192,
      isJsonRequest
    )

    // Clean markdown code blocks if trying to parse as JSON
    if (isJsonRequest) {
      output = cleanJsonOutput(output)
    }

    return { success: true, output }
  }
)

// ---- NPC Dialogue -----------------------------------------------------------

interface NpcDialogueRequest {
  systemPrompt: string
  messages: { role: string; content: string }[]
}

interface NpcDialogueResponse {
  success: boolean
  output: string
}

export const npcDialogue = api(
  { method: 'POST', path: '/api/npc-dialogue', expose: true },
  async (req: NpcDialogueRequest): Promise<NpcDialogueResponse> => {
    if (!req.systemPrompt || !req.messages || !Array.isArray(req.messages)) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'systemPrompt and messages array are required'
      )
    }

    const apiMessages: DeepseekMessage[] = [
      { role: 'system', content: req.systemPrompt },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const output = await callDeepseek(apiMessages, 0.8, 300)

    return { success: true, output: output.trim() }
  }
)

// ---- Generate PR Scenario ---------------------------------------------------

interface GeneratePrRequest {
  language?: string
}

interface GeneratePrResponse {
  success: boolean
  scenario: Record<string, unknown>
}

export const generatePr = api(
  { method: 'POST', path: '/api/generate-pr', expose: true },
  async (req: GeneratePrRequest): Promise<GeneratePrResponse> => {
    const language = req.language || 'react'

    // Much simpler prompt that requests minimal output
    const prompt = `Create a ${language} code review exercise with exactly 5 bugs.

    REQUIRED FORMAT:
    {
      "title": "string",
      "description": "string",
      "language": "${language}",
      "code": "string with \\n for newlines",
      "bugs": [{"id": "1", "line": 5, "severity": "high", "title": "x", "why": "y", "fix": "z"}]
    }
    
    FORBIDDEN FORMATS (DO NOT USE):
    - NO "diff" array ❌
    - NO "lineNumber" fields ❌  
    - NO "type" field ❌
    - NO "content" field ❌
    - NO "hasIssue" field ❌
    
    Return 15-20 lines of ${language} code as a SINGLE STRING in the "code" field.
    Include exactly 5 bugs. Keep all text brief.`

    const rawContent = await callDeepseek(
      [
        {
          role: 'system',
          content:
            'You are a code review trainer. Return ONLY compact JSON with no markdown. Keep all text brief.',
        },
        { role: 'user', content: prompt },
      ],
      0.3,
      3000, // Even smaller limit
      true
    )

    const cleanContent = cleanJsonOutput(rawContent)
    const scenario = JSON.parse(cleanContent)

    return { success: true, scenario }
  }
)

// ---- Evaluate PR Review -----------------------------------------------------

interface PrIssue {
  id: string
  lineNumber: number
  severity: string
  title: string
  explanation: string
  fix: string
}

interface EvaluatePrRequest {
  userFindings: number[]
  correctIssues: PrIssue[]
}

interface EvaluatePrResponse {
  success: boolean
  results: {
    total: number
    found: number
    missed: number
    falsePositives: number
    foundIssues: PrIssue[]
    missedIssues: PrIssue[]
    score: number
  }
}

export const evaluatePr = api(
  { method: 'POST', path: '/api/evaluate-pr', expose: true },
  async (req: EvaluatePrRequest): Promise<EvaluatePrResponse> => {
    const { userFindings, correctIssues } = req

    const foundIssues = correctIssues.filter((issue) =>
      userFindings.includes(issue.lineNumber)
    )
    const missedIssues = correctIssues.filter(
      (issue) => !userFindings.includes(issue.lineNumber)
    )
    const falsePositives = userFindings.filter(
      (lineNum) => !correctIssues.find((issue) => issue.lineNumber === lineNum)
    )

    return {
      success: true,
      results: {
        total: correctIssues.length,
        found: foundIssues.length,
        missed: missedIssues.length,
        falsePositives: falsePositives.length,
        foundIssues,
        missedIssues,
        score: Math.round((foundIssues.length / correctIssues.length) * 100),
      },
    }
  }
)

// ---- Evaluate Completion ----------------------------------------------------

interface EvaluateCompletionRequest {
  scenarioDescription: string
  conversationHistory: string
  completionSignals?: string
}

interface EvaluateCompletionResponse {
  success: boolean
  result: {
    scenarioComplete: boolean
    reasoning: string
    suggestedPrompt: string
  }
}

export const evaluateCompletion = api(
  { method: 'POST', path: '/api/evaluate-completion', expose: true },
  async (
    req: EvaluateCompletionRequest
  ): Promise<EvaluateCompletionResponse> => {
    if (!req.scenarioDescription || !req.conversationHistory) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'scenarioDescription and conversationHistory are required'
      )
    }

    const prompt = `You are an evaluator for a workplace scenario role-play training exercise.

SCENARIO DESCRIPTION:
${req.scenarioDescription}

COMPLETION SIGNALS (indicators that the scenario has reached a natural conclusion):
${req.completionSignals}

CONVERSATION HISTORY:
${req.conversationHistory}

Analyze the conversation and determine if the scenario has reached a natural completion point. A scenario is complete when the user has meaningfully engaged with the core challenge and either:
- Reached a decision or resolution on the main issue
- Discovered and addressed the key hidden dynamics
- Exhausted the productive avenues of exploration
- Arrived at a clear action plan or conclusion

If the scenario is NOT complete, suggest what the user should explore next (without revealing hidden information).

Return ONLY valid JSON in this exact format:
{
  "scenarioComplete": true or false,
  "reasoning": "Brief explanation of why the scenario is or isn't complete",
  "suggestedPrompt": "If not complete, a natural next question or action for the user. Empty string if complete."
}`

    const rawOutput = await callDeepseek(
      [{ role: 'user', content: prompt }],
      0.3,
      500,
      true
    )

    const cleaned = cleanJsonOutput(rawOutput)
    const result = JSON.parse(cleaned)

    return {
      success: true,
      result: {
        scenarioComplete: Boolean(result.scenarioComplete),
        reasoning: result.reasoning || '',
        suggestedPrompt: result.suggestedPrompt || '',
      },
    }
  }
)

// ---- Evaluate GRIP ----------------------------------------------------------

interface EvaluateGripRequest {
  prompt: string
}

interface EvaluateGripResponse {
  success: boolean
  result: Record<string, unknown>
}

export const evaluateGrip = api(
  { method: 'POST', path: '/api/evaluate-grip', expose: true },
  async (req: EvaluateGripRequest): Promise<EvaluateGripResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, 'prompt is required')
    }

    const rawOutput = await callDeepseek(
      [{ role: 'user', content: req.prompt }],
      0,
      4000,
      true
    )

    const cleaned = cleanJsonOutput(rawOutput)
    const result = JSON.parse(cleaned)

    return { success: true, result }
  }
)

// ---- Generate Consequence ---------------------------------------------------

interface GenerateConsequenceRequest {
  prompt: string
}

interface GenerateConsequenceResponse {
  success: boolean
  result: Record<string, unknown>
}

export const generateConsequence = api(
  { method: 'POST', path: '/api/generate-consequence', expose: true },
  async (
    req: GenerateConsequenceRequest
  ): Promise<GenerateConsequenceResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, 'prompt is required')
    }

    const rawOutput = await callDeepseek(
      [{ role: 'user', content: req.prompt }],
      0.7,
      2000,
      true
    )

    const cleaned = cleanJsonOutput(rawOutput)
    const result = JSON.parse(cleaned)

    return { success: true, result }
  }
)

// ---- Live Chat ------------------------------------------------------------

interface ChatRequest {
  messages: { role: string; content: string }[]
}

interface ChatResponse {
  success: boolean
  output: string
}

export const chat = api(
  { method: 'POST', path: '/api/chat', expose: true },
  async (req: ChatRequest): Promise<ChatResponse> => {
    if (
      !req.messages ||
      !Array.isArray(req.messages) ||
      req.messages.length === 0
    ) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'messages array is required and must not be empty'
      )
    }

    const apiMessages: DeepseekMessage[] = req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const output = await callDeepseek(apiMessages, 0.7, 500)

    return { success: true, output: output.trim() }
  }
)

// ---- Analyze Intent -------------------------------------------------------

interface AnalyzeIntentRequest {
  prompt: string
}

interface AnalyzeIntentResponse {
  success: boolean
  output: string
}

export const analyzeIntent = api(
  { method: 'POST', path: '/api/analyze-intent', expose: true },
  async (req: AnalyzeIntentRequest): Promise<AnalyzeIntentResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, 'prompt is required')
    }

    const rawOutput = await callDeepseek(
      [{ role: 'user', content: req.prompt }],
      0,
      500,
      true
    )

    const output = cleanJsonOutput(rawOutput)

    return { success: true, output }
  }
)

// ---- AI Provider Proxy Endpoints -------------------------------------------
// These endpoints proxy requests to external AI APIs to avoid browser CORS
// restrictions. The frontend sends the API key and request body; the backend
// forwards the request server-side and returns the raw API response.

interface ProxyClaudeRequest {
  apiKey: string
  model: string
  messages: { role: string; content: string }[]
  system?: string
  max_tokens: number
  temperature: number
  stream: boolean
}

interface ProxyResponse {
  success: boolean
  data: Record<string, unknown>
}

export const proxyClaude = api(
  { method: 'POST', path: '/api/proxy/claude', expose: true },
  async (req: ProxyClaudeRequest): Promise<ProxyResponse> => {
    if (!req.apiKey) {
      throw new APIError(ErrCode.InvalidArgument, 'apiKey is required')
    }

    const body: Record<string, unknown> = {
      model: req.model,
      messages: req.messages,
      max_tokens: req.max_tokens || 8192,
      temperature: req.temperature ?? 0.7,
      stream: req.stream || false,
    }
    if (req.system) {
      body.system = req.system
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        response.status === 401 ? ErrCode.Unauthenticated : ErrCode.Unavailable,
        JSON.stringify(data)
      )
    }

    return { success: true, data }
  }
)

interface ProxyOpenAIRequest {
  apiKey: string
  model: string
  messages: { role: string; content: string }[]
  max_tokens: number
  temperature: number
  stream: boolean
}

export const proxyOpenAI = api(
  { method: 'POST', path: '/api/proxy/openai', expose: true },
  async (req: ProxyOpenAIRequest): Promise<ProxyResponse> => {
    if (!req.apiKey) {
      throw new APIError(ErrCode.InvalidArgument, 'apiKey is required')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        max_tokens: req.max_tokens || 8192,
        temperature: req.temperature ?? 0.7,
        stream: req.stream || false,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        response.status === 401 ? ErrCode.Unauthenticated : ErrCode.Unavailable,
        JSON.stringify(data)
      )
    }

    return { success: true, data }
  }
)

interface ProxyGeminiRequest {
  apiKey: string
  model: string
  contents: { role: string; parts: { text: string }[] }[]
  systemInstruction?: { parts: { text: string }[] }
  generationConfig: {
    temperature: number
    maxOutputTokens: number
  }
}

export const proxyGemini = api(
  { method: 'POST', path: '/api/proxy/gemini', expose: true },
  async (req: ProxyGeminiRequest): Promise<ProxyResponse> => {
    if (!req.apiKey) {
      throw new APIError(ErrCode.InvalidArgument, 'apiKey is required')
    }

    const body: Record<string, unknown> = {
      contents: req.contents,
      generationConfig: req.generationConfig,
    }
    if (req.systemInstruction) {
      body.systemInstruction = req.systemInstruction
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${req.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        response.status === 401 || response.status === 403
          ? ErrCode.Unauthenticated
          : ErrCode.Unavailable,
        JSON.stringify(data)
      )
    }

    return { success: true, data }
  }
)
