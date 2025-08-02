// **NOTE:** Never import from this file directly. Always import from the table
// files directly. This file exists _solely_ for the purpose of providing exports
// of all the table definitions.
//
// This allows the collective exports be used as a schema by `drizzle` and `drizzle-kit`
// to provide query API types and migration support.

export {default as articles_with_poster} from "./articles_with_poster_view";
export {default as published_articles} from "./published_articles_view";
export {default as published_articles_with_poster} from "./published_articles_with_poster_view";
