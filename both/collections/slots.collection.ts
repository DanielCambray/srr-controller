import { MongoObservable} from "meteor-rxjs";

import { Slot } from '../models/slot.model';

export const Slots = new MongoObservable.Collection<Slot>('slots');

