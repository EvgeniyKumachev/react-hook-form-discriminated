import { type FieldValues, useFormContext } from 'react-hook-form';

/**
 * Creates a type-safe form context hook for discriminated union forms.
 *
 * This factory function returns a hook that provides typed access to form context
 * based on discriminant values. It enables components to access form data with
 * proper TypeScript typing that narrows based on the discriminant field.
 *
 * @template TFormValues - The complete union form values type
 * @template TDiscriminantKey - The key used to discriminate between form variants
 *
 * @returns A hook factory that creates typed form context hooks
 *
 * @example
 * ```typescript
 * // Define discriminated form types
 * type FormValues =
 *   | { type: 'login'; email: string; password: string }
 *   | { type: 'register'; email: string; password: string; confirmPassword: string }
 *   | { type: 'reset'; email: string };
 *
 * // Create a typed form context hook using 'type' as discriminant
 * const useForm = createDiscriminatedFormCtx<FormValues, 'type'>();
 *
 * function LoginForm() {
 *   // Get typed form context for login forms
 *   const { register, formState } = useForm<'login'>();
 *
 *   // Fully typed - TypeScript knows this is a login form
 *   return (
 *     <form>
 *       <input {...register('email')} type="email" />
 *       <input {...register('password')} type="password" />
 *       <input {...register('confirmPassword')} /> // ❌ TypeScript error
 *     </form>
 *   );
 * }
 *
 * function RegisterForm() {
 *   const { register, formState } = useForm<'register'>();
 *
 *   return (
 *     <form>
 *       <input {...register('email')} type="email" />
 *       <input {...register('password')} type="password" />
 *       <input {...register('confirmPassword')} /> // ✅ Available
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Complex nested discriminant forms
 * type UserForm = {
 *   role: 'user';
 *   profile: { name: string; email: string };
 *   preferences: { theme: 'light' | 'dark' };
 * };
 *
 * type AdminForm = {
 *   role: 'admin';
 *   profile: { name: string; email: string };
 *   permissions: string[];
 *   settings: { systemAccess: boolean };
 * };
 *
 * type AppForm = UserForm | AdminForm;
 *
 * // Create context hook with 'role' as discriminant
 * const useFormByRole = createDiscriminatedFormCtx<AppForm, 'role'>();
 *
 * function UserProfile() {
 *   const { getValues } = useFormByRole<'user'>();
 *   const preferences = getValues('preferences'); // ✅ Type-safe
 *   const permissions = getValues('permissions'); // ❌ TypeScript error
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Generic component that works with any form type
 * function FormField<T extends FormValues['type']>({
 *   discriminant,
 *   ...props
 * }: {
 *   discriminant: T;
 *   name: keyof Extract<FormValues, { type: T }>;
 * }) {
 *   const { register, formState } = useForm<T>();
 *
 *   // The form is properly typed based on the discriminant
 *   return <input {...register(name)} {...props} />;
 * }
 *
 * // Usage
 * <FormField discriminant="login" name="email" type="email" />
 * <FormField discriminant="register" name="confirmPassword" type="password" />
 * ```
 */
export const createDiscriminatedFormCtx = <
  TFormValues extends FieldValues,
  TDiscriminantKey extends keyof TFormValues,
>() => {
  // Extract the possible values of the discriminant field
  // For FormValues = { type: 'user' } | { type: 'admin' }, this becomes 'user' | 'admin'
  type DiscriminantValue = TFormValues[TDiscriminantKey];

  /**
   * Maps discriminant values to their corresponding form value types
   *
   * This creates a type that looks like:
   * {
   *   'user': Extract<FormValues, { type: 'user' }>,
   *   'admin': Extract<FormValues, { type: 'admin' }>
   * }
   *
   * Each property contains only the fields valid for that discriminant value
   */
  type FormValuesByDiscriminant = {
    [K in DiscriminantValue]: Extract<TFormValues, Record<TDiscriminantKey, K>>;
  };

  /**
   * Returns a typed form context hook
   *
   * @template T - Optional discriminant value to narrow the form type
   * @returns A hook that provides typed access to form context
   *
   * When T is provided (e.g., 'user'), the hook returns form context
   * typed as Extract<FormValues, { type: 'user' }>
   *
   * When T is undefined, the hook returns the full union FormValues type
   */
  return <T extends DiscriminantValue | undefined = undefined>() =>
    useFormContext<
      T extends DiscriminantValue ? FormValuesByDiscriminant[T] : TFormValues
    >();
};
