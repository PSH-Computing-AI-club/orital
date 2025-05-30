import {customType} from "drizzle-orm/sqlite-core";

import type {ISecret, ISecretMaybe} from "../../utils/secret";
import makeSecret, {exposeIfSecret} from "../../utils/secret";

export type ISecretText = ISecret<string>;

export type ISecretTextMaybe = ISecretMaybe<string>;

const secretText = customType<{
    data: ISecretText;
    driverData: string;
    config: undefined;
    default: false;
}>({
    dataType() {
        return "text";
    },

    fromDriver(value) {
        return makeSecret(value);
    },

    toDriver(value: ISecretTextMaybe) {
        return exposeIfSecret(value);
    },
});

export default secretText;
