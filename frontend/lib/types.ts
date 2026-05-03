export type PredictionInput = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

export type CropGuide = {
  season: string;
  soil: string;
  tips: string;
};

export type PredictionResponse = {
  recommendedCrop: string;
  modelOutput: string;
  guide: CropGuide;
  imageUrl: string;
  inputs: PredictionInput;
};

export type WeatherResponse = {
  city: string;
  country: string;
  description: string;
  icon: string;
  temperature: number;
  humidity: number;
  feelsLike: number;
  windSpeed: number;
  rainfallLastHour: number;
  rainfallLast3Hours: number;
};

export type MarketPrice = {
  crop: string;
  market: string;
  pricePerQuintal: number;
  trend: "up" | "down" | "stable";
  updatedAt: string;
};
