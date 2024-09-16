import { Form, useActionData, useFetcher } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod, getZodConstraint } from '@conform-to/zod';
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { setTimeout } from 'node:timers/promises';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { Stack, HStack } from '~/components/ui/stack';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/components/ui/card';

export const contactFormSchema = z.object({
  name: z.string().max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(100).email(),
  message: z.string().max(10000),
  privacyPolicy: z.string().transform((value) => value === 'on'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const schema = z.discriminatedUnion('intent', [
  z
    .object({
      intent: z.literal('submit'),
    })
    .merge(contactFormSchema),
  z.object({
    intent: z.literal('reset'),
  }),
]);

export const action = async ({ request }: ActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema });
  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), value: null };
  }

  if (submission.value.intent === 'reset') {
    return { lastResult: submission.reply({ resetForm: true }), value: null };
  }

  await setTimeout(100);

  return {
    lastResult: submission.reply({ resetForm: true }),
    value: submission.value,
  };
};

export const ContactSentMessage = ({ data }: { data: ContactFormData }) => {
  const fetcher = useFetcher<typeof action>({ key: 'contact' });
  return (
    <Card>
      <CardContent>
        <CardTitle>Message has been sent</CardTitle>
        <CardDescription>
          お問い合わせありがとうございます。 以下のメッセージを受付けました。
          お返事をお待ち下さい。
        </CardDescription>
        <div className="grid max-h-96 w-full max-w-md grid-cols-[auto_1fr] justify-items-start gap-4 overflow-auto rounded p-4">
          <div>お名前</div>
          <div>{data.name}</div>
          <div>会社名</div>
          <div>{data.company}</div>
          <div>電話番号</div>
          <div>{data.phone}</div>
          <div>メールアドレス</div>
          <div>{data.email}</div>
          <div>メッセージ</div>
          <div>{data.message}</div>
        </div>

        <CardFooter>
          <fetcher.Form method="POST">
            <Button
              type="submit"
              name="intent"
              value="reset"
              disabled={fetcher.state === 'submitting'}
            >
              OK
            </Button>
          </fetcher.Form>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

type ContactFormProps = React.HTMLAttributes<HTMLFormElement>;
export const ContactForm = ({ children, ...rest }: ContactFormProps) => {
  const fetcher = useFetcher<typeof action>({ key: 'contact' });
  const actionData = fetcher.data;
  const [form, { name, company, phone, email, message, privacyPolicy }] =
    useForm({
      lastResult: actionData?.lastResult,
      constraint: getZodConstraint(schema),
      onValidate: ({ formData }) => parseWithZod(formData, { schema }),
      shouldValidate: 'onSubmit',
      shouldRevalidate: 'onInput',
    });

  if (actionData?.value?.intent === 'submit') {
    return <ContactSentMessage data={actionData.value} />;
  }

  return (
    <fetcher.Form method="POST" {...rest} {...getFormProps(form)}>
      <Stack>
        <div>
          <Label htmlFor={name.id}>お名前</Label>
          <Input
            autoComplete="name"
            {...getInputProps(name, { type: 'text' })}
          />
          <div id={name.errorId} className="text-red-500">
            {name.errors}
          </div>
        </div>

        <div>
          <Label htmlFor={company.id}>会社名</Label>
          <Input
            autoComplete="organization"
            {...getInputProps(company, { type: 'text' })}
          />
          <div id={company.errorId} className="text-red-500">
            {company.errors}
          </div>
        </div>

        <div>
          <Label htmlFor={phone.id}>電話番号</Label>
          <Input
            autoComplete="tel"
            {...getInputProps(phone, { type: 'tel' })}
          />
          <div id={phone.errorId} className="text-red-500">
            {phone.errors}
          </div>
        </div>

        <div>
          <Label htmlFor={email.id}>メール</Label>
          <Input
            autoComplete="email"
            {...getInputProps(email, { type: 'email' })}
          />
          <div id={email.errorId} className="text-red-500">
            {email.errors}
          </div>
        </div>

        <div>
          <Label htmlFor={message.id}>メッセージ</Label>
          <Textarea autoComplete="off" {...getTextareaProps(message)} />
          <div id={message.errorId} className="text-red-500">
            {message.errors}
          </div>
        </div>

        <div>
          <HStack className="items-center">
            <Checkbox
              id={privacyPolicy.id}
              name={privacyPolicy.name}
              aria-invalid={privacyPolicy.errors ? true : undefined}
              aria-describedby={
                privacyPolicy.errors ? privacyPolicy.errorId : undefined
              }
              defaultChecked={privacyPolicy.initialValue === 'on'}
              aria-label="privacy"
            />
            <label htmlFor={privacyPolicy.id} className="cursor-pointer">
              プライバシーポリシーに同意する
            </label>
          </HStack>
          <div id={privacyPolicy.errorId} className="text-red-500">
            {privacyPolicy.errors}
          </div>
        </div>

        {form.errors && (
          <Alert variant="destructive">
            <AlertTitle>System Error</AlertTitle>
            <AlertDescription>{form.errors}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          name="intent"
          value="submit"
          disabled={fetcher.state === 'submitting'}
        >
          Let's talk
        </Button>

        <div>{JSON.stringify(form.allErrors)}</div>
      </Stack>
    </fetcher.Form>
  );
};
export default ContactForm;
