# AI Provider Configuration Guide

## Overview

Lernf supports multiple AI providers, giving you control over which models power your learning experience.

## Supported Providers

### Claude (Anthropic)
- **Models:** Sonnet 4.5, Haiku 4.5, Opus 4
- **Best for:** Complex reasoning, long conversations
- **Get API Key:** https://console.anthropic.com/

### OpenAI
- **Models:** GPT-4o, GPT-4o-mini, o1, o3-mini
- **Best for:** General purpose, fast responses
- **Get API Key:** https://platform.openai.com/api-keys

### Google Gemini
- **Models:** Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
- **Best for:** Free tier (15 req/min), multimodal
- **Get API Key:** https://makersuite.google.com/app/apikey

## Setup Guide

1. **Get API Key**
   - Sign up at provider's website
   - Generate new API key
   - Copy entire key (starts with sk-ant-, sk-, or AIza)

2. **Configure in Lernf**
   - Go to Settings → AI Providers
   - Paste your API key
   - Select a model
   - Click "Test" to verify

3. **Set Priority**
   - Choose primary provider
   - Optionally add backups
   - Enable auto-fallback

## Best Practices

### Security
- Only add keys on devices you trust
- Use API keys with spending limits
- Rotate keys periodically
- Clear settings on shared devices

### Performance
- Set faster models (Haiku, GPT-4o-mini) as primary
- Use powerful models (Opus, o1) for complex tasks
- Configure backups to avoid interruptions

### Cost Management
- Monitor usage in provider dashboards
- Set spending limits
- Use free tier (Gemini) for testing
- Backend default is always free

## Troubleshooting

### "Invalid API Key"
- Check key copied correctly (no extra spaces)
- Verify key is active in provider dashboard
- Ensure key has proper permissions

### "Rate Limit Exceeded"
- Wait a few minutes
- Configure backup providers
- Upgrade provider tier

### "All Providers Failed"
- Check internet connection
- Verify API keys
- Try backend default
- Check provider status pages

## FAQs

**Q: Can I use multiple providers?**
A: Yes! Set backups for automatic fallback.

**Q: Is my API key secure?**
A: Keys are stored locally with basic encryption. Use only on trusted devices.

**Q: What happens if I don't configure anything?**
A: Lernf uses the backend default (DeepSeek) - no configuration needed.

**Q: Can I switch providers mid-conversation?**
A: Yes, change settings anytime. Next request uses new provider.

**Q: Does this affect all features?**
A: Yes, all AI calls (scenarios, chat, analysis) use your configured provider.
