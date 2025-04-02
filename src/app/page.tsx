'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [delay, setDelay] = useState<string>('');
  const [unit, setUnit] = useState<string>('minutes');
  const [message, setMessage] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (remainingTime > 0) {
      countdownInterval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [remainingTime]);

  const handleSend = async () => {
    if (!delay || !message || !webhookUrl) return;

    setIsSending(true);
    const delayInSeconds = Number(delay) * (unit === 'seconds' ? 1 : unit === 'minutes' ? 60 : 3600);
    setRemainingTime(delayInSeconds);
    
    setTimeout(async () => {
      try {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookUrl,
            message,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }

        // Reset form after successful send
        setDelay('');
        setMessage('');
        setWebhookUrl('');
        setRemainingTime(0);
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please check your webhook URL and try again.');
      } finally {
        setIsSending(false);
      }
    }, delayInSeconds * 1000);
  };

  const isFormValid = delay !== '' && message !== '' && webhookUrl !== '';

  const getButtonText = () => {
    if (isSending && remainingTime > 0) {
      return `Sending in ${remainingTime} seconds...`;
    }
    if (isSending) {
      return 'Sending...';
    }
    if (delay && !isNaN(Number(delay))) {
      return `Send in ${delay} ${unit}`;
    }
    return 'Send';
  };

  return (
    <main className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Slack Message Scheduler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Delay</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter delay"
                value={delay}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDelay(e.target.value)}
                min="1"
                disabled={isSending}
              />
              <Select value={unit} onValueChange={setUnit} disabled={isSending}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slack Message</label>
            <Input
              placeholder="Enter your message"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slack Webhook URL</label>
            <Input
              placeholder="Enter webhook URL"
              value={webhookUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
              disabled={isSending}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!isFormValid || isSending}
          >
            {getButtonText()}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
