import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { CollectionApprovalClone } from "@app/models/collection-approval-clone";

export class CollectionApprovalInterceptorClone implements IModelInterceptor<CollectionApprovalClone>{
    send(model: Partial<CollectionApprovalClone>): Partial<CollectionApprovalClone> {
        throw new Error("Method not implemented.");
    }
    receive(model: CollectionApprovalClone): CollectionApprovalClone {
        throw new Error("Method not implemented.");
    }
}