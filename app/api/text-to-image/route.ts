import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { prompt, style, aspectRatio } = await request.json();

    // Run multiple predictions in parallel
    const predictions = await Promise.all([1].map(async () => {
      return replicate.run(
        `black-forest-labs/flux-1.1-pro`,
        {
          input: {
            prompt,
            aspect_ratio: aspectRatio,
            num_outputs: 1,
          }
        }
      );
    }));

    const images = predictions.flat();
    console.log('images:'+JSON.stringify(images));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Text to image error:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}