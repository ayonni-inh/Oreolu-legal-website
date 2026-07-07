import { NextRequest, NextResponse } from 'next/server';
import { activityLog, cases, lawyers, reminders, signatureRequests, getModel, cleanJsonText } from '@/lib/server/shared';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const recent = activityLog.slice(0, 25).map(a => `[${a.timestamp.slice(11,16)}] ${a.actorRole} ${a.actorName} - ${a.action}: ${a.details}`).join('\n');
    const summary = `OPEN CASES: ${cases.length} (HIGH=${cases.filter(c=>c.priority==='HIGH').length}, MED=${cases.filter(c=>c.priority==='MEDIUM').length}, LOW=${cases.filter(c=>c.priority==='LOW').length}). LAWYERS: ${lawyers.length}. PENDING ESIGN: ${signatureRequests.filter(s=>s.status==='PENDING').length}. UPCOMING REMINDERS: ${reminders.filter(r=>r.status==='SCHEDULED').length}.`;
    const model = getModel();
    if (!model) {
      const m = (message || '').toLowerCase();
      let reply = `Activity snapshot:\n${summary}\n\nRecent events:\n${recent.split('\n').slice(0,8).join('\n')}`;
      if (m.includes('priority') || m.includes('urgent')) {
        const high = cases.filter(c => c.priority === 'HIGH').map(c => `• ${c.id} - ${c.title} (next: ${c.nextAction})`).join('\n') || 'No HIGH priority cases.';
        reply = `HIGH-priority cases requiring attention:\n${high}`;
      } else if (m.includes('assign') || m.includes('lawyer')) {
        const unassigned = cases.filter(c => !c.assignedLawyerId).map(c => `• ${c.id} - ${c.title} (${c.category})`).join('\n') || 'All cases are assigned.';
        reply = `Unassigned cases:\n${unassigned}\n\nUse the Lawyer Assignment tab — I will recommend the best match by specialty + capacity + rating.`;
      } else if (m.includes('remind')) {
        reply = `${reminders.filter(r=>r.status==='SCHEDULED').length} reminders are scheduled. Open the Reminders tab to add more.`;
      } else if (m.includes('sign') || m.includes('e-sign')) {
        reply = `Pending signatures: ${signatureRequests.filter(s=>s.status==='PENDING').length}. Open the E-Signature tab to chase or send new requests.`;
      }
      return NextResponse.json({ text: reply, fallback: true });
    }

    const systemPrompt = `You are the Admin AI Agent for OROELU GODWIN AGIDI & CO. You have full read access to the firm's live activity stream and case data. Be concise, action-oriented, and reference IDs (e.g. CASE-1001) when relevant.

Current firm snapshot:
${summary}

Recent activity stream (newest first):
${recent}`;

    const result = await model.generateContent({
      contents: [
        ...(history || []).map((h: any) => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      systemInstruction: systemPrompt
    } as any);
    return NextResponse.json({ text: result.response.text() });
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}