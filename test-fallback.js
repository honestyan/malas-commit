#!/usr/bin/env node

/**
 * Test script to verify the Gemini fallback implementation
 * Run with: node test-fallback.js
 */

import { config } from './out/config.js';

console.log('=== Testing Gemini Fallback Implementation ===\n');

// Test 1: Check if files exist and can be imported
console.log('Test 1: Checking if all required files exist...');
try {
  const { generateCompletionWithGroq } = await import('./out/api/groqClient.js');
  console.log('✓ groqClient.js imported successfully');
  
  const { generateCompletionWithGemini } = await import('./out/api/geminiClient.js');
  console.log('✓ geminiClient.js imported successfully');
  
  const { generateCompletion } = await import('./out/api/aiClient.js');
  console.log('✓ aiClient.js imported successfully');
  
  const { generateCommitMessage } = await import('./out/services/commitService.js');
  console.log('✓ commitService.js imported successfully');
  
  console.log('\n✅ All files built correctly!\n');
} catch (error) {
  console.error('❌ Import error:', error.message);
  process.exit(1);
}

// Test 2: Check configuration
console.log('Test 2: Checking configuration...');
console.log('GROQ_APIKEY configured:', config.GROQ_APIKEY ? '✓ Yes' : '✗ No');
console.log('GEMINI_APIKEY configured:', config.GEMINI_APIKEY ? '✓ Yes' : '✗ No');

if (!config.GROQ_APIKEY && !config.GEMINI_APIKEY) {
  console.log('\n⚠️  Warning: No API keys configured.');
  console.log('Set at least one API key to test the functionality:');
  console.log('  - malas setConfig GROQ_APIKEY <your-key>');
  console.log('  - malas setConfig GEMINI_APIKEY <your-key>');
}

// Test 3: Test the fallback logic
console.log('\nTest 3: Testing fallback logic...');
try {
  const { generateCompletion } = await import('./out/api/aiClient.js');
  
  console.log('\nFallback Logic Test:');
  console.log('--------------------');
  
  // Create test messages
  const testMessages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Say 'test successful' in 2 words only." }
  ];
  
  if (config.GROQ_APIKEY || config.GEMINI_APIKEY) {
    console.log('Attempting to generate completion...\n');
    const result = await generateCompletion(testMessages);
    console.log('\n✅ Completion successful!');
    console.log('Response:', result);
  } else {
    console.log('⚠️  Skipping live API test (no API keys configured)');
    
    // Test that error is thrown when no keys
    try {
      await generateCompletion(testMessages);
      console.log('❌ Should have thrown error for missing API keys');
    } catch (error) {
      if (error.message.includes('No API keys configured')) {
        console.log('✓ Correctly throws error when no API keys configured');
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }
  }
  
} catch (error) {
  console.error('❌ Fallback logic test failed:', error.message);
  process.exit(1);
}

console.log('\n=== All Tests Complete ===');
