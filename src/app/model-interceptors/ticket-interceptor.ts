

export function interceptTicket(model :any) {
  delete model.service;
  return model;
}
