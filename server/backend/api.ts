import { api, APIError, ErrCode } from 'encore.dev/api'
import { secret } from 'encore.dev/config'
import { getAuthData } from '~encore/auth'
import { isAdmin } from '../auth/admin'
import { checkUsageCap, recordTokenUsage } from '../usage/usage'
import { buildGeneratePrPrompt, GENERATE_PR_SYSTEM_PROMPT } from './prompts/generatePrPrompt'
import { buildEvaluateCompletionPrompt } from './prompts/evaluateCompletionPrompt'
import { buildNpcSystemPrompt } from './prompts/npcPrompt'
import type { PersonaDefinition } from './prompts/npcPrompt'
import { buildIntentAnalysisPrompt } from './prompts/intentPrompt'
import { buildGripEvaluationPrompt } from './prompts/gripEvaluationPrompt'
import { buildConsequenceGenerationPrompt } from './prompts/consequencePrompt'
import { buildComparisonPrompt } from './prompts/comparisonPrompt'
import { buildEvaluateComparisonPrompt } from './prompts/evaluateComparisonPrompt'
import { buildAdvocatePrompt, type CriticalLens } from './prompts/advocatePrompt'
import {
  buildUserIntentAnalysisPrompt,
  buildPatternAnalysisPrompt,
  buildDismissalDetectionPrompt,
  type UserIntentScores,
  type PatternAnalysis
} from './prompts/userIntentPrompt'
import { detectClientPrompts } from './middleware/promptValidation'
import {
  categorizeNPCResponse,
  isProblematicResponse,
  AUTO_SOLVING_PATTERNS,
  AUTO_SOLVE_CORRECTION,
  FALLBACK_PROBE,
} from './utils/npcResponseAnalysis'

// ---- Secrets ----------------------------------------------------------------

const DeepseekApiKey = secret('DeepSeekAPIKey')

// ---- Shared Helpers ---------------------------------------------------------

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

interface DeepseekMessage {
  role: string
  content: string
}

interface DeepseekResult {
  content: string
  promptTokens: number
  completionTokens: number
}

async function callDeepseek(
  messages: DeepseekMessage[],
  temperature: number,
  maxTokens: number,
  jsonMode = false
): Promise<string> {
  const result = await callDeepseekWithUsage(messages, temperature, maxTokens, jsonMode)
  return result.content
}

async function callDeepseekWithUsage(
  messages: DeepseekMessage[],
  temperature: number,
  maxTokens: number,
  jsonMode = false
): Promise<DeepseekResult> {
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
  return {
    content: data.choices[0].message.content,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  }
}

/**
 * Check trial cap before an AI call and record usage after.
 * If the user is not authenticated, skips usage tracking.
 */
