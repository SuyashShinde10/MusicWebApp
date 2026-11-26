import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SloshGauge from '../SloshGauge';

describe('SloshGauge under StrictMode', () => {
  it('updates both value readout and liquid clipPath when value changes', async () => {
    const { rerender, container } = render(
      <StrictMode>
        <SloshGauge value={75} onChange={() => {}} interactive ariaLabel="Volume" />
      </StrictMode>
    );

    const slider = screen.getByRole('slider', { name: 'Volume' });
    const liquid = container.querySelector('.slosh-gauge__liquid') as HTMLElement | null;
    expect(slider).toHaveAttribute('aria-valuenow', '75');
    expect(liquid).not.toBeNull();
    expect(liquid?.style.clipPath).toContain('25%');

    rerender(
      <StrictMode>
        <SloshGauge value={33} onChange={() => {}} interactive ariaLabel="Volume" />
      </StrictMode>
    );

    expect(slider).toHaveAttribute('aria-valuenow', '33');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    // After spring settles at 33%, top offset in clipPath should be near 67% (not frozen at 25%)
    expect(liquid?.style.clipPath).not.toContain('25%');
    expect(liquid?.style.clipPath).toMatch(/6[67]\.\d+%|67%/);
  });
});
