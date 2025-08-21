import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, aspectRatio, videoLength, steps } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const input: {
      prompt: string;
      cfg: number;
      model: string;
      negative_prompt: string;
      aspect_ratio: string;
      video_length: number;
      steps: number;
      target_size: number;
      image?: string;
    } = {
      prompt,
      cfg: 15,
      model: "0.9.1",
      negative_prompt: "low quality, worst quality, deformed, distorted",
      aspect_ratio: aspectRatio || '16:9',
      video_length: videoLength || 97,
      steps: steps || 30,
      target_size: 640,
    };

    // Add image if provided (for image-to-video)
    if (image) {
      input.image = image;
    }

    const output = await replicate.run('lightricks/ltx-video:8c47da666861d081eeb4d1261853087de23923a268a69b63febdf5dc1dee08e4', {
      input,
    });

    return NextResponse.json({ videoUrl: output[0].url() });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}