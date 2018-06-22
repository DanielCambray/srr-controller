import { CollectionObject } from './collection-object.model';

export interface EB extends CollectionObject{
    srr_id: number;
    serial: string;
    version: string;
    srr_serial: string;
}