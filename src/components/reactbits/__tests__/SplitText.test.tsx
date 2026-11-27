import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SplitText } from '..';

describe('SplitText under StrictMode', () => {
  it('renders text cleanly and triggers completion callback', () => {
    const onComplete = vi.fn();

    render(
      <StrictMode>
        <SplitText
          tag="h1"
          text="Welcome to RhythmoTune"
          trigger="load"
          onLetterAnimationComplete={onComplete}
        />
      </StrictMode>
    );

    expect(screen.getByRole('heading', { name: 'Welcome to RhythmoTune' })).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
