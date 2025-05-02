export const TEXT_TO_IMAGE_SAMPLES = [
  {
    title: 'Anime Portrait',
    prompt: "A captivating woman, mayafoxx, sits on a velvet armchair in a softly lit room. She has pale skin and dark brown hair styled in a messy low bun, with a few strands loose around her face. She's wearing a deep charcoal velvet slip dress with thin straps and a daringly low back. The dress flows gently over her body like shadow and silk, revealing just enough to spark curiosity. Her makeup is subtle but intense: smoky eyes with a blend of black and violet, and matte deep burgundy lips. She wears a delicate gold bracelet on one wrist, with a tiny letter “E” charm. Her legs are crossed, one foot tucked under her, wearing minimal black ballet flats. The lighting casts soft shadows, highlighting the curves of her back and the smooth texture of the velvet. The ambiance is infused with mystery and allure — this is not a seductive pose, but an effortlessly sensual moment frozen in time. Background is elegant, moody, with hints of art deco styling and faint reflections. Her gaze is off-camera, contemplative and mesmerizing.",
    style: 'ghibli',
    aspectRatio: '1:1',
    preview: '/demo/dm.png',
  },
  {
      title: 'Anime Portrait',
      prompt: "womens street skateboarding final in Paris Olympics 2024",
      style: 'ghibli',
      aspectRatio: '1:1',
      preview: '/demo/olympics.png',
    }
] as const;

export const IMAGE_TO_IMAGE_SAMPLES = [
  {
    title: 'Ghibli',
    prompt: '',
    style: 'ghibli',
    aspectRatio: '1:1',
    originalImage: '/style/4a.webp',
    preview: '/style/4g.png'
  },
  {
      title: 'Ghibli',
      prompt: '',
      style: 'ghibli',
      aspectRatio: '1:1',
      originalImage: '/demo/biz.jpeg',
      preview: '/demo/ghibli.png'
    }
] as const;