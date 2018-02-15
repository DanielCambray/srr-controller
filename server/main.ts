import { Meteor } from 'meteor/meteor';
import { Rig } from '../both/models/rig.model';
import { Rigs } from '../both/collections/rigs.collection';
import { checkSRR } from './imports/cron';

import '../both/methods/rigs.methods';

//import {SyncedCron} from 'meteor/meteor';

Meteor.startup(() => {
    SyncedCron.add({
        name: 'checkSRR',
        schedule:function(parser) {
            return parser.recur().every(1).second();
        },
        job: function() {
            checkSRR();
        }
    });

    SyncedCron.start();
});

Meteor.publish('rigs', function(){
    return Rigs.find();
})



