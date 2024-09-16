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
import { Input } from '~/components/ui/input';
import { Stack } from '~/components/ui/stack';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/components/ui/card';

export const contactFormSchema = z.object({
  name: z.string().max(100),
  email: z.string().max(100).email(),
  secret: z.string(),
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
        <CardDescription>Thank you!</CardDescription>
        <div className="grid max-h-96 w-full max-w-md grid-cols-[auto_1fr] justify-items-start gap-4 overflow-auto rounded p-4">
          <div>name</div>
          <div>{data.name}</div>
          <div>email</div>
          <div>{data.email}</div>
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
  const [form, { name, email }] = useForm({
    lastResult: actionData?.lastResult,
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => {
      console.log('formData', Object.fromEntries(formData.entries()));
      return parseWithZod(formData, { schema });
    },
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
          <Label htmlFor={name.id}>name</Label>
          <Input {...getInputProps(name, { type: 'text' })} />
          <div id={name.errorId} className="text-red-500">
            {name.errors}
          </div>
        </div>

        <div>
          <Label htmlFor={email.id}>email</Label>
          <Input {...getInputProps(email, { type: 'email' })} />
          <div id={email.errorId} className="text-red-500">
            {email.errors}
          </div>
        </div>

        {form.errors && (
          <Alert variant="destructive">
            <AlertTitle>System Error</AlertTitle>
            <AlertDescription>{form.errors}</AlertDescription>
          </Alert>
        )}

        <input form={form.id} type="hidden" name="secret" value="123" />

        <Button
          type="submit"
          name="intent"
          value="submit"
          disabled={fetcher.state === 'submitting'}
        >
          Submit
        </Button>

        <div>{JSON.stringify(form.allErrors)}</div>
      </Stack>
    </fetcher.Form>
  );
};
export default ContactForm;
