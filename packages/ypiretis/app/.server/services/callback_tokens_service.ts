import RUNTIME_ENVIRONMENT from "../configuration/runtime_environment";

import type {ICallbackTokensTable} from "../database/tables/callback_tokens_table";
import CALLBACK_TOKENS_TABLE from "../database/tables/callback_tokens_table";

import makeTokenBearerGuard from "../guards/token_bearer_guard";

import type {IToken} from "./tokens_service";
import makeTokensService from "./tokens_service";

const {TOKEN_CALLBACK_TTL} = RUNTIME_ENVIRONMENT;

const tokensService = makeTokensService({
    duration: TOKEN_CALLBACK_TTL,
    namespace: "TCLB",
    table: CALLBACK_TOKENS_TABLE,
});

const {insertOne: _insertOne} = tokensService;

export type ICallbackToken = IToken<ICallbackTokensTable>;

export const deleteOne = tokensService.deleteOne;

export const findOne = tokensService.findOne;

export const findOneByToken = tokensService.findOneByToken;

export const insertOne = () => _insertOne({});

export const requireTokenBearer = makeTokenBearerGuard<
    typeof CALLBACK_TOKENS_TABLE,
    typeof tokensService,
    ICallbackToken
>(tokensService);
