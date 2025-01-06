export interface EmotionData {
  timeSeriesData: {
    labels: string[];
    positive: number[];
    negative: number[];
    overall: number[];
    emotions: {
      // Positive emotions
      motivated: number[];
      compassionate: number[];
      grateful: number[];
      intrigued: number[];
      purposeful: number[];
      contemplated: number[];
      energetic: number[];
      satisfied: number[];
      // Negative emotions
      sad: number[];
      angry: number[];
      frightened: number[];
      disgusted: number[];
      anxious: number[];
      agitated: number[];
      regretful: number[];
      annoyed: number[];
    };
  };
  totalTests: number;
  latestMood: number;
}

export interface ChartConfig {
  backgroundGradientFrom: string;
  backgroundGradientTo: string;
  color: (opacity?: number) => string;
  strokeWidth: number;
  decimalPlaces: number;
  propsForBackgroundLines: {
    strokeDasharray: string;
    stroke: string;
  };
  propsForLabels: {
    fill: string;
    fontSize: number;
  };
  propsForVerticalLabels: {
    fill: string;
    fontSize: number;
  };
  propsForHorizontalLabels: {
    fill: string;
    fontSize: number;
  };
}

export interface ChartDataset {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }>;
}

export interface TestData {
  timestamp: number;
  emotions: {
    [key: string]: number;
  };
  pre: {
    [key: string]: number;
  };
  post: {
    [key: string]: number;
  };
  categories: {
    positive: string[];
    negative: string[];
  };
}
