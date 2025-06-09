import {redirect} from "react-router";

import {insertOneLive} from "~/.server/services/room_service";
import {findOne} from "~/.server/services/users_service";

export async function loader() {
    const TEST_PRESENTER = (await findOne(1))!;

    const TEST_ROOM = await insertOneLive({
        presenter: TEST_PRESENTER,
    });

    return redirect(`/rooms/${TEST_ROOM.roomID}/presenter`);
}
