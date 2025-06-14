import {data} from "react-router";

import type {ITokensTable} from "../database/tables/tokens_table";

import {getSession} from "../services/flash_service";
import type {IToken, ITokensService} from "../services/tokens_service";

import type {IBearerTypes, IGuardBearerRequisiteFunc} from "./guard";
import {BEARER_TYPES} from "./guard";

async function getBearerValue(
    bearerType: IBearerTypes,
    request: Request,
): Promise<string | null> {
    switch (bearerType) {
        case BEARER_TYPES.cookie: {
            const session = await getSession(request);

            return session.get("bearer") ?? null;
        }

        case BEARER_TYPES.header: {
            const {headers} = request;

            return headers.get("Authorization");
        }
    }
}

function validateBearerValue(
    bearerType: IBearerTypes,
    bearerValue: string,
): string | null {
    switch (bearerType) {
        case BEARER_TYPES.header: {
            if (!bearerValue.toLowerCase().startsWith("bearer ")) {
                return null;
            }

            bearerValue = bearerValue.slice(7);
        }
    }

    return bearerValue;
}

export default function makeTokenBearerGuard<
    T extends ITokensTable,
    S extends ITokensService<T> = ITokensService<T>,
    V extends IToken<T> = IToken<T>,
>(tokensService: S): IGuardBearerRequisiteFunc<V> {
    const {findOneByToken} = tokensService;

    return async (request, options = {}) => {
        const {bearerType = BEARER_TYPES.header} = options;

        const bearerValue = await getBearerValue(bearerType, request);

        if (!bearerValue) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        const tokenValue = validateBearerValue(bearerType, bearerValue);

        if (!tokenValue) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        const token = await findOneByToken(tokenValue);

        if (!token) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        return token as V;
    };
}
