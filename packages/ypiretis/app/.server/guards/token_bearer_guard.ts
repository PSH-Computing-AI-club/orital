import {data} from "react-router";

import type {ITokensTable} from "../database/tables/tokens_table";

import type {IToken, ITokensService} from "../services/tokens_service";

import {IGuardRequisiteFunc} from "./guard";

export default function makeTokenBearerGuard<
    T extends ITokensTable,
    S extends ITokensService<T> = ITokensService<T>,
    V extends IToken<T> = IToken<T>,
>(tokensService: S): IGuardRequisiteFunc<V> {
    const {findOneByToken} = tokensService;

    return async (request) => {
        const {headers} = request;
        const authorization = headers.get("Authorization");

        if (!authorization) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        if (!authorization.toLowerCase().startsWith("bearer ")) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        const tokenValue = authorization.slice(7);
        const token = await findOneByToken(tokenValue);

        if (!token) {
            throw data("Unauthorized", {
                status: 401,
            });
        }

        return token as V;
    };
}
