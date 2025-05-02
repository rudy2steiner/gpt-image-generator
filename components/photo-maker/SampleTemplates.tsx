'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TEXT_TO_IMAGE_SAMPLES, IMAGE_TO_IMAGE_SAMPLES } from '@/lib/config/samples';

interface SampleTemplatesProps {
  mode: 'text-to-image' | 'image-to-image';
  onSelect: (template: {
    prompt: string;
    style: string;
    aspectRatio: string;
    originalImage?: string;
  }) => void;
}

export function SampleTemplates({ mode, onSelect }: SampleTemplatesProps) {
  const samples = mode === 'text-to-image' ? TEXT_TO_IMAGE_SAMPLES : IMAGE_TO_IMAGE_SAMPLES;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Templates</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {mode === 'image-to-image' && (
                <TableHead className="w-[100px]">Original</TableHead>
              )}
              <TableHead className="w-[100px]">Preview</TableHead>
              {mode === 'text-to-image' && (<TableHead className="max-w-[100px]">Prompt</TableHead>)}
              {mode === 'image-to-image' && (<TableHead>Style</TableHead>)}
              <TableHead>Aspect Ratio</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {samples.map((sample, index) => (
              <TableRow key={index}>
                {mode === 'image-to-image' && (
                  <TableCell>
                    <div className="relative w-20 h-20 rounded overflow-hidden">
                      <img
                        src={(sample as typeof IMAGE_TO_IMAGE_SAMPLES[number]).originalImage}
                        alt={`Original ${sample.title}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <img
                      src={sample.preview}
                      alt={sample.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </TableCell>
                {mode === 'text-to-image' && (<TableCell className="text-sm text-muted-foreground">
                  {sample.prompt}
                </TableCell>)}
                {mode === 'image-to-image' && (<TableCell className="text-sm">{sample.style}</TableCell>)}
                <TableCell className="text-sm">{sample.aspectRatio}</TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => onSelect({
                      prompt: sample.prompt,
                      style: sample.style,
                      aspectRatio: sample.aspectRatio,
                      originalImage: mode === 'image-to-image' 
                        ? (sample as typeof IMAGE_TO_IMAGE_SAMPLES[number]).originalImage 
                        : undefined
                    })}
                  >
                    Use
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}