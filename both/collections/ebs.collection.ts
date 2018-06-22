import { MongoObservable} from "meteor-rxjs";

import { EB } from '../models/eb.model';

export const EBs = new MongoObservable.Collection<EB>('ebs');
