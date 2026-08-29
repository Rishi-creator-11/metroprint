import type { OptionsSchema } from "@/lib/types";

/** Standard design-help toggle shown on configurable products. Not a priced option. */
export const NEED_DESIGN_HELP_FIELD: OptionsSchema["fields"][number] = {
  name: "need_design_help",
  label: "Need Design Help",
  type: "radio",
  options: ["Yes", "No"],
  required: true,
};

export function withDesignHelpField(schema: OptionsSchema): OptionsSchema {
  const hasField = schema.fields.some((f) => f.name === "need_design_help");
  if (hasField) return schema;
  return {
    fields: [...schema.fields, NEED_DESIGN_HELP_FIELD],
  };
}
