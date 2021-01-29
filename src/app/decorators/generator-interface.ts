export interface GeneratorInterface extends PropertyDescriptor {
    _getModel(): any

    _getReceiveInterceptor(): any;
}
