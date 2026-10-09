import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Basic heuristic guardrail checks for prompt injection & toxic text
    const lowerPrompt = prompt.toLowerCase();
    
    const injectionKeywords = [
      'ignore previous instructions',
      'ignore all previous instructions',
      'system prompt',
      'you are now',
      'jailbreak',
      'disregard'
    ];

    const hasInjection = injectionKeywords.some(keyword => lowerPrompt.includes(keyword));

    if (hasInjection) {
      return NextResponse.json({
        safe: false,
        reason: 'Potential prompt injection or jailbreak detected.',
        sanitized_prompt: '[BLOCKED BY GUARDRAIL]'
      }, { status: 200 });
    }

    // If it passes basic checks
    return NextResponse.json({
      safe: true,
      reason: 'Prompt looks safe.',
      sanitized_prompt: prompt
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 500 });
  }
}
