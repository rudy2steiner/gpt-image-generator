export const STYLES = [
  {
    value: 'ghibli',
    label: 'Ghibli',
    preview: '/style/ghibli.webp',
    description: 'Magical and whimsical Studio Ghibli animation style'
  }
] as const;

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Classic (4:3)' },
  { value: '3:4', label: 'Portrait Classic (3:4)' }
] as const;