import { KitHttpError } from "http-error-kit";
import { KitValibotTransformer, fromValiError } from "../src";
import * as v from "valibot";
import { UNPROCESSABLE_ENTITY, BAD_REQUEST } from "http-response-status-code";

describe("KitValibotTransformer", () => {
  const schema = v.object({ username: v.string() });
  let sampleValiError: v.ValiError<typeof schema>;

  try {
    v.parse(schema, { username: 123 });
  } catch (err: any) {
    sampleValiError = err;
  }

  it("should throw KitHttpError when provided error is ValiError", () => {
    expect(() => KitValibotTransformer(sampleValiError)).toThrow(
      KitHttpError
    );
  });

  it("should throw KitHttpError with default message and status code", () => {
    try {
      KitValibotTransformer(sampleValiError);
    } catch (err: any) {
      expect(err).toBeInstanceOf(KitHttpError);
      expect(err.message).toBe("Valibot Validation Failed");
      expect(err.getInputs()?.statusCode).toBe(BAD_REQUEST);
      expect((err.details as any)?.issues).toEqual(
        sampleValiError.issues
      );
    }
  });

  it("should respect custom message and status code options when throwing", () => {
    try {
      KitValibotTransformer(sampleValiError, {
        message: "Custom Validation Error",
        statusCode: UNPROCESSABLE_ENTITY,
      });
    } catch (err: any) {
      expect(err).toBeInstanceOf(KitHttpError);
      expect(err.message).toBe("Custom Validation Error");
      expect(err.getInputs()?.statusCode).toBe(UNPROCESSABLE_ENTITY);
    }
  });

  it("should throw original error when error is not a ValiError", () => {
    const regularError = new Error("Standard runtime error");
    expect(() => KitValibotTransformer(regularError)).toThrow(
      regularError
    );
  });

  it("should rethrow non-error values unchanged", () => {
    expect(() => KitValibotTransformer("string error")).toThrow(
      "string error"
    );
  });
});

describe("fromValiError", () => {
  const schema = v.object({ email: v.string() });
  let sampleValiError: v.ValiError<typeof schema>;

  try {
    v.parse(schema, { email: 123 });
  } catch (err: any) {
    sampleValiError = err;
  }

  it("should return KitHttpError when error is a ValiError", () => {
    const result = fromValiError(sampleValiError);
    expect(result).toBeInstanceOf(KitHttpError);
    expect(result?.message).toBe("Valibot Validation Failed");
    expect(result?.getInputs()?.statusCode).toBe(BAD_REQUEST);
    expect((result?.details as any)?.issues).toEqual(
      sampleValiError.issues
    );
  });

  it("should respect custom options for message and status code", () => {
    const result = fromValiError(sampleValiError, {
      message: "Input validation error",
      statusCode: UNPROCESSABLE_ENTITY,
    });
    expect(result).toBeInstanceOf(KitHttpError);
    expect(result?.message).toBe("Input validation error");
    expect(result?.getInputs()?.statusCode).toBe(UNPROCESSABLE_ENTITY);
  });

  it("should return null when error is a standard Error", () => {
    const result = fromValiError(new Error("Generic error"));
    expect(result).toBeNull();
  });

  it("should return null when error is null or undefined", () => {
    expect(fromValiError(null)).toBeNull();
    expect(fromValiError(undefined)).toBeNull();
  });
});

