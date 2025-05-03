import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const MAX_POLLING_ATTEMPTS = 60; // Maximum number of polling attempts
const POLLING_INTERVAL = 1000; // Polling interval in milliseconds

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
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
    // Run multiple predictions in parallel
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

    const output = await pollPrediction(prediction.id);
    return NextResponse.json({ images: [output] });
  } catch (error) {
    console.error('Image to image error:', error);
    return NextResponse.json(
      { error: 'Failed to transform image' },
      { status: 500 }
    );
  }
}