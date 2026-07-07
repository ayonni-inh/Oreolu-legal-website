import { NextRequest, NextResponse } from 'next/server';
import { getModel, cleanJsonText } from '@/lib/server/shared';

function safeParseInsights(text: string) {
  try {
    const cleaned = cleanJsonText(text);
    if (!cleaned) return null;
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { userData } = await req.json();
    const model = getModel();
    if (!model) return NextResponse.json({ error: 'AI Service unavailable' }, { status: 503 });

    const prompt = `
        As an AI Legal Strategist for OROELU GODWIN AGIDI & CO, analyze this client's profile and provide 3 actionable insights or recommendations.
        
        Client Profile:
        - Company: ${userData.companyName}
        - Industry: ${userData.industry || 'General'}
        - Active Cases: ${JSON.stringify(userData.activeCases || [])}
        
        Focus on:
        1. Risk mitigation (e.g., AML/CTF compliance if applicable).
        2. Growth opportunities (e.g., trademarking, restructuring).
        3. Immediate next steps.
        
        Keep descriptions concise (max 15 words).
        Return purely a JSON array of objects with keys: "title", "description", "type" (one of: 'action', 'recommendation', 'risk').
      `;

    const result = await model.generateContent(prompt);
    const data = safeParseInsights(result.response.text());
    if (data) return NextResponse.json(data);
    return NextResponse.json([
      { title: 'Review compliance posture', description: 'Verify AML/CTF policies align with current operations.', type: 'risk' },
      { title: 'Protect intellectual assets', description: 'Consider trademarking key brands and proprietary processes.', type: 'recommendation' },
      { title: 'Schedule case check-in', description: 'Confirm next steps and deadlines with your legal team.', type: 'action' }
    ]);
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
