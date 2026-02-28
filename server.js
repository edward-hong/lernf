// server.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Code Review Practice API - Running' })
})

// DeepSeek endpoint
app.post('/api/deepseek', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({
        error: 'DeepSeek API error',
        details: error,
      })
    }

    const data = await response.json()
    let output = data.choices[0].message.content

    // Clean markdown code blocks if trying to parse as JSON
    if (
      prompt.includes('Format as JSON') ||
      prompt.includes('Return ONLY valid JSON')
    ) {
      output = output
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
    }

    res.json({
      success: true,
      output: output,
    })
  } catch (error) {
    console.error('DeepSeek API Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// NPC dialogue generation endpoint
// Accepts a system prompt + messages array for multi-turn NPC conversation
app.post('/api/npc-dialogue', async (req, res) => {
  try {
    const { systemPrompt, messages } = req.body

    if (!systemPrompt || !messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: 'systemPrompt and messages array are required' })
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.8,
          max_tokens: 300,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({
        error: 'DeepSeek API error',
        details: error,
      })
    }

    const data = await response.json()
    const output = data.choices[0].message.content.trim()

    res.json({
      success: true,
      output,
    })
  } catch (error) {
    console.error('NPC Dialogue Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Add this endpoint to your existing server.js

// Generate a PR scenario
app.post('/api/generate-pr', async (req, res) => {
  try {
    const { language } = req.body // 'react' or 'csharp'

    const prompt = `Generate a realistic pull request code change with intentional bugs for code review practice.

Language: ${language || 'react'}

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
  "language": "${language || 'react'}",
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

Make it realistic. 30-50 lines total. Return only valid JSON.`

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 6000,
        }),
      }
    )

    const data = await response.json()
    const rawContent = data.choices[0].message.content

    // Clean markdown code blocks
    const cleanContent = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const scenario = JSON.parse(cleanContent)

    res.json({
      success: true,
      scenario,
    })
  } catch (error) {
    console.error('Error generating PR:', error)
    res.status(500).json({
      error: 'Failed to generate PR',
      message: error.message,
    })
  }
})

// Scenario completion detection — AI evaluator
app.post('/api/evaluate-completion', async (req, res) => {
  try {
    const { scenarioDescription, conversationHistory, completionSignals } = req.body

    if (!scenarioDescription || !conversationHistory) {
      return res
        .status(400)
        .json({ error: 'scenarioDescription and conversationHistory are required' })
    }

    const prompt = `You are an evaluator for a workplace scenario role-play training exercise.

SCENARIO DESCRIPTION:
${scenarioDescription}

COMPLETION SIGNALS (indicators that the scenario has reached a natural conclusion):
${completionSignals}

CONVERSATION HISTORY:
${conversationHistory}

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

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({
        error: 'DeepSeek API error',
        details: error,
      })
    }

    const data = await response.json()
    let output = data.choices[0].message.content.trim()

    // Clean markdown code blocks
    output = output
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const result = JSON.parse(output)

    res.json({
      success: true,
      result: {
        scenarioComplete: Boolean(result.scenarioComplete),
        reasoning: result.reasoning || '',
        suggestedPrompt: result.suggestedPrompt || '',
      },
    })
  } catch (error) {
    console.error('Completion Evaluation Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// GRIP evaluation — comprehensive scenario scoring
// Uses temperature=0 for consistent, reproducible evaluations
app.post('/api/evaluate-grip', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res
        .status(400)
        .json({ error: 'prompt is required' })
    }

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          max_tokens: 4000,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({
        error: 'DeepSeek API error',
        details: error,
      })
    }

    const data = await response.json()
    let output = data.choices[0].message.content.trim()

    // Clean markdown code blocks
    output = output
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const result = JSON.parse(output)

    res.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('GRIP Evaluation Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// Consequence generation — post-scenario narrative outcomes
// Uses temperature=0.7 for creative but grounded consequence narratives
app.post('/api/generate-consequence', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res
        .status(400)
        .json({ error: 'prompt is required' })
    }

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return res.status(response.status).json({
        error: 'DeepSeek API error',
        details: error,
      })
    }

    const data = await response.json()
    let output = data.choices[0].message.content.trim()

    // Clean markdown code blocks
    output = output
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const result = JSON.parse(output)

    res.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Consequence Generation Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// Evaluate PR review
app.post('/api/evaluate-pr', async (req, res) => {
  try {
    const { userFindings, correctIssues } = req.body

    // userFindings: array of line numbers user marked
    // correctIssues: array of actual issues from scenario

    const foundIssues = correctIssues.filter((issue) =>
      userFindings.includes(issue.lineNumber)
    )

    const missedIssues = correctIssues.filter(
      (issue) => !userFindings.includes(issue.lineNumber)
    )

    const falsePositives = userFindings.filter(
      (lineNum) => !correctIssues.find((issue) => issue.lineNumber === lineNum)
    )

    res.json({
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
    })
  } catch (error) {
    console.error('Error evaluating PR:', error)
    res.status(500).json({
      error: 'Failed to evaluate PR',
      message: error.message,
    })
  }
})
