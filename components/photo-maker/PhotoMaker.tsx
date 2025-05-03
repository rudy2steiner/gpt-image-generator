'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { UploadArea } from './UploadArea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StyleSelect } from './StyleSelect';
import { ASPECT_RATIOS } from '@/lib/config/styles';
import { Download } from 'lucide-react';
import { SampleTemplates } from './SampleTemplates';

export function PhotoMaker() {
  const t = useTranslations();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [style, setStyle] = useState("ghibli");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; aspectRatio: string }>>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'text-to-image' | 'image-to-image'>('text-to-image');

  const handleTextToImage = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          style,
          aspectRatio
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedImages((data.images || []).map((url: string) => ({
        url,
        aspectRatio
      })));
      toast({
        title: t('common.success'),
        description: t('common.generated')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageToImage = async () => {
    if (!uploadedImage || (!imagePrompt && style==='No Style')) return;
    
    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('prompt', imagePrompt);
    formData.append('style', style);
    formData.append('aspectRatio', aspectRatio);

    setIsGenerating(true);
    try {
      const response = await fetch('/api/image-to-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const r = data.aspectRatio;
      setGeneratedImages((data.images || []).map((url: string) => ({
        url,
        aspectRatio : r
      })));
      toast({
        title: t('common.success'),
        description: t('common.generated')
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download image',
        variant: 'destructive'
      });
    }
  };

  const handleTemplateSelect = async (template: { 
    prompt: string; 
    style: string; 
    aspectRatio: string;
    originalImage?: string;
  }) => {
    if (activeTab === 'text-to-image') {
      setPrompt(template.prompt);
    } else {
      setImagePrompt(template.prompt);
      if (template.originalImage) {
        try {
          const response = await fetch(template.originalImage);
          const blob = await response.blob();
          const file = new File([blob], 'template-image.jpg', { type: 'image/jpeg' });
          setUploadedImage(file);
        } catch (error) {
          console.error('Failed to load template image:', error);
          toast({
            title: 'Error',
            description: 'Failed to load template image',
            variant: 'destructive'
          });
        }
      }
    }
    setStyle(template.style);
    setAspectRatio(template.aspectRatio);
  };

  // Get aspect ratio dimensions for CSS
  const getAspectRatioStyle = (ratio: string) => {
    const [width, height] = ratio.split(':').map(Number);
    return {
      aspectRatio: `${width}/${height}`,
      objectFit: 'cover' as const
    };
  };

  return (
    <div className="space-y-8">
      {/* Main Generation Section */}
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls - Left Side */}
          <Card className="p-6">
            <Tabs 
              defaultValue="text-to-image" 
              className="w-full"
              onValueChange={(value) => setActiveTab(value as 'text-to-image' | 'image-to-image')}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="text-to-image">Text to Image</TabsTrigger>
                <TabsTrigger value="image-to-image">Image to Image</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text-to-image" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map(ratio => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTextToImage}
                  disabled={!prompt || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <LoadingIndicator />
                  ) : (
                    'Generate Image'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="image-to-image" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <Label>Upload Image</Label>
                  <UploadArea
                    files={uploadedImage ? [uploadedImage] : []}
                    onFilesChange={(files) => setUploadedImage(files[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transformation Prompt</Label>
                  <Textarea
                    placeholder="Describe how you want to modify this image..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <StyleSelect value={style} onChange={setStyle} />
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map(ratio => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleImageToImage}
                  disabled={!uploadedImage || (!imagePrompt && style==='No Style') || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <LoadingIndicator />
                  ) : (
                    'Transform Image'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Results - Right Side */}
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Generated Images</h3>
              {Array.isArray(generatedImages) && generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="w-full rounded-lg overflow-hidden"
                        style={getAspectRatioStyle(image.aspectRatio)}
                      >
                        <img
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-full"
                          style={getAspectRatioStyle(image.aspectRatio)}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:text-white hover:bg-white/20"
                          onClick={() => handleDownload(image.url, index)}
                        >
                          <Download className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <p>Generated images will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Sample Templates Section */}
      <div className="container mx-auto">
        <Card className="p-6">
          <SampleTemplates
            mode={activeTab}
            onSelect={handleTemplateSelect}
          />
        </Card>
      </div>
    </div>
  );
}