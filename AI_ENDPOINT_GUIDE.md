# AI Endpoint Configuration Guide

Inkwell uses the **OpenAI SDK** which is compatible with any API that follows the OpenAI API format. This guide will help you configure your AI provider correctly.

## Important: Endpoint Format

All endpoints **must end with `/v1`**. The OpenAI SDK automatically appends `/chat/completions` to your base URL.

## Supported Providers

### OpenAI
- **Endpoint:** `https://api.openai.com/v1`
- **API Key:** Get from https://platform.openai.com/api-keys
- **Models:** `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`, `gpt-4o`, etc.

### Groq (Fast Inference)
- **Endpoint:** `https://api.groq.com/openai/v1`
- **API Key:** Get from https://console.groq.com/keys
- **Models:** `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, etc.

### Together AI
- **Endpoint:** `https://api.together.xyz/v1`
- **API Key:** Get from https://api.together.xyz/settings/api-keys
- **Models:** `meta-llama/Llama-3-70b-chat-hf`, `mistralai/Mixtral-8x7B-Instruct-v0.1`, etc.

### OpenRouter (Access to Multiple Models)
- **Endpoint:** `https://openrouter.ai/api/v1`
- **API Key:** Get from https://openrouter.ai/keys
- **Models:** Supports many models - check their website for the full list

### DeepSeek
- **Endpoint:** `https://api.deepseek.com/v1`
- **API Key:** Get from https://platform.deepseek.com/api_keys
- **Models:** `deepseek-chat`, `deepseek-coder`

### Local Models (Ollama)
- **Endpoint:** `http://localhost:11434/v1`
- **API Key:** Leave blank or use any value (not validated locally)
- **Models:** Any model you've pulled with Ollama (e.g., `llama3.1`, `mistral`, `codellama`)
- **Setup:** 
  1. Install Ollama from https://ollama.com
  2. Run `ollama serve` to start the server
  3. Pull a model: `ollama pull llama3.1`

### Local Models (LM Studio)
- **Endpoint:** `http://localhost:1234/v1`
- **API Key:** Not required
- **Models:** Any model loaded in LM Studio
- **Setup:**
  1. Download LM Studio from https://lmstudio.ai
  2. Load a model
  3. Start the local server from the "Local Server" tab

### Anthropic (via OpenRouter or other proxies)
Note: Anthropic's Claude API uses a different format. To use Claude, use OpenRouter as your endpoint.

## Configuration Steps

1. Go to **Settings** in Inkwell
2. Enter your **API Endpoint** (must end with `/v1`)
3. Enter your **API Key** 
4. Enter the **Model Name** for your provider
5. Click **Test Connection** to verify it works
6. Click **Save Settings**

## Common Issues

### 404 Error
- **Problem:** Endpoint URL is incorrect
- **Solution:** Make sure your endpoint ends with `/v1` and doesn't include `/chat/completions`

### 401 Error
- **Problem:** Invalid API key
- **Solution:** Check your API key is correct and hasn't expired

### Connection Refused
- **Problem:** Local server is not running
- **Solution:** Start your Ollama or LM Studio server

## Recommended Settings

### For Creative Writing (Stories, Novels)
- **Temperature:** 0.7 - 0.9
- **Max Tokens:** 2000 - 4000

### For Editing and Suggestions
- **Temperature:** 0.5 - 0.7
- **Max Tokens:** 1000 - 2000

### For Character Chat
- **Temperature:** 0.8 - 1.0 (more creative/varied responses)
- **Max Tokens:** 500 - 1000
