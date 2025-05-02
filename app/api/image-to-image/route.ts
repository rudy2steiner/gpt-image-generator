import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
    const predictions = await Promise.all([1].map(async () => {
      if (style === "ghibli") {
        return replicate.run(
                `danila013/ghibli-easycontrol:6c4785d791d08ec65ff2ca5e9a7a0c2b0ac4e07ffadfb367231aa16bc7a52cbb`,
                {
                  input: {
                    input_image: `data:image/jpeg;base64,${base64Image}`,
                    prompt:`Ghibli Studio style,${prompt}`
                  }
                }
              );
      }
      return replicate.run(
        `minimax/image-01`,
        {
          input: {
            subject_reference: `data:image/jpeg;base64,${base64Image}`,
            prompt,
            aspect_ratio: aspectRatio,
          }
        }
      );
    }));
    const images = predictions.flat();
    console.log('images:'+JSON.stringify(images));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Image to image error:', error);
    return NextResponse.json(
      { error: 'Failed to transform image' },
      { status: 500 }
    );
  }
}