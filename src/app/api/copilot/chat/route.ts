import { NextResponse } from 'next/server';
import { executeCopilotTool, COPILOT_TOOLS_SCHEMA } from '@/lib/ai/copilot-tools';

export async function POST(request: Request) {
  try {
    const { message, toolCall } = await request.json();

    if (toolCall) {
      const toolResult = await executeCopilotTool(toolCall.name, toolCall.arguments);
      return NextResponse.json({
        success: true,
        toolResult,
        reply: `Executed action ${toolCall.name}: ${JSON.stringify(toolResult)}`
      });
    }

    // Default conversational response
    return NextResponse.json({
      success: true,
      reply: `⚡ EcoSync Autonomous Co-Pilot: Processed query "${message}". I can help you set battery optimization, view solar stats, or place energy trade offers.`,
      availableTools: COPILOT_TOOLS_SCHEMA.map(t => t.name)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
