import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Rigs } from '../../../both/collections/rigs.collection';
import { Rig } from '../../../both/models/rig.model';


import template from './app.component.html';
import {MeteorObservable} from "meteor-rxjs";

@Component({
    selector: 'app',
    template
})
export class AppComponent {
    rigs: Observable<Rig[]>;

    constructor() {
        this.rigs = Rigs.find({}).zone();
    }

    srr_command(command:string, rig_slot:string, rig_id:string) {
        MeteorObservable.call('srr_command', command, rig_slot, rig_id).subscribe(() => {
        }, (error) => {
            alert('Error');
        });
    }
}