async function withUsageTracking<T>(
  fn: () => Promise<{ result: T; promptTokens: number; completionTokens: number }>
): Promise<T> {
  const authData = getAuthData()
  if (!authData) {
    const { result } = await fn()
    return result
  }

  // Check cap before the call
  await checkUsageCap(authData.userID, authData.email)

  const { result, promptTokens, completionTokens } = await fn()

  // Record usage asynchronously — don't block response
  recordTokenUsage(authData.userID, authData.email, promptTokens, completionTokens).catch(
    (err) => console.error('[usage] Failed to record token usage:', err)
  )

  return result
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

    return withUsageTracking(async () => {
      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: req.prompt }],
        0.7,
        8192,
        isJsonRequest
      )

      let output = ds.content
      if (isJsonRequest) {
        output = cleanJsonOutput(output)
      }

      return {
        result: { success: true, output } as DeepseekResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- NPC Dialogue -----------------------------------------------------------

interface NpcDialogueRequest {
  npcName: string
  persona: PersonaDefinition
  scenarioContext: string
  messages: { role: string; content: string }[]
}

interface NpcDialogueResponse {
  success: boolean
  output: string
}

export const npcDialogue = api(
  { method: 'POST', path: '/api/npc-dialogue', expose: true },
  async (req: NpcDialogueRequest): Promise<NpcDialogueResponse> => {
    // Detect if client sent a pre-built prompt (old behavior)
    detectClientPrompts('npcDialogue', req as unknown as Record<string, unknown>)

    if (!req.npcName || !req.persona || !req.scenarioContext || !req.messages || !Array.isArray(req.messages)) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'npcName, persona, scenarioContext, and messages array are required'
      )
    }

    return withUsageTracking(async () => {
      // Build prompt in backend using the engineered prompt
      const systemPrompt = buildNpcSystemPrompt(req.persona, req.scenarioContext)

      console.log('[NPC Dialogue] Using backend-built system prompt')
      console.log('[NPC Dialogue] NPC:', req.npcName)
      console.log('[NPC Dialogue] Prompt length:', systemPrompt.length)
      console.log('[NPC Dialogue] Has anti-solving rules:', systemPrompt.includes('DO NOT'))

      const apiMessages: DeepseekMessage[] = [
        { role: 'system', content: systemPrompt },
        ...req.messages.map((m) => ({ role: m.role, content: m.content })),
      ]

      let totalPromptTokens = 0
      let totalCompletionTokens = 0

      let ds = await callDeepseekWithUsage(apiMessages, 0.8, 300)
      totalPromptTokens += ds.promptTokens
      totalCompletionTokens += ds.completionTokens
      let output = ds.content

      // Categorize and detect problematic NPC responses
      const responseType = categorizeNPCResponse(output)
      console.log('[NPC Dialogue] Response type:', responseType)

      const isSolving = AUTO_SOLVING_PATTERNS.some(pattern => pattern.test(output))

      if (isSolving || isProblematicResponse(responseType)) {
        console.warn('[NPC Dialogue] AUTO-SOLVING DETECTED')
        console.warn('[NPC Dialogue] User message:', req.messages[req.messages.length - 1]?.content.substring(0, 100))
        console.warn('[NPC Dialogue] Bad response:', output.substring(0, 200))
        console.warn('[NPC Dialogue] Matched pattern:', AUTO_SOLVING_PATTERNS.find(p => p.test(output)))
        console.warn('[NPC Dialogue] Response category:', responseType)

        // Add strong corrective message and regenerate
        apiMessages.push({
          role: 'system',
          content: AUTO_SOLVE_CORRECTION,
        })

        ds = await callDeepseekWithUsage(apiMessages, 0.95, 200)
        totalPromptTokens += ds.promptTokens
        totalCompletionTokens += ds.completionTokens
        output = ds.content

        // If STILL auto-solving after retry, force a question
        const stillSolving = AUTO_SOLVING_PATTERNS.some(pattern => pattern.test(output))
        if (stillSolving) {
          console.error('[NPC Dialogue] Still auto-solving after retry, using fallback')
          output = FALLBACK_PROBE
        }
      }

      return {
        result: { success: true, output: output.trim() } as NpcDialogueResponse,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
      }
    })
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

    return withUsageTracking(async () => {
      const prompt = buildGeneratePrPrompt(language)

      const ds = await callDeepseekWithUsage(
        [
          { role: 'system', content: GENERATE_PR_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        0.3,
        3000,
        true
      )

      const cleanContent = cleanJsonOutput(ds.content)
      const scenario = JSON.parse(cleanContent)

      return {
        result: { success: true, scenario } as GeneratePrResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
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

// ---- Generate Comparison ----------------------------------------------------

interface GenerateComparisonRequest {
  language?: string
}

interface GenerateComparisonResponse {
  success: boolean
  scenario: Record<string, unknown>
}

export const generateComparison = api(
  { method: 'POST', path: '/api/generate-comparison', expose: true },
  async (req: GenerateComparisonRequest): Promise<GenerateComparisonResponse> => {
    const language = req.language || 'javascript'

    return withUsageTracking(async () => {
      const prompt = buildComparisonPrompt(language)

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0.7,
        2000,
        true
      )

      const cleanContent = cleanJsonOutput(ds.content)
      const scenario = JSON.parse(cleanContent)

      return {
        result: { success: true, scenario } as GenerateComparisonResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- Evaluate Comparison ----------------------------------------------------

interface ComparisonCodeOption {
  code: string
  approach: string
}

interface EvaluateComparisonRequest {
  context: string
  optionA: ComparisonCodeOption
  optionB: ComparisonCodeOption
  correctAnswer: string
  reason: string
  selectedOption: string
  reasoning: string
}

interface EvaluateComparisonResponse {
  success: boolean
  evaluation: string
}

export const evaluateComparison = api(
  { method: 'POST', path: '/api/evaluate-comparison', expose: true },
  async (req: EvaluateComparisonRequest): Promise<EvaluateComparisonResponse> => {
    if (!req.context || !req.optionA || !req.optionB || !req.selectedOption || !req.reasoning) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'context, optionA, optionB, selectedOption, and reasoning are required'
      )
    }

    return withUsageTracking(async () => {
      const prompt = buildEvaluateComparisonPrompt(
        {
          context: req.context,
          optionA: req.optionA,
          optionB: req.optionB,
          correctAnswer: req.correctAnswer,
          reason: req.reason,
        },
        req.reasoning,
        req.selectedOption
      )

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0,
        1500
      )

      return {
        result: { success: true, evaluation: ds.content.trim() } as EvaluateComparisonResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
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

    return withUsageTracking(async () => {
      const prompt = buildEvaluateCompletionPrompt(
        req.scenarioDescription,
        req.conversationHistory,
        req.completionSignals,
      )

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0.3,
        500,
        true
      )

      const cleaned = cleanJsonOutput(ds.content)
      const result = JSON.parse(cleaned)

      return {
        result: {
          success: true,
          result: {
            scenarioComplete: Boolean(result.scenarioComplete),
            reasoning: result.reasoning || '',
            suggestedPrompt: result.suggestedPrompt || '',
          },
        } as EvaluateCompletionResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- Evaluate GRIP ----------------------------------------------------------

interface EvaluateGripRequest {
  scenarioTitle: string
  scenarioCategory: string
  scenarioEngineBriefing: string
  conversationHistory: string
  signalsSummary: string
  hiddenFactorStatus: string
  evaluationGuidance: string
  userTurnCount: number
  minTurnsForFullEvaluation: number
}

interface EvaluateGripResponse {
  success: boolean
  result: Record<string, unknown>
}

export const evaluateGrip = api(
  { method: 'POST', path: '/api/evaluate-grip', expose: true },
  async (req: EvaluateGripRequest): Promise<EvaluateGripResponse> => {
    if (!req.scenarioTitle || !req.conversationHistory) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'scenarioTitle and conversationHistory are required'
      )
    }

    return withUsageTracking(async () => {
      // Build prompt in backend
      const prompt = buildGripEvaluationPrompt(
        req.scenarioTitle,
        req.scenarioCategory,
        req.scenarioEngineBriefing,
        req.conversationHistory,
        req.signalsSummary,
        req.hiddenFactorStatus,
        req.evaluationGuidance,
        req.userTurnCount,
        req.minTurnsForFullEvaluation,
      )

      console.log('[Evaluate GRIP] Using backend-built prompt')
      console.log('[Evaluate GRIP] Scenario:', req.scenarioTitle)
      console.log('[Evaluate GRIP] Prompt length:', prompt.length)
      console.log('[Evaluate GRIP] User turns:', req.userTurnCount)

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0,
        4000,
        true
      )

      const cleaned = cleanJsonOutput(ds.content)
      const result = JSON.parse(cleaned)

      return {
        result: { success: true, result } as EvaluateGripResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- Generate Consequence ---------------------------------------------------

interface GenerateConsequenceRequest {
  scenarioTitle: string
  scenarioCategory: string
  scenarioSetupContext: string
  conversationSummary: string
  gripScores: string
  compositeScore: number
  band: string
  hiddenFactorStatus: string
  weakDimensions: string[]
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
    if (!req.scenarioTitle || !req.conversationSummary) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'scenarioTitle and conversationSummary are required'
      )
    }

    return withUsageTracking(async () => {
      // Build prompt in backend
      const prompt = buildConsequenceGenerationPrompt(
        req.scenarioTitle,
        req.scenarioCategory,
        req.scenarioSetupContext,
        req.conversationSummary,
        req.gripScores,
        req.compositeScore,
        req.band,
        req.hiddenFactorStatus,
        req.weakDimensions,
      )

      console.log('[Generate Consequence] Using backend-built prompt')
      console.log('[Generate Consequence] Scenario:', req.scenarioTitle)
      console.log('[Generate Consequence] Prompt length:', prompt.length)

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0.7,
        2000,
        true
      )

      const cleaned = cleanJsonOutput(ds.content)
      const result = JSON.parse(cleaned)

      return {
        result: { success: true, result } as GenerateConsequenceResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
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

    return withUsageTracking(async () => {
      const apiMessages: DeepseekMessage[] = req.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const ds = await callDeepseekWithUsage(apiMessages, 0.7, 500)

      return {
        result: { success: true, output: ds.content.trim() } as ChatResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- Analyze Intent -------------------------------------------------------

interface AnalyzeIntentRequest {
  message: string
}

interface AnalyzeIntentResponse {
  success: boolean
  output: string
}

export const analyzeIntent = api(
  { method: 'POST', path: '/api/analyze-intent', expose: true },
  async (req: AnalyzeIntentRequest): Promise<AnalyzeIntentResponse> => {
    if (!req.message) {
      throw new APIError(ErrCode.InvalidArgument, 'message is required')
    }

    return withUsageTracking(async () => {
      // Build prompt in backend
      const prompt = buildIntentAnalysisPrompt(req.message)

      console.log('[Analyze Intent] Using backend-built prompt')
      console.log('[Analyze Intent] Message length:', req.message.length)

      const ds = await callDeepseekWithUsage(
        [{ role: 'user', content: prompt }],
        0,
        500,
        true
      )

      const output = cleanJsonOutput(ds.content)

      return {
        result: { success: true, output } as AnalyzeIntentResponse,
        promptTokens: ds.promptTokens,
        completionTokens: ds.completionTokens,
      }
    })
  }
)

// ---- Devil's Advocates ----------------------------------------------------

interface Advocate {
  id: string
  provider: 'claude' | 'openai' | 'gemini' | 'deepseek'
  model: string
  lens: CriticalLens
}

interface StartAdvocateSessionRequest {
  proposal: string
  advocates: Advocate[]
}

interface AdvocateCritique {
  advocateId: string
  content: string
}

interface StartAdvocateSessionResponse {
  success: boolean
  sessionId: string
  critiques: AdvocateCritique[]
}

interface ContinueDeliberationRequest {
  sessionId: string
  userResponse: string
}

interface StoredRound {
  roundNumber: number
  userMessage?: string
  userIntent?: UserIntentScores & { interpretation: string }
  critiques: AdvocateCritique[]
}

interface ContinueDeliberationResponse {
  success: boolean
  roundNumber: number
  critiques: AdvocateCritique[]
}

// In-memory session storage (temporary for Phase 2)
// Phase 3 will move this to proper database
const sessions = new Map<string, {
  proposal: string
  advocates: Advocate[]
  rounds: StoredRound[]
}>()

export const startAdvocateSession = api(
  { method: 'POST', path: '/api/advocates/start', expose: true },
  async (req: StartAdvocateSessionRequest): Promise<StartAdvocateSessionResponse> => {
    if (!req.proposal || req.proposal.length < 100) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'Proposal must be at least 100 characters'
      )
    }

    if (!req.advocates || req.advocates.length < 3 || req.advocates.length > 5) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'Must select 3-5 advocates'
      )
    }

    return withUsageTracking(async () => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      let totalPromptTokens = 0
      let totalCompletionTokens = 0

      // Generate Round 1 critiques
      const critiquePromises = req.advocates.map(async (advocate) => {
        const prompt = buildAdvocatePrompt(advocate.lens, req.proposal)

        const ds = await callDeepseekWithUsage(
          [{ role: 'user', content: prompt }],
          0.8,
          500,
          false
        )

        totalPromptTokens += ds.promptTokens
        totalCompletionTokens += ds.completionTokens

        return {
          advocateId: advocate.id,
          content: ds.content.trim()
        }
      })

      const critiques = await Promise.all(critiquePromises)

      // Store session in memory
      sessions.set(sessionId, {
        proposal: req.proposal,
        advocates: req.advocates,
        rounds: [
          {
            roundNumber: 1,
            critiques
          }
        ]
      })

      console.log(`[Advocates] Session ${sessionId} created with ${req.advocates.length} advocates`)

      return {
        result: { success: true, sessionId, critiques } as StartAdvocateSessionResponse,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
      }
    })
  }
)

// Continue deliberation (Round 2, 3, etc.)
export const continueDeliberation = api(
  { method: 'POST', path: '/api/advocates/continue', expose: true },
  async (req: ContinueDeliberationRequest): Promise<ContinueDeliberationResponse> => {
    if (!req.sessionId) {
      throw new APIError(ErrCode.InvalidArgument, 'sessionId required')
    }

    if (!req.userResponse || req.userResponse.length < 20) {
      throw new APIError(
        ErrCode.InvalidArgument,
        'Response must be at least 20 characters'
      )
    }

    // Retrieve session
    const session = sessions.get(req.sessionId)
    if (!session) {
      throw new APIError(ErrCode.NotFound, 'Session not found')
    }

    return withUsageTracking(async () => {
      const { proposal, advocates, rounds } = session
      const currentRound = rounds.length + 1

      let totalPromptTokens = 0
      let totalCompletionTokens = 0

      console.log(`[Advocates] Session ${req.sessionId} continuing to round ${currentRound}`)

      // Analyze user's intent (SILENTLY - don't show to user yet)
      const previousCritiques = rounds[rounds.length - 1].critiques.map(c => c.content)

      const intentPrompt = buildUserIntentAnalysisPrompt(req.userResponse, previousCritiques)
      const intentDs = await callDeepseekWithUsage(
        [{ role: 'user', content: intentPrompt }],
        0,
        500,
        true
      )
      totalPromptTokens += intentDs.promptTokens
      totalCompletionTokens += intentDs.completionTokens

      let userIntent: UserIntentScores & { interpretation: string }
      try {
        const cleaned = intentDs.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        userIntent = JSON.parse(cleaned)
      } catch {
        console.warn('[Advocates] Failed to parse user intent, using defaults')
        userIntent = {
          cooperative: 0.5,
          defensive: 0.5,
          epistemic: 0.5,
          persuasive: 0.5,
          interpretation: 'Unable to analyze response'
        }
      }

      console.log(`[Advocates] User intent - Defensive: ${userIntent.defensive.toFixed(2)}, Epistemic: ${userIntent.epistemic.toFixed(2)}`)

      // Build conversation history for advocates
      const conversationHistory: Array<{ role: string; content: string }> = []

      // Add previous rounds' user messages
      rounds.forEach((round) => {
        if (round.userMessage) {
          conversationHistory.push({ role: 'user', content: round.userMessage })
        }
      })

      // Add current user response
      conversationHistory.push({ role: 'user', content: req.userResponse })

      // Generate new critiques from all advocates
      const critiquePromises = advocates.map(async (advocate) => {
        const prompt = buildAdvocatePrompt(advocate.lens, proposal, conversationHistory)

        const ds = await callDeepseekWithUsage(
          [{ role: 'user', content: prompt }],
          0.8,
          500,
          false
        )

        totalPromptTokens += ds.promptTokens
        totalCompletionTokens += ds.completionTokens

        return {
          advocateId: advocate.id,
          content: ds.content.trim()
        }
      })

      const newCritiques = await Promise.all(critiquePromises)

      // Store this round (with user intent)
      rounds.push({
        roundNumber: currentRound,
        userMessage: req.userResponse,
        userIntent,
        critiques: newCritiques
      })

      sessions.set(req.sessionId, session)

      return {
        result: {
          success: true,
          roundNumber: currentRound,
          critiques: newCritiques
        } as ContinueDeliberationResponse,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
      }
    })
  }
)

// Get session data (for retrieving intent analysis later)
interface GetSessionRequest {
  sessionId: string
}

interface GetSessionResponse {
  success: boolean
  session: {
    proposal: string
    advocates: Advocate[]
    rounds: StoredRound[]
  }
}

export const getSession = api(
  { method: 'POST', path: '/api/advocates/session', expose: true },
  async (req: GetSessionRequest): Promise<GetSessionResponse> => {
    const session = sessions.get(req.sessionId)

    if (!session) {
      throw new APIError(ErrCode.NotFound, 'Session not found')
    }

    return {
      success: true,
      session
    }
  }
)

// ---- End Advocate Session ---------------------------------------------------

interface EndSessionRequest {
  sessionId: string
}

interface KeyDismissal {
  criticism: string
  advocateId: string
  howDismissed: string
}

interface SessionAnalysis {
  roundByRound: Array<{
    roundNumber: number
    userMessage: string
    intent: UserIntentScores & { interpretation: string }
  }>
  trends: {
    defensiveness: number[]
    epistemicOpenness: number[]
    cooperation: number[]
    persuasive: number[]
  }
  pattern: PatternAnalysis
  keyDismissals: KeyDismissal[]
}

interface EndSessionResponse {
  success: boolean
  analysis: SessionAnalysis
  transcript: string
}

export const endAdvocateSession = api(
  { method: 'POST', path: '/api/advocates/end', expose: true },
  async (req: EndSessionRequest): Promise<EndSessionResponse> => {
    const session = sessions.get(req.sessionId)

    if (!session) {
      throw new APIError(ErrCode.NotFound, 'Session not found')
    }

    return withUsageTracking(async () => {
      const { proposal, advocates, rounds } = session

      let totalPromptTokens = 0
      let totalCompletionTokens = 0

      console.log(`[Advocates] Ending session ${req.sessionId} with ${rounds.length} rounds`)

      // Collect all user responses with their intent
      const roundByRound = rounds
        .filter(r => r.userMessage && r.userIntent)
        .map(r => ({
          roundNumber: r.roundNumber,
          userMessage: r.userMessage!,
          intent: r.userIntent!
        }))

      // Build trend arrays
      const trends = {
        defensiveness: roundByRound.map(r => r.intent.defensive),
        epistemicOpenness: roundByRound.map(r => r.intent.epistemic),
        cooperation: roundByRound.map(r => r.intent.cooperative),
        persuasive: roundByRound.map(r => r.intent.persuasive)
      }

      // Generate pattern analysis
      let pattern: PatternAnalysis
      try {
        const patternPrompt = buildPatternAnalysisPrompt(roundByRound)
        const patternDs = await callDeepseekWithUsage(
          [{ role: 'user', content: patternPrompt }],
          0.3,
          800,
          true
        )
        totalPromptTokens += patternDs.promptTokens
        totalCompletionTokens += patternDs.completionTokens
        const cleaned = patternDs.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        pattern = JSON.parse(cleaned)
      } catch (error) {
        console.warn('[Advocates] Failed to generate pattern analysis')
        pattern = {
          overallPattern: 'Unable to analyze pattern',
          turningPoint: null,
          taizongParallel: 'Analysis unavailable',
          trajectory: 'stable'
        }
      }

      // Detect key dismissals
      let keyDismissals: KeyDismissal[] = []
      try {
        const allCritiques = rounds.flatMap(r =>
          r.critiques.map(c => ({ content: c.content, advocateId: c.advocateId }))
        )
        const userResponses = roundByRound.map(r => r.userMessage)

        const dismissalPrompt = buildDismissalDetectionPrompt(allCritiques, userResponses)
        const dismissalDs = await callDeepseekWithUsage(
          [{ role: 'user', content: dismissalPrompt }],
          0.3,
          800,
          true
        )
        totalPromptTokens += dismissalDs.promptTokens
        totalCompletionTokens += dismissalDs.completionTokens
        const cleaned = dismissalDs.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const parsed = JSON.parse(cleaned)
        keyDismissals = parsed.dismissals || []
      } catch (error) {
        console.warn('[Advocates] Failed to detect dismissals')
      }

      // Build transcript
      let transcript = `DEVIL'S ADVOCATES SESSION
Session ID: ${req.sessionId}
Date: ${new Date().toISOString()}

PROPOSAL:
${proposal}

ADVOCATES:
${advocates.map(a => `- ${a.id} (${a.lens})`).join('\n')}

---

`

      rounds.forEach(round => {
        transcript += `ROUND ${round.roundNumber}:\n\n`

        round.critiques.forEach(critique => {
          transcript += `${critique.advocateId}:\n${critique.content}\n\n`
        })

        if (round.userMessage) {
          transcript += `YOUR RESPONSE:\n${round.userMessage}\n\n`
        }

        transcript += '---\n\n'
      })

      transcript += `ANALYSIS:\n\n${pattern.overallPattern}\n\n`
      transcript += `Trajectory: ${pattern.trajectory}\n`
      if (pattern.turningPoint) {
        transcript += `Turning point: Round ${pattern.turningPoint}\n`
      }

      console.log(`[Advocates] Session analysis complete - Trajectory: ${pattern.trajectory}`)

      return {
        result: {
          success: true,
          analysis: {
            roundByRound,
            trends,
            pattern,
            keyDismissals
          },
          transcript
        } as EndSessionResponse,
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
      }
    })
  }
)

// ---- AI Provider Proxy Endpoints -------------------------------------------
// These endpoints proxy requests to external AI APIs to avoid browser CORS
// restrictions. The client sends the API key and request body; the backend
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
