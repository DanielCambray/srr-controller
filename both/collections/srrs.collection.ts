import { MongoObservable} from "meteor-rxjs";

import { SRR } from '../models/srr.model';

export const SRRs = new MongoObservable.Collection<SRR>('srrs');

