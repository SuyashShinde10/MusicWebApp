import { useEffect, useState, type FormEvent } from 'react';
import { Check, Crown, RotateCcw, UserCog } from 'lucide-react';
import { AVATAR_PRESETS, PLAN_META, QUALITY_META } from '../../constants/profile';
import { DEFAULT_USER_PROFILE } from '../../services/playlistStorage';
import type { AudioQuality, MembershipPlan, UserProfile } from '../../types/music';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

const PLANS: MembershipPlan[] = ['Premium', 'Hi-Fi Studio', 'Free'];

export function ProfileSettingsModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: ProfileSettingsModalProps) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [plan, setPlan] = useState<MembershipPlan>(profile.plan);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>(profile.audioQuality);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name);
    setHandle(profile.handle);
    setPlan(profile.plan);
    setAvatarUrl(profile.avatarUrl);
    setAudioQuality(profile.audioQuality);
    setTouched(false);
  }, [isOpen, profile]);

  const trimmedName = name.trim();
  const nameError = trimmedName.length === 0 ? 'Display name is required.' : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;

    const cleanHandleRaw = handle.trim().replace(/^@+/, '');
    const cleanHandle = cleanHandleRaw
      ? `@${cleanHandleRaw}`
      : `@${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}`;

    onSave({
      name: trimmedName,
      handle: cleanHandle,
      plan,
      avatarUrl,
      audioQuality,
    });
    onClose();
  };

  const handleReset = () => {
    setName(DEFAULT_USER_PROFILE.name);
    setHandle(DEFAULT_USER_PROFILE.handle);
    setPlan(DEFAULT_USER_PROFILE.plan);
    setAvatarUrl(DEFAULT_USER_PROFILE.avatarUrl);
    setAudioQuality(DEFAULT_USER_PROFILE.audioQuality);
    setTouched(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Listener Profile & Plan"
      subtitle="Personalize your RhythmoTune identity, badge, and stream quality."
      icon={<UserCog className="w-5 h-5" />}
      maxWidthClass="max-w-lg"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" form="profile-settings-form">
              Save Profile
            </Button>
          </div>
        </div>
      }
    >
      <form id="profile-settings-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Live Preview Pill */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarUrl}
              alt={trimmedName || 'Listener avatar preview'}
              className={`w-11 h-11 rounded-full object-cover ring-2 shrink-0 ${PLAN_META[plan].ringClass}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {trimmedName || 'Your Name'}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                {handle.trim() || '@listener'}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${PLAN_META[plan].badgeClass}`}
          >
            {plan === 'Hi-Fi Studio' && <Crown className="w-3 h-3" />}
            {plan}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Display Name"
            placeholder="e.g. Molly Hunter"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!touched) setTouched(true);
            }}
            error={touched ? nameError : null}
            maxLength={40}
            autoFocus
          />

          <Input
            label="Handle"
            placeholder="@molly.hunter"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            maxLength={32}
          />
        </div>

        {/* Avatar Presets */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Avatar Style
          </p>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const selected = avatarUrl === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setAvatarUrl(preset.url)}
                  aria-label={`Choose ${preset.label} avatar`}
                  aria-pressed={selected}
                  className={`relative rounded-xl p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    selected
                      ? 'bg-teal-500/15 ring-2 ring-teal-500'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  {selected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Membership Tier */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Membership Tier
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PLANS.map((tier) => {
              const selected = plan === tier;
              const meta = PLAN_META[tier];
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setPlan(tier)}
                  aria-pressed={selected}
                  className={`text-left p-2.5 rounded-xl border transition ${
                    selected
                      ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/15'
                      : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
                  }`}
                >
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.badgeClass}`}>
                    {tier === 'Hi-Fi Studio' && <Crown className="w-2.5 h-2.5" />}
                    {tier}
                  </span>
                  <p className="mt-1.5 text-[11px] text-slate-500 dark:text-gray-400 leading-snug">
                    {meta.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Audio Quality */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Preferred Audio Quality
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_META.map((q) => {
              const selected = audioQuality === q.value;
              return (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setAudioQuality(q.value)}
                  aria-pressed={selected}
                  className={`py-2 px-2.5 rounded-xl border text-center transition ${
                    selected
                      ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-gray-300'
                  }`}
                >
                  <p className="text-xs font-bold">{q.label}</p>
                  <p className="text-[10px] opacity-75">{q.bitrate}</p>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
