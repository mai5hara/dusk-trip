import { DATABASE_PACKAGE } from "@mood-trip/database";
import { z } from "@mood-trip/validators";

console.log("api workspace ready", DATABASE_PACKAGE, z.string().parse("ok"));
