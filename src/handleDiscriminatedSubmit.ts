import { omit } from 'es-toolkit';
import {
  type SubmitHandler,
  type Path,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';
import type { OmitDeep } from 'type-fest';

type DiscriminatedHandlerMap<
  DiscriminantKey extends Path<TFieldValues>,
  TFieldValues extends FieldValues = FieldValues,
> = {
  [K in TFieldValues[DiscriminantKey]]: SubmitHandler<
    OmitDeep<Extract<TFieldValues, Record<DiscriminantKey, K>>, DiscriminantKey>
  >;
};

export function createDiscriminatedSubmitHandler<
  const DiscriminantKey extends Path<TFieldValues>,
  TFieldValues extends FieldValues,
>(
  form: UseFormReturn<TFieldValues>,
  discriminantKey: DiscriminantKey,
  handlers: DiscriminatedHandlerMap<DiscriminantKey, TFieldValues>,
): SubmitHandler<TFieldValues> {
  return (values) => {
    const discriminantValue = values[
      discriminantKey
    ] as TFieldValues[DiscriminantKey];

    const handler = handlers[discriminantValue];
    if (!handler) {
      throw new Error(
        `No handler found for discriminant value: ${String(discriminantValue)}`,
      );
    }

    return handler(
      omit(
        values as Extract<
          TFieldValues,
          Record<DiscriminantKey, typeof discriminantValue>
        >,
        [discriminantKey],
      ) as OmitDeep<
        Extract<
          TFieldValues,
          Record<DiscriminantKey, typeof discriminantValue>
        >,
        DiscriminantKey
      >,
    );
  };
}
