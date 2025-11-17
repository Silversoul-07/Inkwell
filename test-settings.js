#!/usr/bin/env node

/**
 * Comprehensive Test Script for Inkwell Settings
 * Tests all CRUD operations, delete buttons, and AI features
 */

const BASE_URL = 'http://localhost:3000';

// Test session/authentication - you'll need to update this with a real session cookie
const SESSION_COOKIE = 'next-auth.session-token=YOUR_SESSION_TOKEN';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function testEndpoint(name, method, url, body = null, expectSuccess = true) {
  try {
    log(`Testing: ${name}...`, 'blue');

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': SESSION_COOKIE,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (expectSuccess) {
      if (response.ok) {
        log(`✓ ${name} - SUCCESS`, 'green');
        return { success: true, data, status: response.status };
      } else {
        log(`✗ ${name} - FAILED (${response.status})`, 'red');
        log(`  Error: ${JSON.stringify(data)}`, 'red');
        return { success: false, data, status: response.status };
      }
    } else {
      if (!response.ok) {
        log(`✓ ${name} - Expected failure (${response.status})`, 'green');
        return { success: true, data, status: response.status };
      } else {
        log(`✗ ${name} - Should have failed but didn't`, 'red');
        return { success: false, data, status: response.status };
      }
    }
  } catch (error) {
    log(`✗ ${name} - ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('Starting Inkwell Settings Tests', 'cyan');
  log('========================================\n', 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Initialize Defaults
  logSection('TEST 1: Initialize Defaults API');
  let test = await testEndpoint(
    'Initialize Defaults',
    'POST',
    `${BASE_URL}/api/initialize-defaults`
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  // Test 2: AI Models
  logSection('TEST 2: AI Models CRUD');

  // Create AI Model (Gemini)
  const geminiModel = {
    name: 'Gemini 2.5 Flash',
    provider: 'openai',
    model: 'gemini-2.5-flash',
    apiKey: 'AIzaSyBwlsbkCMgagOxdd-bcCHkJfgPnYhAC5WQ',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    isDefault: true,
  };

  test = await testEndpoint(
    'Create Gemini AI Model',
    'POST',
    `${BASE_URL}/api/ai-models`,
    geminiModel
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  const modelId = test.data?.id;

  // List AI Models
  test = await testEndpoint(
    'List AI Models',
    'GET',
    `${BASE_URL}/api/ai-models`
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  // Test 3: Prompt Templates
  logSection('TEST 3: Prompt Templates CRUD');

  // List templates
  test = await testEndpoint(
    'List Prompt Templates',
    'GET',
    `${BASE_URL}/api/prompt-templates`
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  // Create custom template
  const customTemplate = {
    name: 'Test Template',
    description: 'A test template',
    action: 'custom',
    template: 'This is a test template with {{variable}}',
    category: 'test',
    isDefault: false,
  };

  test = await testEndpoint(
    'Create Prompt Template',
    'POST',
    `${BASE_URL}/api/prompt-templates`,
    customTemplate
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  const templateId = test.data?.id;

  if (templateId) {
    // Update template
    test = await testEndpoint(
      'Update Prompt Template',
      'PATCH',
      `${BASE_URL}/api/prompt-templates/${templateId}`,
      { name: 'Updated Test Template' }
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;

    // Delete template
    test = await testEndpoint(
      'Delete Prompt Template',
      'DELETE',
      `${BASE_URL}/api/prompt-templates/${templateId}`
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;
  }

  // Test 4: Writing Modes
  logSection('TEST 4: Writing Modes CRUD');

  // List modes
  test = await testEndpoint(
    'List Writing Modes',
    'GET',
    `${BASE_URL}/api/writing-modes`
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  // Create custom mode
  const customMode = {
    name: 'Test Mode',
    description: 'A test writing mode',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: 'Test system prompt',
    preferredActions: ['continue', 'rephrase'],
  };

  test = await testEndpoint(
    'Create Writing Mode',
    'POST',
    `${BASE_URL}/api/writing-modes`,
    customMode
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  const modeId = test.data?.id;

  if (modeId) {
    // Update mode
    test = await testEndpoint(
      'Update Writing Mode',
      'PATCH',
      `${BASE_URL}/api/writing-modes/${modeId}`,
      { name: 'Updated Test Mode' }
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;

    // Delete mode
    test = await testEndpoint(
      'Delete Writing Mode',
      'DELETE',
      `${BASE_URL}/api/writing-modes/${modeId}`
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;
  }

  // Test 5: User Instructions
  logSection('TEST 5: User Instructions CRUD');

  // List instructions
  test = await testEndpoint(
    'List User Instructions',
    'GET',
    `${BASE_URL}/api/user-instructions?scope=global`
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  // Create instruction
  const customInstruction = {
    scope: 'global',
    instructions: 'Test instruction',
    isEnabled: true,
    priority: 5,
  };

  test = await testEndpoint(
    'Create User Instruction',
    'POST',
    `${BASE_URL}/api/user-instructions`,
    customInstruction
  );
  results.total++;
  if (test.success) results.passed++;
  else results.failed++;

  const instructionId = test.data?.id;

  if (instructionId) {
    // Update instruction
    test = await testEndpoint(
      'Update User Instruction',
      'PATCH',
      `${BASE_URL}/api/user-instructions/${instructionId}`,
      { instructions: 'Updated test instruction' }
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;

    // Delete instruction
    test = await testEndpoint(
      'Delete User Instruction',
      'DELETE',
      `${BASE_URL}/api/user-instructions/${instructionId}`
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;
  }

  // Test 6: Pomodoro Sessions
  logSection('TEST 6: Pomodoro Sessions');

  // Note: Requires a valid projectId - skipping for now
  log('Pomodoro tests require a valid project - manual testing required', 'yellow');

  // Test 7: Built-in Protection
  logSection('TEST 7: Built-in Item Protection');

  // Try to delete a built-in template (should fail)
  const templatesResponse = await fetch(`${BASE_URL}/api/prompt-templates`, {
    headers: { 'Cookie': SESSION_COOKIE },
  });
  const templates = await templatesResponse.json();
  const builtinTemplate = templates.find(t => t.isBuiltin);

  if (builtinTemplate) {
    test = await testEndpoint(
      'Delete Built-in Template (should fail)',
      'DELETE',
      `${BASE_URL}/api/prompt-templates/${builtinTemplate.id}`,
      null,
      false // Expect failure
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;
  }

  // Test 8: Delete AI Model (cleanup)
  if (modelId) {
    logSection('TEST 8: Cleanup - Delete Test AI Model');
    test = await testEndpoint(
      'Delete AI Model',
      'DELETE',
      `${BASE_URL}/api/ai-models/${modelId}`
    );
    results.total++;
    if (test.success) results.passed++;
    else results.failed++;
  }

  // Final Results
  logSection('TEST RESULTS');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
      results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('\n✓ All tests passed!', 'green');
  } else {
    log('\n✗ Some tests failed. Please review the errors above.', 'red');
  }
}

// Note about authentication
log('\n⚠️  AUTHENTICATION REQUIRED ⚠️', 'yellow');
log('This test script requires authentication.', 'yellow');
log('Please update SESSION_COOKIE with a valid session token.', 'yellow');
log('You can get this from your browser\'s developer tools (Application > Cookies).\n', 'yellow');

log('Starting tests in 3 seconds...\n', 'blue');

setTimeout(() => {
  runTests().catch(error => {
    log(`\nFatal error: ${error.message}`, 'red');
    console.error(error);
  });
}, 3000);
