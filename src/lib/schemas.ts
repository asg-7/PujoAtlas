import { z } from 'zod';

export type Zone = 'NORTH' | 'SOUTH' | 'CENTRAL' | 'EAST' | 'HOWRAH' | 'OTHERS' | 'WEST';
export const ZoneSchema = z.enum(['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST']);

export type FoodCategory = 'RESTAURANT' | 'CAFE' | 'DHABA' | 'STREET_FOOD' | 'SWEETS';
export const FoodCategorySchema = z.enum(['RESTAURANT', 'CAFE', 'DHABA', 'STREET_FOOD', 'SWEETS']);

export type PriceRange = 'BUDGET' | 'MID_RANGE' | 'PREMIUM';
export const PriceRangeSchema = z.enum(['BUDGET', 'MID_RANGE', 'PREMIUM']);

export type BestDay = 'Chaturthi' | 'Panchami' | 'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami';
export const BestDaySchema = z.enum([
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
]);

export type SourcePlatform = 'reddit' | 'instagram' | 'google' | 'facebook';
export const SourcePlatformSchema = z.enum(['reddit', 'instagram', 'google', 'facebook']);

export interface SourceUrl {
  platform: SourcePlatform;
  url: string;
}

export const SourceUrlSchema: z.ZodType<SourceUrl> = z.object({
  platform: SourcePlatformSchema,
  url: z.string(),
});

export interface PandalEntity {
  id: string;
  name: string;
  zone: Zone;
  address: string;
  lat: number;
  lng: number;
  nearestMetroStationId?: string;
  nearestMetro?: string;
  bestTimeToVisit?: string[];
  bestDays?: ('Chaturthi' | 'Panchami' | 'Shashthi' | 'Saptami' | 'Ashtami' | 'Navami' | 'Dashami')[];
  isFamous?: boolean;
  isFeatured?: boolean;
  isHeritage?: boolean;
  established?: number;
  rating?: number;
  crowdLevel?: string;
  tags?: string[];
  themeDescription?: string;
  categories?: string[];
  googleMapsUrl?: string;
  sourceUrls?: SourceUrl[];
}

export const PandalSchema: z.ZodType<PandalEntity> = z.object({
  id: z.string(),
  name: z.string(),
  zone: ZoneSchema,
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  nearestMetroStationId: z.string().optional(),
  nearestMetro: z.string().optional(),
  bestTimeToVisit: z.array(z.string()).optional(),
  bestDays: z.array(BestDaySchema).optional(),
  isFamous: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isHeritage: z.boolean().optional(),
  established: z.number().optional(),
  rating: z.number().optional(),
  crowdLevel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  themeDescription: z.string().optional(),
  categories: z.array(z.string()).optional(),
  googleMapsUrl: z.string().optional(),
  sourceUrls: z.array(SourceUrlSchema).optional(),
});

export interface FoodEntity {
  id: string;
  name: string;
  category: FoodCategory;
  priceRange: PriceRange;
  zone: Zone;
  address: string;
  lat: number;
  lng: number;
  nearestMetroStationId: string;
  famousFor: string[];
  mustTryDishes: string[];
  openHours: string;
  isLateNight: boolean;
  associatedPandals: string[];
  rating?: number;
  sourceUrls: SourceUrl[];
}

export const FoodSchema: z.ZodType<FoodEntity> = z.object({
  id: z.string(),
  name: z.string(),
  category: FoodCategorySchema,
  priceRange: PriceRangeSchema,
  zone: ZoneSchema,
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  nearestMetroStationId: z.string(),
  famousFor: z.array(z.string()),
  mustTryDishes: z.array(z.string()),
  openHours: z.string(),
  isLateNight: z.boolean(),
  associatedPandals: z.array(z.string()),
  rating: z.number().optional(),
  sourceUrls: z.array(SourceUrlSchema),
});

export interface MetroStationEntity {
  id: string;
  name: string;
  lineId: string;
  lineName: string;
  lineColorHex: string;
  lat: number;
  lng: number;
  zone: Zone;
  isInterchange?: boolean;
}

export const MetroStationSchema: z.ZodType<MetroStationEntity> = z.object({
  id: z.string(),
  name: z.string(),
  lineId: z.string(),
  lineName: z.string(),
  lineColorHex: z.string(),
  lat: z.number(),
  lng: z.number(),
  zone: ZoneSchema,
  isInterchange: z.boolean().optional(),
});

export type MetroLineCode = 'BLUE' | 'GREEN' | 'PURPLE' | 'ORANGE';
export const MetroLineCodeSchema = z.enum(['BLUE', 'GREEN', 'PURPLE', 'ORANGE']);

export interface MetroLineEntity {
  id: string;
  name: string;
  code: MetroLineCode;
  colorHex: string;
  stations: MetroStationEntity[];
}

export const MetroLineSchema: z.ZodType<MetroLineEntity> = z.object({
  id: z.string(),
  name: z.string(),
  code: MetroLineCodeSchema,
  colorHex: z.string(),
  stations: z.array(MetroStationSchema),
});

export interface ZoneEntity {
  id: Zone;
  name: string;
  description: string;
  center: {
    lat: number;
    lng: number;
  };
  bounds?: number[][];
}

export const ZoneEntitySchema: z.ZodType<ZoneEntity> = z.object({
  id: ZoneSchema,
  name: z.string(),
  description: z.string(),
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  bounds: z.array(z.array(z.number())).optional(),
});
