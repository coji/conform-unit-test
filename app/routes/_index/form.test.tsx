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

  await userEvent.type(screen.getByLabelText('お名前'), '溝口浩二');
  await userEvent.type(screen.getByLabelText('会社名'), '株式会社TechTalk');
  await userEvent.type(screen.getByLabelText('電話番号'), '09012345678');
  await userEvent.type(screen.getByLabelText('メール'), 'coji@techtalk.jp');
  await userEvent.type(screen.getByLabelText('メッセージ'), 'こんにち\nは');
  await userEvent.click(screen.getByRole('checkbox', { name: 'privacy' }));
  await userEvent.click(screen.getByRole('button', { name: "Let's talk" }));

  expect(
    await screen.findByText('お問い合わせありがとうございます', {
      exact: false,
    })
  ).toBeInTheDocument();
});
