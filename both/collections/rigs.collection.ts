import { MongoObservable} from "meteor-rxjs";

import { Rig } from '../models/rig.model';

export const Rigs = new MongoObservable.Collection<Rig>('rigs');

