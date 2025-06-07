import {insertOneLive} from "~/.server/services/room_service";
import {findOne} from "~/.server/services/users_service";

export async function loader() {
    const TEST_PRESENTER = (await findOne(1))!;

    const TEST_ROOM = await insertOneLive({
        presenter: TEST_PRESENTER,
    });

    console.log({
        TEST_ROOM_ID: TEST_ROOM.roomID,
    });
}
