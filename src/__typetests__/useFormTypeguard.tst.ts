import { expect, test } from 'tstyche';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useFormTypeguard } from '../useFormTypegurard';

test('useFormTypeguard with simple discriminant', () => {
  type SimpleForm =
    | {
        kind: 'a';
        value: string;
      }
    | {
        kind: 'b';
        value: number;
      };

  const form = useForm<SimpleForm>({ defaultValues: { kind: 'a', value: '' } });
  const isKindA = useFormTypeguard(form, { kind: 'a' });
  if (isKindA) {
    expect(form).type.toBe<
      UseFormReturn<Extract<SimpleForm, { kind: 'a' }>> &
        UseFormReturn<SimpleForm, any, SimpleForm>
    >();
  }

  form.setValue('kind', 'b');

  const isKindB = useFormTypeguard(form, { kind: 'b' });
  if (isKindB) {
    expect(form).type.toBe<
      UseFormReturn<Extract<SimpleForm, { kind: 'b' }>> &
        UseFormReturn<SimpleForm, any, SimpleForm>
    >();
  }
});
