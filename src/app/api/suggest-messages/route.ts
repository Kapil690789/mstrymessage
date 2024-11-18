import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

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

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      max_tokens: 100,
      stream: true,
      prompt,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.status === 429) {
      console.warn('Rate limit exceeded. Falling back to predefined messages.');
      return NextResponse.json(
        { fallbackMessages: fallbackMessages.join('||') },
        { status: 200 }
      );
    } else {
      console.error('Unexpected error occurred:', error);
      return NextResponse.json(
        { error: 'Failed to generate suggestions' },
        { status: 500 }
      );
    }
  }
}
