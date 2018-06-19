import { Rigs } from '../../both/collections/rigs.collection';
import { Rig } from '../../both/models/rig.model';

const cheerio = require('cheerio');

export function checkSRR() {

    var srrDevice = Meteor.settings.srrDevice;

    try {
        HTTP.call('GET', 'http://' + srrDevice.host + ":" + srrDevice.httpPort, {}, function(error, response){
            if (error) {
                console.log( error );
            } else {
                var content = response.content;
                //console.log( content );

                const $ = cheerio.load(content);

                var rigs = [];
                $('table').find('tr').each(function(i, item){
                    rigs[i] = [];
                    $(item).children().each(function(j, iitem){
                        rigs[i][j] = $(iitem).text();
                    });
                });

                // We remove the first and the second array because there's no interesting data in them
                rigs.splice(0,2);

                //console.log(rigs);

                for (var item in rigs) {

                    var slot = rigs[item][0].substring(0,2);
                    var state = rigs[item][1];
                    var keep_alive = rigs[item][2];

                    var rig = {
                        slot: slot,
                        state: state,
                        keep_alive: keep_alive
                    };

                    // We insert or update the data in the database
                    const myRig = Rigs.findOne({slot: slot});

                    if (!myRig) {
                        Rigs.insert(rig);
                    } else {
                        Rigs.update({slot: slot}, rig);
                    }
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}