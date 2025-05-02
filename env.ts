if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set');
}

export const env = {
  GRADIO_MODEL_ID: 'TencentARC/PhotoMaker-V2',
  GRADIO_API_URL: 'https://tencentarc-photomaker-v2.hf.space',
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
} as const;