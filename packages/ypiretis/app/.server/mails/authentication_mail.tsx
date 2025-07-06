import {Temporal} from "@js-temporal/polyfill";

import {APP_NAME} from "../../utils/constants";
import {buildAppURL} from "../../utils/url";

import type {IEmailOptions} from "../services/email_service";
import {ITokenSecretMaybe} from "../services/tokens_service";

import {exposeIfSecret} from "../utils/secret";

export type IAuthenticationMailOptions = IEmailOptions<{
    readonly accountID: string;

    readonly consentToken: ITokenSecretMaybe;

    readonly consentTokenExpiresAt: Temporal.Instant | number;
}>;

export default function AuthenticationMail(
    options: IAuthenticationMailOptions,
) {
    const {accountID, consentToken, consentTokenExpiresAt} = options;

    const expiresAt =
        consentTokenExpiresAt instanceof Temporal.Instant
            ? consentTokenExpiresAt.epochMilliseconds
            : consentTokenExpiresAt;

    const expiresAtInstant = Temporal.Instant.fromEpochMilliseconds(expiresAt);
    const nowInstant = Temporal.Now.instant();

    const relativeExpiry = nowInstant.until(expiresAtInstant, {
        largestUnit: "minutes",
    });

    const consentURL = buildAppURL(
        `/authentication/consent/#?${new URLSearchParams({
            accountID,
            consentToken: exposeIfSecret(consentToken),
            consentTokenExpiresAt: expiresAt.toString(),
        })}`,
    );

    Object.assign(options, {
        name: APP_NAME,
        priority: "high",
        subject: `Log-In :: ${APP_NAME}`,
    });

    return (
        <>
            <h1>Hello!</h1>
            <p>
                Click the link below to authorize a login for{" "}
                <strong>{APP_NAME}</strong>:
            </p>

            <p>
                <a href={consentURL.toString()}>Log In Now</a>
            </p>

            <p>
                <small style={{color: "tomato"}}>
                    The above link will expire in approximately{" "}
                    {relativeExpiry.minutes} minutes from when this E-Mail was
                    sent.
                </small>
            </p>
        </>
    );
}
