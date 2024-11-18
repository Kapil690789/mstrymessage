'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const fallbackMessages = [
  "What's your favorite movie?",
  "Do you have any pets?",
  "What's your dream job?",
  "If you could travel anywhere, where would you go?",
  "What's a book that changed your life?",
  "Do you prefer the mountains or the beach?",
  "What's your go-to comfort food?",
  "What's the most interesting thing you've learned recently?",
  "If you could master any skill instantly, what would it be?",
  "What's a small thing that always makes you smile?",
];

const additionalMessages = [
  "What's the best advice you've ever received?",
  "What's a food you could eat every day?",
  "What's a skill you're currently learning?",
  "What's the last TV show you binge-watched?",
  "Do you believe in luck or hard work?",
  "What's your favorite childhood memory?",
  "If you could have any superpower, what would it be?",
  "What's a song that always puts you in a good mood?",
  "Do you enjoy cooking? If yes, what's your favorite dish to make?",
  "What's a travel destination on your bucket list?",
];

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(fallbackMessages);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data?.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await axios.post('/api/suggest-messages');
      const completion = response.data.completion ?? ''; // Use empty string if undefined
      setSuggestedMessages(parseStringMessages(completion));
      setShowFallback(false); // Hide fallback state
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Using fallback messages due to an error.',
        variant: 'default',
      });
      setSuggestedMessages(fallbackMessages);
      setShowFallback(true); // Show fallback state
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const loadMoreMessages = () => {
    setSuggestedMessages((prevMessages) => [...prevMessages, ...additionalMessages]);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`container mx-auto my-8 p-6 rounded max-w-4xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-4xl font-bold mb-6 text-center">Public Profile Link</h1>

      {/* Sliding Toggle Button with Light/Dark Text */}
      <div className="flex items-center justify-center mb-4">
        <span className={`mr-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Light</span>
        <div
          onClick={toggleTheme}
          className="flex items-center cursor-pointer w-16 h-8 rounded-full p-1 border-2 border-gray-400 dark:border-gray-600 bg-gray-300 dark:bg-gray-700 transition-all"
        >
          <div
            className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`}
          />
        </div>
        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>Dark</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          {showFallback && !isSuggestLoading && (
            <Button onClick={fetchSuggestedMessages} className="my-4" disabled={isSuggestLoading}>
              {isSuggestLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Suggest Messages'
              )}
            </Button>
          )}

          {!showFallback && (
            <Button
              onClick={() => {
                setSuggestedMessages(fallbackMessages);
                setShowFallback(true);
              }}
              className="my-4"
            >
              Back to Fallback Messages
            </Button>
          )}

          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {suggestedMessages.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                className="mb-2"
                onClick={() => handleMessageClick(message)}
              >
                {message}
              </Button>
            ))}
            <Button variant="outline" onClick={loadMoreMessages}>
              See More Messages
            </Button>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
