import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ContactOfficer} from "@app/models/contact-officer";

export class ContactOfficerInterceptor implements IModelInterceptor<ContactOfficer> {
  send(model: Partial<ContactOfficer>): Partial<ContactOfficer> {
    delete model.searchFields;
    delete model.auditOperation;
    delete model.langService;
    return model;
  }

  receive(model: ContactOfficer): ContactOfficer {
    return model;
  }
}
