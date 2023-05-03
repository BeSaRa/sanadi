import { TemplateField } from "@app/models/template-field";

export interface IHasParsedTemplates {
  parsedTemplates:TemplateField[];
  template: string;
  templateId: number;
}
