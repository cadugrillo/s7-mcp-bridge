import { z } from "zod";

export const objectTypeType = z.enum(["code_blocks", "data_blocks", "tags"]);
export const objectReadType = z.enum(["simple", "raw"]);
export const objectOperatingModeType = z.enum(["run", "stop"]);
// ------------------------
// object of type Alarms_Browse_Filters_Request
const filterModetype = z.enum(["include", "exclude"]);
const filtersAttributes = z.enum([
  "alarm_text",
  "info_text",
  "status",
  "timestamp",
  "acknowledgement",
  "alarm_number",
  "producer",
]);
const filtersAttributesType = z.array(filtersAttributes);

export const AlarmsBrowseFiltersRequestType = z.object({
  mode: filterModetype,
  attributes: filtersAttributesType,
});
// ------------------------------------
// DiagnosticBuffer_Browse_Filters_Request
const DiagnosticBufferAttributes = z.enum([
  "short_text",
  "long_text",
  "help_text",
]);
const DiagnosticBufferAttributesType = z.array(DiagnosticBufferAttributes);
export const DiagnosticBufferBrowseFiltersRequestType = z.object({
  mode: filterModetype,
  attributes: DiagnosticBufferAttributesType,
});
