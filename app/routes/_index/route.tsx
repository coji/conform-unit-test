import { Form, useActionData } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { setTimeout } from 'node:timers/promises';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

const schema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('submit'),
    email: z.string().email(),
    name: z.string(),
  }),
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

export default function Index() {
  const actionData = useActionData<typeof action>();
  const [form, { email, name }] = useForm({
    lastResult: actionData?.lastResult,
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  const isSubmitted = actionData?.value;
  if (isSubmitted) {
    return (
      <div>
        <h1>Thank you!</h1>
        <pre>{JSON.stringify(isSubmitted, null, 2)}</pre>
        <form method="POST">
          <Button name="intent" value="reset" type="submit">
            Submit Another
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Form method="POST" {...getFormProps(form)}>
      <div>
        <Label htmlFor={email.id}>Email</Label>
        <Input {...getInputProps(email, { type: 'text' })} />
        <div id={email.errorId} className="text-destructive text-sm">
          {email.errors}
        </div>
      </div>

      <div>
        <Label htmlFor={name.id}>Name</Label>
        <Input {...getInputProps(name, { type: 'text' })} />
        <div id={name.errorId} className="text-destructive text-sm">
          {name.errors}
        </div>
      </div>

      <Button name="intent" value="submit" type="submit">
        Submit
      </Button>
    </Form>
  );
}
