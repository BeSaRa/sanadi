import {FileNetModel} from './FileNetModel';

export abstract class Annotation<T> extends FileNetModel<T> {
  text!: string;
}
