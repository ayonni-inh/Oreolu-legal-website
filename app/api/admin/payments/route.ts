import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json([
    { id: 'pay-1', client: 'John Wick', amount: '$5,000', service: 'Corporate Restructuring', status: 'AWAITING_VERIFICATION', date: '2024-04-20' },
    { id: 'pay-2', client: 'Sara Connor', amount: '$1,200', service: 'Property Dispute', status: 'OVERDUE', date: '2024-04-15' }
  ]);
}