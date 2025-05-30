import {promise} from "fastq";

import {compile} from "html-to-text";

import type {SendMailOptions} from "nodemailer";

import type {FunctionComponent} from "react";

import {renderToStaticMarkup} from "react-dom/server";

import MAILER from "../configuration/email";
import ENVIRONMENT from "../configuration/environment";

import {RequiredFields} from "../utils/types";

const {QUEUE_EMAILS_MAX, SMTP_EMAIL} = ENVIRONMENT;

const QUEUE = promise(processEmail, QUEUE_EMAILS_MAX);

const renderHTMLtoText = compile();

export type ISendMailOptions = RequiredFields<
    Omit<
        SendMailOptions,
        | "alternatives"
        | "amp"
        | "disableFileAccess"
        | "disableUrlAccess"
        | "dkim"
        | "encoding"
        | "from"
        | "html"
        | "icalEvent"
        | "normalizeHeaderKey"
        | "raw"
        | "sender"
        | "textEncoding"
        | "watchHtml"
        | "text"
    >,
    "to"
>;

export type IEmailOptions<T> = (T extends object ? T : {}) &
    ({
        readonly Component: FunctionComponent<IEmailOptions<T>>;

        readonly name?: string;
    } & ISendMailOptions);

async function processEmail<T>(options: IEmailOptions<T>): Promise<void> {
    const {Component} = options;

    const component = await Component(options);

    const html = renderToStaticMarkup(component);
    const text = renderHTMLtoText(html);

    const {name} = options;

    await MAILER.sendMail({
        ...options,

        html,
        text,

        from: name ? `${name} <${SMTP_EMAIL}>` : SMTP_EMAIL,
    });
}

export async function queueEmail<T>(options: IEmailOptions<T>): Promise<void> {
    QUEUE.push(options);
}

export function sendEmail<T>(options: IEmailOptions<T>): Promise<void> {
    return processEmail<T>(options);
}
