import { createElement, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import AnimatedListRaw from './AnimatedList.jsx';
import ElasticSliderRaw from './ElasticSlider.jsx';
import JellyRadioRaw from './JellyRadio.jsx';
import ShredderRaw from './Shredder.jsx';
import SloshGaugeRaw from './SloshGauge.jsx';
import SplitTextRaw from './SplitText.jsx';
import TiltedCardRaw, { TiltedCardLayer as TiltedCardLayerRaw } from './TiltedCard.jsx';
import type {
  AnimatedListProps,
  ElasticSliderProps,
  JellyRadioProps,
  ShredderProps,
  SloshGaugeProps,
  SplitTextProps,
  TiltedCardProps,
} from './types';

export const ElasticSlider = ElasticSliderRaw as ComponentType<ElasticSliderProps>;
export const JellyRadio = JellyRadioRaw as ComponentType<JellyRadioProps>;
export const SloshGauge = SloshGaugeRaw as ComponentType<SloshGaugeProps>;
export const SplitText = SplitTextRaw as ComponentType<SplitTextProps>;
export const TiltedCard = TiltedCardRaw as ComponentType<TiltedCardProps>;
export const TiltedCardLayer = TiltedCardLayerRaw as ComponentType<{
  depth?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}>;

export function Shredder<T extends { id: string | number }>(props: ShredderProps<T>) {
  return createElement(ShredderRaw as ComponentType<ShredderProps<T>>, props);
}

export function AnimatedList<T>(props: AnimatedListProps<T>) {
  return createElement(AnimatedListRaw as ComponentType<AnimatedListProps<T>>, props);
}
