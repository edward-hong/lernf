import { api, APIError, ErrCode } from "encore.dev/api";
import { secret } from "encore.dev/config";

// ---- Secrets ----------------------------------------------------------------

const DeepseekApiKey = secret("DeepseekApiKey");

// ---- Shared Helpers ---------------------------------------------------------

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepseekMessage {
  role: string;
  content: string;
}

async function callDeepseek(
  messages: DeepseekMessage[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DeepseekApiKey()}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new APIError(ErrCode.Unavailable, `DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function cleanJsonOutput(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

// ---- Health Check -----------------------------------------------------------

interface HealthResponse {
  message: string;
}

export const healthCheck = api(
  { method: "GET", path: "/", expose: true },
  async (): Promise<HealthResponse> => {
    return { message: "Code Review Practice API - Running" };
  },
);

// ---- DeepSeek Generic Endpoint ----------------------------------------------

interface DeepseekRequest {
  prompt: string;
}

interface DeepseekResponse {
  success: boolean;
  output: string;
}

export const deepseek = api(
  { method: "POST", path: "/api/deepseek", expose: true },
  async (req: DeepseekRequest): Promise<DeepseekResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, "Prompt is required");
    }

    let output = await callDeepseek(
      [{ role: "user", content: req.prompt }],
      0.7,
      2000,
    );

    // Clean markdown code blocks if trying to parse as JSON
    if (
      req.prompt.includes("Format as JSON") ||
      req.prompt.includes("Return ONLY valid JSON")
    ) {
      output = cleanJsonOutput(output);
    }

    return { success: true, output };
  },
);

// ---- NPC Dialogue -----------------------------------------------------------

interface NpcDialogueRequest {
  systemPrompt: string;
  messages: { role: string; content: string }[];
}

interface NpcDialogueResponse {
  success: boolean;
  output: string;
}

export const npcDialogue = api(
  { method: "POST", path: "/api/npc-dialogue", expose: true },
  async (req: NpcDialogueRequest): Promise<NpcDialogueResponse> => {
    if (!req.systemPrompt || !req.messages || !Array.isArray(req.messages)) {
      throw new APIError(
        ErrCode.InvalidArgument,
        "systemPrompt and messages array are required",
      );
    }

    const apiMessages: DeepseekMessage[] = [
      { role: "system", content: req.systemPrompt },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const output = await callDeepseek(apiMessages, 0.8, 300);

    return { success: true, output: output.trim() };
  },
);

// ---- Generate PR Scenario ---------------------------------------------------

interface GeneratePrRequest {
  language?: string;
}

interface GeneratePrResponse {
  success: boolean;
  scenario: Record<string, unknown>;
}

export const generatePr = api(
  { method: "POST", path: "/api/generate-pr", expose: true },
  async (req: GeneratePrRequest): Promise<GeneratePrResponse> => {
    const language = req.language || "react";

    const prompt = `Generate a realistic pull request code change with intentional bugs for code review practice.

Language: ${language}

Create a realistic PR scenario with 5-7 intentional issues. Issues should be subtle and realistic (not syntax errors).

Types of issues to include:
- Missing error handling
- Race conditions
- Memory leaks
- Security vulnerabilities
- Performance problems
- Missing edge cases
- Bad patterns

Format as JSON:
{
  "title": "PR title (e.g., 'Add user authentication caching')",
  "description": "What this PR does",
  "language": "${language}",
  "diff": [
    {
      "lineNumber": 1,
      "type": "context",
      "content": "import React from 'react';",
      "hasIssue": false
    },
    {
      "lineNumber": 2,
      "type": "added",
      "content": "const UserProfile = () => {",
      "hasIssue": false
    },
    {
      "lineNumber": 3,
      "type": "added",
      "content": "  useEffect(async () => {",
      "hasIssue": true,
      "issueId": "issue-1"
    }
  ],
  "issues": [
    {
      "id": "issue-1",
      "lineNumber": 3,
      "severity": "high",
      "title": "Async useEffect",
      "explanation": "useEffect callback cannot be async. This returns a Promise instead of cleanup function.",
      "fix": "Define async function inside useEffect and call it."
    }
  ]
}

Line types: "added" (green +), "removed" (red -), "context" (gray, no change)

Make it realistic. 30-50 lines total. Return only valid JSON.`;

    const rawContent = await callDeepseek(
      [{ role: "user", content: prompt }],
      0.7,
      6000,
    );

    const cleanContent = cleanJsonOutput(rawContent);
    const scenario = JSON.parse(cleanContent);

    return { success: true, scenario };
  },
);

// ---- Evaluate PR Review -----------------------------------------------------

interface PrIssue {
  id: string;
  lineNumber: number;
  severity: string;
  title: string;
  explanation: string;
  fix: string;
}

interface EvaluatePrRequest {
  userFindings: number[];
  correctIssues: PrIssue[];
}

interface EvaluatePrResponse {
  success: boolean;
  results: {
    total: number;
    found: number;
    missed: number;
    falsePositives: number;
    foundIssues: PrIssue[];
    missedIssues: PrIssue[];
    score: number;
  };
}

export const evaluatePr = api(
  { method: "POST", path: "/api/evaluate-pr", expose: true },
  async (req: EvaluatePrRequest): Promise<EvaluatePrResponse> => {
    const { userFindings, correctIssues } = req;

    const foundIssues = correctIssues.filter((issue) =>
      userFindings.includes(issue.lineNumber),
    );
    const missedIssues = correctIssues.filter(
      (issue) => !userFindings.includes(issue.lineNumber),
    );
    const falsePositives = userFindings.filter(
      (lineNum) =>
        !correctIssues.find((issue) => issue.lineNumber === lineNum),
    );

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
    };
  },
);

// ---- Evaluate Completion ----------------------------------------------------

interface EvaluateCompletionRequest {
  scenarioDescription: string;
  conversationHistory: string;
  completionSignals?: string;
}

interface EvaluateCompletionResponse {
  success: boolean;
  result: {
    scenarioComplete: boolean;
    reasoning: string;
    suggestedPrompt: string;
  };
}

export const evaluateCompletion = api(
  { method: "POST", path: "/api/evaluate-completion", expose: true },
  async (
    req: EvaluateCompletionRequest,
  ): Promise<EvaluateCompletionResponse> => {
    if (!req.scenarioDescription || !req.conversationHistory) {
      throw new APIError(
        ErrCode.InvalidArgument,
        "scenarioDescription and conversationHistory are required",
      );
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
}`;

    const rawOutput = await callDeepseek(
      [{ role: "user", content: prompt }],
      0.3,
      500,
    );

    const cleaned = cleanJsonOutput(rawOutput);
    const result = JSON.parse(cleaned);

    return {
      success: true,
      result: {
        scenarioComplete: Boolean(result.scenarioComplete),
        reasoning: result.reasoning || "",
        suggestedPrompt: result.suggestedPrompt || "",
      },
    };
  },
);

