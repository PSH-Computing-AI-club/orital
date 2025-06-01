import {Temporal} from "@js-temporal/polyfill";

import makeEvent from "../../utils/event";

import ENVIRONMENT from "../configuration/environment";

import type {IConsentTokensTable} from "../database/tables/consent_tokens_table";
import CONSENT_TOKENS_TABLE from "../database/tables/consent_tokens_table";

import makeTokenBearerGuard from "../guards/token_bearer_guard";

import type {IToken, ITokenSecret} from "./tokens_service";
import makeTokensService from "./tokens_service";

const {TOKEN_CONSENT_TTL} = ENVIRONMENT;

export const EVENT_CONSENT_AUTHORIZED = makeEvent<IConsentAuthorizedEvent>();

export const EVENT_CONSENT_REVOKED = makeEvent<IConsentRevokedEvent>();

export interface IConsentAuthorizedEvent {
    readonly callbackTokenID: number;

    readonly grantToken: ITokenSecret;

    readonly grantTokenExpiresAt: Temporal.Instant;
}

export interface IConsentRevokedEvent {
    readonly callbackTokenID: number;
}

export type IConsentToken = IToken<IConsentTokensTable>;

const tokensService = makeTokensService({
    duration: TOKEN_CONSENT_TTL,
    namespace: "TCSN",
    table: CONSENT_TOKENS_TABLE,
});

export const deleteOne = tokensService.deleteOne;

export const findOne = tokensService.findOne;

export const findOneByToken = tokensService.findOneByToken;

export const insertOne = tokensService.insertOne;

export const requireTokenBearer = makeTokenBearerGuard<
    typeof CONSENT_TOKENS_TABLE,
    typeof tokensService,
    IConsentToken
>(tokensService);
