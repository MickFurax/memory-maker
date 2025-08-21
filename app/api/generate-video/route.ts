import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, aspectRatio, videoLength } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Convert base64 image to blob and upload to fal
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([imageBuffer]);
    
    // Upload image to fal storage
    const imageUrl = await fal.storage.upload(imageBlob);

    // Map aspect ratio to resolution
    let resolution = "720p";
    if (aspectRatio === "9:16") {
      resolution = "768x1344";
    } else if (aspectRatio === "1:1") {
      resolution = "768x768";
    }

    // Calculate number of frames (videoLength is in frames, default 97 for ~4s at 24fps)
    const numFrames = videoLength || 121; // Default to 121 frames (~5s at 24fps)

    const result = await fal.subscribe("fal-ai/ltxv-13b-098-distilled/image-to-video", {
      input: {
        prompt,
        image_url: imageUrl,
        negative_prompt: "low quality, worst quality, deformed, distorted, blurry",
        aspect_ratio: aspectRatio || "16:9",
        num_frames: numFrames,
        frame_rate: 24,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Video URL ", result.data.video);
    return NextResponse.json({ videoUrl: result.data.video.url });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}