// ---- Evaluate GRIP ----------------------------------------------------------

interface EvaluateGripRequest {
  prompt: string;
}

interface EvaluateGripResponse {
  success: boolean;
  result: Record<string, unknown>;
}

export const evaluateGrip = api(
  { method: "POST", path: "/api/evaluate-grip", expose: true },
  async (req: EvaluateGripRequest): Promise<EvaluateGripResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, "prompt is required");
    }

    const rawOutput = await callDeepseek(
      [{ role: "user", content: req.prompt }],
      0,
      4000,
    );

    const cleaned = cleanJsonOutput(rawOutput);
    const result = JSON.parse(cleaned);

    return { success: true, result };
  },
);

// ---- Generate Consequence ---------------------------------------------------

interface GenerateConsequenceRequest {
  prompt: string;
}

interface GenerateConsequenceResponse {
  success: boolean;
  result: Record<string, unknown>;
}

export const generateConsequence = api(
  { method: "POST", path: "/api/generate-consequence", expose: true },
  async (
    req: GenerateConsequenceRequest,
  ): Promise<GenerateConsequenceResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, "prompt is required");
    }

    const rawOutput = await callDeepseek(
      [{ role: "user", content: req.prompt }],
      0.7,
      2000,
    );

    const cleaned = cleanJsonOutput(rawOutput);
    const result = JSON.parse(cleaned);

    return { success: true, result };
  },
);

// ---- Live Chat ------------------------------------------------------------

interface ChatRequest {
  messages: { role: string; content: string }[];
}

interface ChatResponse {
  success: boolean;
  output: string;
}

export const chat = api(
  { method: "POST", path: "/api/chat", expose: true },
  async (req: ChatRequest): Promise<ChatResponse> => {
    if (!req.messages || !Array.isArray(req.messages) || req.messages.length === 0) {
      throw new APIError(
        ErrCode.InvalidArgument,
        "messages array is required and must not be empty",
      );
    }

    const apiMessages: DeepseekMessage[] = req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const output = await callDeepseek(apiMessages, 0.7, 500);

    return { success: true, output: output.trim() };
  },
);

// ---- Analyze Intent -------------------------------------------------------

interface AnalyzeIntentRequest {
  prompt: string;
}

interface AnalyzeIntentResponse {
  success: boolean;
  output: string;
}

export const analyzeIntent = api(
  { method: "POST", path: "/api/analyze-intent", expose: true },
  async (req: AnalyzeIntentRequest): Promise<AnalyzeIntentResponse> => {
    if (!req.prompt) {
      throw new APIError(ErrCode.InvalidArgument, "prompt is required");
    }

    const rawOutput = await callDeepseek(
      [{ role: "user", content: req.prompt }],
      0,
      500,
    );

    const output = cleanJsonOutput(rawOutput);

    return { success: true, output };
  },
);
