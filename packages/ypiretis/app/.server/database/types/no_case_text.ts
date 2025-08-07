import {customType} from "drizzle-orm/sqlite-core";

export interface INoCaseTextConfig {
    readonly length?: number;
}

const noCaseText = customType<{
    data: string;
    driverData: string;
    config?: INoCaseTextConfig;
    default: true;
    notNull: true;
}>({
    dataType(config) {
        const {length = null} = config ?? {};

        if (length !== null) {
            return `text(${length}) COLLATE NOCASE`;
        }

        return `text COLLATE NOCASE`;
    },
});

export default noCaseText;
