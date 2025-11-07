import { useMemo } from 'react';
import {
  type FieldValues,
  type Path,
  type UseFormReturn,
  useWatch,
} from 'react-hook-form';

import { flattenObject } from 'es-toolkit';
import { get } from 'es-toolkit/compat';
import type {
  IsUnion,
  PartialDeep,
  RequireAtLeastOne,
  TupleToObject,
  UnionToTuple,
  ValueOf,
} from 'type-fest';

/**
 * Type utility that extracts forms matching the discriminant pattern from a union of forms
 *
 * @example
 * ```typescript
 * // Given forms with different discriminant shapes
 * type FormUnion = UseFormReturn<UserForm | AdminForm>;
 *
 * // Extract only forms where userType === 'admin'
 * type AdminForms = ExtractByDiscriminant<FormUnion, { userType: 'admin' }>;
 * // Result: UseFormReturn<AdminForm>
 * ```
 */
type ExtractByDiscriminant<
  TUnion,
  TDiscriminant extends Record<string, unknown>,
> = TUnion extends infer U
  ? U extends UseFormReturn<infer FormValues>
    ? FormValues extends TDiscriminant
      ? U
      : never
    : never
  : never;

/**
 * Maps a record of field values to corresponding UseFormReturn types
 *
 * @example
 * ```typescript
 * type FormTypes = { user: UserForm, admin: AdminForm };
 * type FormReturns = MapFieldTypeToUseForm<FormTypes>;
 * // Result: UseFormReturn<UserForm> | UseFormReturn<AdminForm>
 * ```
 */
type MapFieldTypeToUseForm<T extends Record<string, FieldValues>> = ValueOf<{
  [K in keyof T]: UseFormReturn<T[K]>;
}>;

/**
 * Converts a union form type to a mapped record type
 * This transformation enables type-safe form selection based on discriminant values
 *
 * @example
 * ```typescript
 * type UnionForm = UseFormReturn<UserForm | AdminForm>;
 * type MappedForms = UseUnionFormToTyped<UnionForm>;
 * // Result: { user: UserForm, admin: AdminForm }
 * ```
 */
type UseUnionFormToTyped<T> = T extends UseFormReturn<infer U>
  ? IsUnion<U> extends true
    ? TupleToObject<UnionToTuple<U>>
    : never
  : never;

/**
 * React Hook Form type guard for discriminated union forms.
 *
 * This hook provides runtime type checking and type narrowing for forms that have
 * different shapes based on discriminant values. It watches form state and returns
 * a type guard that can be used in conditional rendering logic.
 *
 * @template TDiscriminant - The discriminant object shape used to identify form type
 * @template TFieldValues - The complete union field values type
 * @template TUseFormReturn - The form return type (inferred from react-hook-form)
 * @template TUseFormReturnsUnion - Auto-inferred union of possible form types
 * @template TTarget - Auto-inferred target form type that matches discriminant
 *
 * @param form - The form instance (or union of possible forms)
 * @param discriminant - Object with field paths and expected values to match against
 *
 * @returns A type guard boolean indicating if the current form matches the discriminant
 *
 * @example
 * ```typescript
 * // Define form types with a discriminant field
 * type UserForm = { type: 'user'; name: string; email: string };
 * type AdminForm = { type: 'admin'; name: string; permissions: string[] };
 * type FormValues = UserForm | AdminForm;
 *
 * function MyComponent() {
 *   const form = useForm<FormValues>();
 *
 *   // Type guard for admin forms
 *   const isAdminForm = useFormTypeguard(form, { type: 'admin' });
 *
 *   // Type guard for user forms with nested field
 *   const isUserWithEmail = useFormTypeguard(form, {
 *     type: 'user',
 *     email: 'admin@example.com'
 *   });
 *
 *   if (isAdminForm) {
 *     // form is now typed as UseFormReturn<AdminForm>
 *     console.log(form.getValues('permissions')); // ✅ Type-safe
 *     console.log(form.getValues('email')); // ❌ TypeScript error
 *   }
 *
 *   return (
 *     <div>
 *       {isAdminForm && <AdminPanel form={form} />}
 *       {!isAdminForm && <UserPanel form={form} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Multiple discriminant conditions for complex form matching
 * const isPremiumUser = useFormTypeguard(form, {
 *   userType: 'premium',
 *   'subscription.isActive': true,
 *   'profile.features': ['advanced', 'priority']
 * });
 * ```
 */
export function useFormTypeguard<
  const TDiscriminant extends RequireAtLeastOne<PartialDeep<TFieldValues>>,
  TFieldValues extends FieldValues = FieldValues,
  TUseFormReturn extends UseFormReturn<TFieldValues> = UseFormReturn<TFieldValues>,
  TUseFormReturnsUnion = IsUnion<TFieldValues> extends true
    ? MapFieldTypeToUseForm<UseUnionFormToTyped<TUseFormReturn>>
    : never,
  TTarget extends TUseFormReturnsUnion = ExtractByDiscriminant<
    TUseFormReturnsUnion,
    TDiscriminant
  >,
>(
  form: TUseFormReturnsUnion | UseFormReturn<TFieldValues>,
  discriminant: TDiscriminant,
): form is TTarget {
  // Flatten the discriminant object to get all field paths (including nested ones)
  // This converts { user: { type: 'admin' } } to ['user.type'] for form field watching
  const discriminantKeys = useMemo(
    () => Object.keys(flattenObject(discriminant)) as Path<TFieldValues>[],
    [JSON.stringify(discriminant)],
  );

  // Watch the specified form fields and check if they match discriminant values
  // Using compute callback for efficient comparison of watched values
  const isMatching = useWatch({
    compute: (values) =>
      discriminantKeys.every(
        (key, index) => values[index] === get(discriminant, key),
      ),
    // @ts-expect-error - Type narrowing happens at runtime, form control is compatible
    control: form.control,
    name: discriminantKeys,
  });

  return isMatching;
}
