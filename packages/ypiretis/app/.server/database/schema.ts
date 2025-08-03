// **NOTE:** Never import from this file directly. Always import from the tables / views
// files directly. This file exists _solely_ for the purpose of providing exports
// of all the table definitions.
//
// This allows the collective exports be used as a schema by `drizzle` and `drizzle-kit`
// to provide query API types and migration support.

export {default as articles} from "./tables/articles_table";
export {default as articles_attachments} from "./tables/articles_attachments_table";
export {default as attendees} from "./tables/attendees_table";
export {default as callbackTokens} from "./tables/callback_tokens_table";
export {default as consentTokens} from "./tables/consent_tokens_table";
export {default as grantTokens} from "./tables/grant_tokens_table";
export {default as rooms} from "./tables/rooms_table";
export {default as uploads} from "./tables/uploads_table";
export {default as users} from "./tables/users_table";

export {default as articles_with_poster} from "./views/articles_with_poster_view";
export {default as published_articles} from "./views/published_articles_view";
export {default as published_articles_with_poster} from "./views/published_articles_with_poster_view";
