// **NOTE:** Never import from this file directly. Always import from the table
// files directly. This file exists _solely_ for the purpose of providing exports
// of all the table definitions.
//
// This allows the collective exports be used as a schema by `drizzle` and `drizzle-kit`
// to provide query API types and migration support.

export {default as articles} from "./articles_table";
export {default as attendees} from "./attendees_table";
export {default as callbackTokens} from "./callback_tokens_table";
export {default as consentTokens} from "./consent_tokens_table";
export {default as grantTokens} from "./grant_tokens_table";
export {default as rooms} from "./rooms_table";
export {default as users} from "./users_table";
