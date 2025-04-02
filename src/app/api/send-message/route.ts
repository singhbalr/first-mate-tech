import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { webhookUrl, message } = await request.json();

    if (!webhookUrl || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `From Rajwinder Singhbal's Slack Bot: ${message}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Slack');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 