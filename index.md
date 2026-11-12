# Official @wthek Extension – Valibot Transformer for `http-error-kit`

**Convert Valibot validation errors into structured `http-error-kit` errors — framework-free**

_Built for projects using [`http-error-kit`][http-error-kit], this utility transforms native Valibot validation errors into rich, consistent `BadRequestError` responses._

> 💡 What the HEK?! Tired of parsing raw Valibot errors? Let `@wthek/valibot-transformer` convert them into usable, standardized errors — no framework needed.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/skillnter/wthek-valibot-transformer/main.yml)
[![npm version](https://img.shields.io/npm/v/%40wthek%2Fvalibot-transformer?color=brightgreen)](https://www.npmjs.com/package/@wthek/valibot-transformer)
[![GitHub license](https://img.shields.io/github/license/skillnter/wthek-valibot-transformer?color=brightgreen)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Skillnter/wthek-valibot-transformer)](https://github.com/Skillnter/wthek-valibot-transformer/issues)
![npm](https://img.shields.io/npm/dy/%40wthek%2Fvalibot-transformer)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40wthek%2Fvalibot-transformer)](https://bundlephobia.com/package/%40wthek%2Fvalibot-transformer)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f0cff2dcf747487f839e41587fba3dfe)](https://app.codacy.com/gh/Skillnter/wthek-valibot-transformer/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/f0cff2dcf747487f839e41587fba3dfe)](https://app.codacy.com/gh/Skillnter/wthek-valibot-transformer/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@wthek/valibot-transformer/1.0.0)](https://socket.dev/npm/package/@wthek/valibot-transformer/overview/1.0.0)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](https://skillnter.github.io/wthek-valibot-transformer/)
[![Github Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-30363D?&logo=GitHub-Sponsors&logoColor=EA4AAA)](https://github.com/sponsors/Skillnter)
[![Open Collective](https://img.shields.io/badge/Open%20Collective-3385FF?logo=open-collective&logoColor=white)](https://opencollective.com/skillnter)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/skillnter)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/skillnter)
[![PayPal](https://img.shields.io/badge/PayPal-003087?logo=paypal&logoColor=fff)](https://www.paypal.me/skillnte)

## Features

-   **Framework-Agnostic** – Works with any HTTP server: Express, Fastify, Hono, NestJS, Koa, etc.
-   **Dual Conversion APIs** – Use `KitValibotTransformer` (throwing) or `fromValiError` (non-throwing).
-   **Preserves Issue Details** – Keeps raw Valibot issue details attached to `error.details.issues`.
-   **Configurable Options** – Customize the error message and HTTP status code (e.g. 422 Unprocessable Entity).
-   **Formatter-Friendly** – Customize output using `KitHttpErrorConfig.configureFormatter`.
-   **Composable** – Pairs seamlessly with `@wthek/*-middleware` extensions.

## Table of Content

-   [Installation](#installation)
-   [Usage](#usage)
-   [Options](#options)
-   [Explore More WTHek Extensions](#explore-more-wthek-extensions)
-   [People](#people)
-   [Donations](#donations)
-   [License](#license)

## Installation

```console
npm install @wthek/valibot-transformer
```

## Usage

### 1. `KitValibotTransformer` (Throws)

Transforms any `ValiError` into a `KitHttpError` and throws it. If the error is not a `ValiError`, it is thrown unchanged.

```typescript
import { KitValibotTransformer } from "@wthek/valibot-transformer";
import * as v from "valibot";

const schema = v.object({
    name: v.string(),
    age: v.pipe(v.number(), v.minValue(18)),
});

try {
    v.parse(schema, { name: "Hek", age: 14 }); // Fails validation
} catch (err) {
    KitValibotTransformer(err); // Throws KitHttpError with status 400 and issues
}
```

### 2. `fromValiError` (Non-throwing)

Converts a `ValiError` into a `KitHttpError` instance or returns `null` if the error is not a `ValiError`.

```typescript
import { fromValiError } from "@wthek/valibot-transformer";

const kitError = fromValiError(err);
if (kitError) {
    // Handle or return response
    return c.json(kitError, kitError.statusCode ?? 400);
}
```

### With Options

```typescript
import { KitValibotTransformer } from "@wthek/valibot-transformer";

try {
    v.parse(schema, data);
} catch (err) {
    KitValibotTransformer(err, {
        message: "Invalid payload provided",
        statusCode: 422, // Unprocessable Entity
    });
}
```

## Options

| Option       | Type     | Default                      | Description                                                |
| ------------ | -------- | ---------------------------- | ---------------------------------------------------------- |
| `message`    | `string` | `"Valibot Validation Failed"`| Custom error message for the transformed error.            |
| `statusCode` | `number` | `400`                        | Custom HTTP status code to assign to the validation error. |

### With Express / Fastify / Hono / NestJS

Use the transformer early in your error-handling pipeline — before applying framework-specific middleware like:

-   [@wthek/express-middleware][@wthek/express-middleware]
-   [@wthek/fastify-middleware][@wthek/fastify-middleware]
-   [@wthek/hono-middleware][@wthek/hono-middleware]
-   [@wthek/nestjs-middleware][@wthek/nestjs-middleware]

This ensures validation errors are transformed into `http-error-kit` errors early, allowing WTHek middleware to handle them cleanly.

### Custom Formatting with `KitHttpErrorConfig`

```typescript
import { KitHttpErrorConfig } from "http-error-kit";

KitHttpErrorConfig.configureFormatter(
    (statusCode, message, details, ...args) => ({
        code: statusCode,
        msg: message,
        extra: details,
        traceId: args[0] || "0fcb44cb-4f09-4900-8c4f-73ddd37ffe0a",
    })
);
```

## Explore More WTHek Extensions

The WTHek ecosystem continues to grow with new extensions to simplify error handling across various frameworks and libraries. Stay updated with the latest tools that integrate seamlessly with `http-error-kit`.

**Check out the official list of extensions**: [Official Extensions List](https://github.com/Skillnter/http-error-kit/wiki/Official-Extensions-List)

## People

The original author of the project is [Himanshu Bansal][skillnter]

## Donations

**This is all voluntary work**, so if you want to support my efforts you can

-   [Buy Me A Coffee](https://www.buymeacoffee.com/skillnter)
-   [Paypal](https://www.paypal.me/skillnte)
-   [GitHub Sponsor](https://github.com/sponsors/Skillnter)
-   [Patreon](https://www.patreon.com/skillnter)
-   [Open Collective](https://opencollective.com/skillnter)

You can also use the following:

![BNB: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/BNB-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

![BTC: bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf](https://img.shields.io/badge/BTC-bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf-brightgreen)

![ETH: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/ETH-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

## License

`@wthek/valibot-transformer` project is open-sourced software licensed under the [MIT license](LICENSE) by [Himanshu Bansal][skillnter].

[skillnter]: https://github.com/Skillnter/
[http-error-kit]: https://www.npmjs.com/package/http-error-kit
[@wthek/express-middleware]: https://www.npmjs.com/package/@wthek/express-middleware
[@wthek/fastify-middleware]: https://www.npmjs.com/package/@wthek/fastify-middleware
[@wthek/hono-middleware]: https://www.npmjs.com/package/@wthek/hono-middleware
[@wthek/nestjs-middleware]: https://www.npmjs.com/package/@wthek/nestjs-middleware