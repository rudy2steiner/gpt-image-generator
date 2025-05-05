import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import sharp from 'sharp';
import { memoryQuota } from '@/lib/services/MemoryQuotaService';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MAX_POLLING_ATTEMPTS = 120; // Maximum number of polling attempts
const POLLING_INTERVAL = 1000; // Polling interval in milliseconds




async function getImageAspectRatio(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await sharp(buffer).metadata();

    if (metadata.width && metadata.height) {
      // Simplify the aspect ratio
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(metadata.width, metadata.height);
      return `${metadata.width/divisor}:${metadata.height/divisor}`;
    }

    return '1:1'; // Default fallback
  } catch (error) {
    console.error('Error getting image aspect ratio:', error);
    return '1:1'; // Default fallback
  }
}


async function pollPrediction(id: string): Promise<any> {
  let attempts = 0;

  while (attempts < MAX_POLLING_ATTEMPTS) {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === 'succeeded') {
      return prediction.output;
    }

    if (prediction.status === 'failed') {
      throw new Error('Prediction failed');
    }

    // Wait before next polling attempt
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    attempts++;
  }

  throw new Error('Prediction timed out');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const style = formData.get('style') as string;
    const aspectRatio = formData.get('aspectRatio') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const hasQuota = await memoryQuota.checkAndUpdateQuota(request);
    console.log('hasQuota:'+hasQuota+'-------');
    // Run multiple predictions in parallel
    if (!hasQuota) {
     return NextResponse.json({error:'Today Free Quota Used Out!',
          images:[],
          code:201
      });
    }
    // Create prediction
    const prediction = await replicate.predictions.create({
      version: style === "ghibli"
        ? "6c4785d791d08ec65ff2ca5e9a7a0c2b0ac4e07ffadfb367231aa16bc7a52cbb"
        : "minimax/image-01",
      input: style === "ghibli"
        ? {
            input_image: `data:image/jpeg;base64,${base64Image}`,
            prompt: `Ghibli Studio style,${prompt}`
          }
        : {
            subject_reference: `data:image/jpeg;base64,${base64Image}`,
            prompt,
            aspect_ratio: aspectRatio,
          }
    });

    // Poll for results
    const output = await pollPrediction(prediction.id);
    const outputAspectRatio = await getImageAspectRatio(output);
    console.log('ratio:'+outputAspectRatio);
    return NextResponse.json({ images: [output], aspectRatio: outputAspectRatio});
  } catch (error) {
    console.error('Image to image error:', error);
    return NextResponse.json(
      { error: 'Failed to transform image' },
      { status: 500 }
    );
  }
}