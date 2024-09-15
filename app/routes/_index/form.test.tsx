import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRemixStub } from '@remix-run/testing';
import { action, default as Index } from './route';
import userEvent from '@testing-library/user-event';

test('Form', async () => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: () => <Index />,
      action,
    },
  ]);

  render(<RemixStub />);

  await userEvent.type(screen.getByLabelText('Email'), 'coji@techtalk.jp');
  await userEvent.type(screen.getByLabelText('Name'), 'Coji');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

  expect(
    await screen.findByText('Thank you', { exact: false })
  ).toBeInTheDocument();
});
