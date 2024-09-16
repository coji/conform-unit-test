import { createRemixStub } from '@remix-run/testing';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { ContactForm, action } from './route';

test('お問い合わせフォーム_メール送信成功', async () => {
  // コンタクトフォームの action を useFetch で使うコンポーネント
  const RemixStub = createRemixStub([
    { path: '/api/contact', Component: () => <ContactForm />, action },
  ]);
  render(<RemixStub initialEntries={['/api/contact']} />);

  // フォーム入力
  await userEvent.type(
    screen.getByRole('textbox', { name: 'お名前' }),
    'テスト太郎'
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: '会社名' }),
    'テスト株式会社'
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: '電話番号' }),
    '09012345678'
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: 'メール' }),
    'coji@techtalk.jp'
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: 'メッセージ' }),
    'こんにちは！'
  );
  await userEvent.click(screen.getByRole('checkbox', { name: 'privacy' }));

  // 送信
  await userEvent.click(screen.getByRole('button', { name: "Let's talk" }));

  // 送信完了の確認
  expect(
    await screen.findByText('以下のメッセージを受付けました。', {
      exact: false,
    })
  ).toBeInTheDocument();
});
