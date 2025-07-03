import {
  SMA,
  RSI,
  BollingerBands,
  ADX,
  ATR,
  OBV,
  StochasticRSI,
} from "technicalindicators";
import regression from "regression";
import { mean, deviation } from "d3-array";

export interface Indicator {
  name: string;
  label: string;
  description: string;
  category: "trend" | "momentum" | "volume" | "volatility" | "prediction";
  calculate: (data: number[]) => number[];
  defaultParams: Record<string, number>;
  dependencies?: string[];
}

export const indicators: Record<string, Indicator> = {
  sma: {
    name: "sma",
    label: "Simple Moving Average",
    description: "Average price over a period",
    category: "trend",
    calculate: (data: number[]) => SMA.calculate({ period: 20, values: data }),
    defaultParams: { period: 20 },
  },
  bollinger: {
    name: "bollinger",
    label: "Bollinger Bands",
    description: "Volatility bands based on standard deviation",
    category: "volatility",
    calculate: (data: number[]) => {
      const result = BollingerBands.calculate({
        period: 20,
        stdDev: 2,
        values: data,
      });
      return result.map((r: any) => r.middle); // Return middle band by default
    },
    defaultParams: { period: 20, stdDev: 2 },
  },
  rsi: {
    name: "rsi",
    label: "Relative Strength Index",
    description: "Momentum indicator comparing gains to losses",
    category: "momentum",
    calculate: (data: number[]) => RSI.calculate({ period: 14, values: data }),
    defaultParams: { period: 14 },
  },
  adx: {
    name: "adx",
    label: "Average Directional Index",
    description: "Trend strength indicator",
    category: "trend",
    calculate: (data: number[]) =>
      ADX.calculate({
        high: data,
        low: data,
        close: data,
        period: 14,
      }),
    defaultParams: { period: 14 },
  },
  atr: {
    name: "atr",
    label: "Average True Range",
    description: "Volatility indicator",
    category: "volatility",
    calculate: (data: number[]) =>
      ATR.calculate({
        high: data,
        low: data,
        close: data,
        period: 14,
      }),
    defaultParams: { period: 14 },
  },
  obv: {
    name: "obv",
    label: "On Balance Volume",
    description: "Volume flow indicator",
    category: "volume",
    calculate: (data: number[]) =>
      OBV.calculate({
        close: data,
        volume: data,
      }),
    defaultParams: {},
  },
  stochRsi: {
    name: "stochRsi",
    label: "Stochastic RSI",
    description: "Combined momentum indicator",
    category: "momentum",
    calculate: (data: number[]) =>
      StochasticRSI.calculate({
        values: data,
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3,
      }),
    defaultParams: {
      rsiPeriod: 14,
      stochasticPeriod: 14,
      kPeriod: 3,
      dPeriod: 3,
    },
  },
  regression: {
    name: "regression",
    label: "Linear Regression",
    description: "Price trend prediction",
    category: "prediction",
    calculate: (data: number[]) => {
      const points = data.map((y, i) => [i, y]);
      const result = regression.linear(points);
      return points.map(([x]) => result.predict(x)[1]);
    },
    defaultParams: {},
  },
};

export const detectPatterns = (data: number[]): string[] => {
  const patterns: string[] = [];
  const len = data.length;
  const avg = mean(data) || 0;
  const std = deviation(data) || 0;
  

  // Head and Shoulders
  const checkHeadShoulders = () => {
    if (len < 20) return false;
    const left = data.slice(0, 6);
    const head = data.slice(7, 13);
    const right = data.slice(14, 20);

    const leftPeak = Math.max(...left);
    const headPeak = Math.max(...head);
    const rightPeak = Math.max(...right);

    return (
      headPeak > leftPeak &&
      headPeak > rightPeak &&
      Math.abs(leftPeak - rightPeak) < std * 0.5
    );
  };

  // Bull Flag
  const checkBullFlag = () => {
    if (len < 10) return false;
    const trend = data.slice(0, 5);
    const flag = data.slice(5, 10);

    const trendSlope = (trend[4] - trend[0]) / 4;
    const flagSlope = (flag[4] - flag[0]) / 4;

    return trendSlope > 0 && Math.abs(flagSlope) < trendSlope * 0.3;
  };

  if (checkHeadShoulders()) patterns.push("Head and Shoulders");
  if (checkBullFlag()) patterns.push("Bull Flag");

  return patterns;
};

export const calculateAllIndicators = (
  data: number[],
  selectedIndicators: string[] = [],
) => {
  const results: Record<string, number[]> = {};

  selectedIndicators.forEach((name) => {
    if (indicators[name]) {
      results[name] = indicators[name].calculate(data);
    }
  });

  return results;
};
