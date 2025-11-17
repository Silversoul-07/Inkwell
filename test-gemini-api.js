#!/usr/bin/env node

/**
 * Test Gemini API Integration
 * Tests if the provided Gemini API key works with OpenAI-compatible endpoint
 */

const API_KEY = 'AIzaSyBwlsbkCMgagOxdd-bcCHkJfgPnYhAC5WQ';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
const MODEL = 'gemini-2.5-flash';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Integration\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  API Key: ${API_KEY.substring(0, 20)}...`);
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 1: List models
  console.log('Test 1: List available models...');
  try {
    const response = await fetch(`${BASE_URL}models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`Response: ${text}`);
    } else {
      const data = await response.json();
      console.log('✅ Success! Available models:');
      if (data.data && Array.isArray(data.data)) {
        data.data.slice(0, 5).forEach(model => {
          console.log(`   - ${model.id}`);
        });
        if (data.data.length > 5) {
          console.log(`   ... and ${data.data.length - 5} more`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Chat completion
  console.log('Test 2: Test chat completion...');
  try {
    const response = await fetch(`${BASE_URL}chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a creative writing assistant.'
          },
          {
            role: 'user',
            content: 'Write a single sentence to continue this story: "The old lighthouse keeper climbed the stairs one last time."'
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`❌ Failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`Response: ${text}`);
    } else {
      const data = await response.json();
      console.log('✅ Success! AI Response:');
      console.log(`\n   "${data.choices[0].message.content}"\n`);
      console.log(`   Tokens used: ${data.usage.total_tokens}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Summary
  console.log('📊 Test Summary:');
  console.log('');
  console.log('If both tests passed:');
  console.log('  ✅ Your Gemini API key is working correctly');
  console.log('  ✅ The OpenAI-compatible endpoint is functional');
  console.log('  ✅ You can use these settings in Inkwell');
  console.log('');
  console.log('To add to Inkwell:');
  console.log('  1. Open Settings → AI Models');
  console.log('  2. Click "Add New Model"');
  console.log('  3. Fill in:');
  console.log(`     - Name: Gemini 2.5 Flash`);
  console.log(`     - Provider: openai`);
  console.log(`     - Model: ${MODEL}`);
  console.log(`     - API Key: ${API_KEY}`);
  console.log(`     - Base URL: ${BASE_URL}`);
  console.log('  4. Set as default and save');
  console.log('');
}

// Run the tests
testGeminiAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
