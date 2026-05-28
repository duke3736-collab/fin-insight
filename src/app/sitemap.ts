import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools.weknews.com';

  const calculators = [
    'apartment-roi', 'broker-fee', 'deposit', 'goal-tracker', 'gold-price',
    'grant-matcher', 'growth-fund', 'health-insurance', 'isa', 'part-time-salary',
    'real-estate-tax', 'salary', 'severance', 'yield-snapshot', 'zzantech'
  ];

  const calcUrls = calculators.map((calc) => ({
    url: `${baseUrl}/calculators/${calc}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...calcUrls,
  ];
}
