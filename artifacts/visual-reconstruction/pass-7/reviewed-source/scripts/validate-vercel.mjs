// Run with npm exec --yes --package=ajv-draft-04 --package=ajv-formats -- node scripts/validate-vercel.mjs
import { createRequire } from "node:module";
import { delimiter, join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
const packageRoot = process.env.PATH.split(delimiter)
  .map((p) => join(p, ".."))
  .find((p) => existsSync(join(p, "ajv-draft-04/package.json")));
if (!packageRoot) throw Error("Run with the documented npm exec packages.");
const require = createRequire(join(packageRoot, "ajv-draft-04/package.json"));
const Ajv = require("ajv-draft-04"),
  addFormats = require("ajv-formats");
const url = "https://openapi.vercel.sh/vercel.json";
const response = await fetch(url);
if (!response.ok) throw Error(`Schema HTTP ${response.status}`);
const schema = await response.json(),
  ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const config = JSON.parse(readFileSync("vercel.json", "utf8"));
// The published schema declares draft-04 but currently contains draft-07 numeric
// exclusiveMinimum in unused Functions/Services definitions. Validate every used
// field against its unchanged official definition, excluding unrelated branches.
const properties = {};
for (const key of Object.keys(config)) {
  if (!(key in schema.properties))
    throw Error(`Unknown configuration key ${key}`);
  properties[key] = schema.properties[key];
}
const scopedSchema = {
  $schema: schema.$schema,
  type: "object",
  additionalProperties: false,
  properties,
};
const validate = ajv.compile(scopedSchema);
if (!validate(config)) throw Error(JSON.stringify(validate.errors));
mkdirSync("artifacts/v4-stage-m", { recursive: true });
writeFileSync(
  "artifacts/v4-stage-m/vercel-validation.json",
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      schemaURL: url,
      draft: schema.$schema,
      valid: true,
      validatedKeys: Object.keys(config),
      config,
      schemaScope:
        "Unmodified official definitions of every used configuration field. Unused Functions/Services definitions omitted because the published schema mixes draft-04 and draft-07 exclusiveMinimum.",
      limits: "No account deployment or remote headers tested.",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "vercel.json PASS: every used field matches its live official schema definition",
);
