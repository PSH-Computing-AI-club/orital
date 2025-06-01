import {createHonoServer} from "react-router-hono-server/bun";

import ENVIRONMENT from "~/.server/configuration/environment";

const {SERVER_PORT} = ENVIRONMENT;

export default await createHonoServer({
    port: SERVER_PORT,
});
