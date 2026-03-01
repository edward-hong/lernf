# AI Provider Settings - Testing Checklist

## Phase 1: Core Infrastructure
- [ ] Settings save to localStorage
- [ ] Settings load from localStorage
- [ ] API keys are obfuscated in storage
- [ ] Default settings work when no config exists
- [ ] Validation catches invalid API keys
- [ ] Provider metadata is correct

## Phase 2: API Integration
- [ ] Claude API calls work with valid key
- [ ] OpenAI API calls work with valid key
- [ ] Gemini API calls work with valid key
- [ ] Backend default works without user keys
- [ ] Fallback chain works (primary → backup → backend)
- [ ] Error types classified correctly (auth, rate limit, network)

## Phase 3: Settings UI
- [ ] Can add API keys for all providers
- [ ] Show/hide key button works
- [ ] Key format validation works
- [ ] Can test each provider individually
- [ ] Can test complete configuration
- [ ] Can set primary provider
- [ ] Can add/remove/reorder backup providers
- [ ] Settings auto-save
- [ ] Can reset all settings

## Phase 4: Feature Integration
- [ ] Feature 5 chat uses configured provider
- [ ] Intent analysis uses configured provider
- [ ] Provider indicator shows when enabled
- [ ] All AI calls migrated (no hardcoded fetch)
- [ ] Error messages are helpful

## Phase 5: Polish
- [ ] Onboarding modal shows on first visit
- [ ] Notification banner appears after 10 requests
- [ ] Help tooltips work
- [ ] Export settings downloads JSON
- [ ] Import settings works
- [ ] Performance stats display correctly
- [ ] Mobile responsive

## Error Scenarios
- [ ] Invalid API key shows clear error
- [ ] Rate limit triggers fallback
- [ ] Network error retries with backup
- [ ] All providers failing shows comprehensive error
- [ ] Settings page accessible when errors occur

## Security
- [ ] API keys not visible in plain text
- [ ] Security warnings displayed
- [ ] Exported settings have partial keys only
- [ ] Can clear all settings easily

## Performance
- [ ] No noticeable lag with provider switching
- [ ] Settings load quickly
- [ ] Auto-save doesn't cause UI jank
- [ ] Performance monitoring doesn't slow down app
