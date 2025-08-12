import {env, exit} from "node:process";

import type {
    ErrorMessage,
    InferOutput,
    ObjectEntries,
    ObjectIssue,
    ObjectSchema,
} from "valibot";
import * as v from "valibot";

type IObjectSchema = ObjectSchema<
    ObjectEntries,
    ErrorMessage<ObjectIssue> | undefined
>;

export function parseEnvironment<T extends IObjectSchema>(
    schema: T,
): InferOutput<T> {
    const {issues, output, success} = v.safeParse(schema, env);

    if (!success) {
        console.error(
            "An error occurred while processing the environment variables:",
        );

        for (const issue of issues) {
            const {expected, path, message} = issue;

            const key = path
                ? path
                      .map((pathItem) => {
                          const {key} = pathItem;

                          return key;
                      })
                      .join(".")
                : expected;

            console.error(`${key}: ${message}`);
        }

        exit(1);
    }

    return output;
}
