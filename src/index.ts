import { isValiError } from "valibot";
import { KitHttpError } from "http-error-kit";
import { BAD_REQUEST } from "http-response-status-code";

/**
 * Configuration options for KitValibotTransformer and fromValiError.
 */
export interface IKitValibotTransformerOptions {
  /**
   * Custom message for the transformed error.
   *
   * @default "Valibot Validation Failed"
   */
  message?: string;

  /**
   * Custom HTTP status code for the validation error.
   *
   * @default 400 (BAD_REQUEST)
   */
  statusCode?: number;
}

/**
 * Converts a ValiError into a KitHttpError instance without throwing.
 * Returns null if the provided error is not an instance of ValiError.
 *
 * @param {unknown} error The error to check and transform.
 * @param {IKitValibotTransformerOptions} [options] Optional configuration for the transformed error.
 * @returns {KitHttpError | null} The transformed KitHttpError, or null if not a ValiError.
 *
 * @example
 * ```typescript
 * import { fromValiError } from "@wthek/valibot-transformer";
 *
 * const kitError = fromValiError(error, { message: "Invalid Input" });
 * if (kitError) {
 *     // handle kitError
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const fromValiError = (
  error: unknown,
  options?: IKitValibotTransformerOptions,
): KitHttpError | null => {
  if (isValiError(error)) {
    const {
      message = "Valibot Validation Failed",
      statusCode = BAD_REQUEST,
    } = options ?? {};
    return new KitHttpError(statusCode, message, {
      issues: error.issues,
    });
  }
  return null;
};

/**
 * Transforms a ValiError into a structured KitHttpError with a BadRequest status
 * and throws it. If the provided error is not an instance of ValiError, it is
 * thrown unchanged.
 *
 * @param {unknown} error The error to check and transform.
 * @param {IKitValibotTransformerOptions} [options] Optional configuration for the transformed error.
 * @throws {KitHttpError} If the error is a ValiError.
 * @throws {unknown} If the error is not a ValiError, it is thrown as-is.
 *
 * @example
 * ```typescript
 * import { KitValibotTransformer } from "@wthek/valibot-transformer";
 *
 * try {
 *     v.parse(schema, data);
 * } catch (err) {
 *     KitValibotTransformer(err); // Throws KitHttpError if ValiError, or rethrows err
 * }
 * ```
 */
export const KitValibotTransformer = (
  error: unknown,
  options?: IKitValibotTransformerOptions,
): never => {
  const kitError = fromValiError(error, options);
  if (kitError) {
    throw kitError;
  }
  throw error;
};
