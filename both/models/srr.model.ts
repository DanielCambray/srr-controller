import { CollectionObject } from './collection-object.model';

export interface SRR extends CollectionObject{
    host: string;
    udp_port: string;
    http_port: string;
    hostname: string;
    mac: string;
    serial: string;
    version: string;
    keep_alive: integer;
    long_reset: integer;
}