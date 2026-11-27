import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JellyRadio } from '..';

describe('JellyRadio under StrictMode', () => {
  it('selects chips via click and arrow keys without losing reactivity', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StrictMode>
        <JellyRadio
          items={['All', 'Relax', 'Party', 'Jazz']}
          defaultValue="All"
          onChange={handleChange}
          ariaLabel="Filter by genre"
        />
      </StrictMode>
    );

    const allBtn = screen.getByRole('radio', { name: 'All' });
    const partyBtn = screen.getByRole('radio', { name: 'Party' });
    expect(allBtn).toHaveAttribute('aria-checked', 'true');

    await user.click(partyBtn);
    expect(handleChange).toHaveBeenCalledWith('Party', 2);
    expect(partyBtn).toHaveAttribute('aria-checked', 'true');

    partyBtn.focus();
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith('Jazz', 3);
    expect(screen.getByRole('radio', { name: 'Jazz' })).toHaveAttribute('aria-checked', 'true');
  });
});
