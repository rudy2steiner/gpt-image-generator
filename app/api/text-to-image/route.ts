import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { memoryQuota } from '@/lib/services/MemoryQuotaService';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { prompt, style, aspectRatio } = await request.json();
    const hasQuota = await memoryQuota.checkAndUpdateQuota(request);
    console.log('hasQuota:'+hasQuota+'-------');
    // Run multiple predictions in parallel
    if (!hasQuota) {
     return NextResponse.json({error:'Today Free Quota Used Out!',
          images:[],
          code:201
      });
    }
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