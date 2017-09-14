import { CollectionObject } from './collection-object.model';

export interface Rig extends CollectionObject{
    slot: string;
    name: string;
    description: string;
    state: boolean;
    keep_alive: number;
}