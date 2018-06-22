import {Meteor} from 'meteor/meteor';

import {SRRs} from '../collections/srrs.collection';
import {EBs} from '../collections/ebs.collection';

import { SRRdevice } from '../../server/imports/SRRdevice';

Meteor.methods({
    srr_command: function(command:string, data) {

        console.log(command);
        console.log(data);
        if (Meteor.isClient) {
            return;
        }

        // We search the corresponding eb if any
        if (data.eb_serial) {
            console.log("SRR COMMAND : EB");
            eb = EBs.findOne({serial:data.eb_serial});

            // We search the ebDevice
            var ebDevice = null;
            for (var i = 0; i < ebDevices.length ;i++) {
                if (data.eb_serial == ebDevices[i].eb_serial) {
                    ebDevice = ebDevices[i];
                    console.log("eb found");
                }
            }

            ebDevice.send(command, {slot: data.slot});

        } else {
            console.log("SRR COMMAND : SRR");

            // We search the corresponding srr
            srr = SRRs.findOne({serial:data.srr_serial});

            // We search the srrDevice
            var srrDevice = null;
            for (var i = 0; i < srrDevices.length ;i++) {
                if (data.srr_serial == srrDevices[i].serial) {
                    srrDevice = srrDevices[i];
                    console.log("srr found");
                }
            }

            srrDevice.send(command, {slot: data.slot});

        }


    }
});