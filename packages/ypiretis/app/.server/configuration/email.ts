import {createTransport} from "nodemailer";

import RUNTIME_ENVIRONMENT from "./runtime_environment";

const {SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD} = RUNTIME_ENVIRONMENT;

const MAILER = createTransport({
    secure: true,

    host: SMTP_HOST,
    port: SMTP_PORT,

    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD.expose(),
    },
});

export default MAILER;
