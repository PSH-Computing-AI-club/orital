import {webSocket} from "~/.server/utils/web_socket";

export async function loader() {
    webSocket({
        onOpen(evt, ws) {
            console.log("opened!");

            setTimeout(() => {
                ws.send("hello world");
            }, 2000);
        },
    });
}
