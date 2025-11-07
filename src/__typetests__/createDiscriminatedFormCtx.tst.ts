import { expect, test } from 'tstyche';
import { createDiscriminatedFormCtx } from '../createDiscriminatedFormCtx';
import type { UseFormReturn } from 'react-hook-form';

test('createDiscriminatedFormCtx', () => {
  type SimpleForm =
    | {
        kind: 'a';
        value: string;
      }
    | {
        kind: 'b';
        value: number;
      };

  const useFormCtx = createDiscriminatedFormCtx<SimpleForm, 'kind'>();

  const useFormCtxA = useFormCtx<'a'>();
  expect(useFormCtxA).type.toBe<UseFormReturn<{ kind: 'a'; value: string }>>();

  const useFormCtxB = useFormCtx<'b'>();
  expect(useFormCtxB).type.toBe<UseFormReturn<{ kind: 'b'; value: number }>>();
});
