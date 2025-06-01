import {createTransport} from "nodemailer";

import ENVIRONMENT from "./environment";

const {SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD} = ENVIRONMENT;

const MAILER = createTransport({
    secure: true,

    host: SMTP_HOST,
    port: SMTP_PORT,

    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
    },
});

export default MAILER;
