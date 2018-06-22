import { CollectionObject } from './collection-object.model';

export interface Slot extends CollectionObject{
    number: number;
    name: string;
    description: string;
    state: boolean;
    keep_alive: number;
    srr_id: number;
    eb_id: number;
    srr_serial: number;
    eb_serial: number;

}