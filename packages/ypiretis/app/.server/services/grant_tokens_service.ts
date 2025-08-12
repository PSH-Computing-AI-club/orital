import RUNTIME_ENVIRONMENT from "../configuration/runtime_environment";

import type {IGrantTokensTable} from "../database/tables/grant_tokens_table";
import GRANT_TOKENS_TABLE from "../database/tables/grant_tokens_table";

import makeTokenBearerGuard from "../guards/token_bearer_guard";

import type {IToken} from "./tokens_service";
import makeTokensService from "./tokens_service";

const {TOKEN_GRANT_TTL} = RUNTIME_ENVIRONMENT;

export type IGrantToken = IToken<IGrantTokensTable>;

export const tokensService = makeTokensService({
    duration: TOKEN_GRANT_TTL,
    namespace: "TGNT",
    table: GRANT_TOKENS_TABLE,
});

export const deleteOne = tokensService.deleteOne;

export const findOne = tokensService.findOne;

export const findOneByToken = tokensService.findOneByToken;

export const insertOne = tokensService.insertOne;

export const requireTokenBearer = makeTokenBearerGuard<
    typeof GRANT_TOKENS_TABLE,
    typeof tokensService,
    IGrantToken
>(tokensService);
