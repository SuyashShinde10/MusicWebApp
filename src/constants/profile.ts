import type { AudioQuality, MembershipPlan } from '../types/music';

export const AVATAR_PRESETS: ReadonlyArray<{ label: string; url: string }> = [
  { label: 'Molly', url: '/covers/molly-hunter.jpg' },
  { label: 'Electric', url: '/covers/electric-dreams.jpg' },
  { label: 'Midnight', url: '/covers/midnight-echo.jpg' },
  { label: 'Shadows', url: '/covers/shadows-and-light.jpg' },
  { label: 'Neon', url: '/covers/neon-skyline.jpg' },
  { label: 'Velvet', url: '/covers/velvet-starlight.jpg' },
];

export const PLAN_META: Record<
  MembershipPlan,
  { badgeClass: string; subtitle: string; ringClass: string }
> = {
  Premium: {
    badgeClass: 'bg-orange-500/15 text-orange-700 dark:bg-orange-600/25 dark:text-orange-300',
    subtitle: 'Ad-free streams · Unlimited playlists',
    ringClass: 'ring-orange-500/70',
  },
  'Hi-Fi Studio': {
    badgeClass:
      'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    subtitle: 'Lossless master · Priority mixes',
    ringClass: 'ring-amber-400/80',
  },
  Free: {
    badgeClass: 'bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-gray-300',
    subtitle: 'Standard library & playlists',
    ringClass: 'ring-slate-400/60',
  },
};

export const QUALITY_META: ReadonlyArray<{
  value: AudioQuality;
  label: string;
  bitrate: string;
}> = [
  { value: 'Standard', label: 'Standard', bitrate: '128 kbps' },
  { value: 'High', label: 'High', bitrate: '256 kbps' },
  { value: 'Lossless', label: 'Lossless', bitrate: '320+ kbps' },
];
