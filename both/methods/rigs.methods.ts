import {Rigs} from '../collections/rigs.collection';

import {Meteor} from 'meteor/meteor';

Meteor.methods({
    srr_command: function(command:string, rig_slot:string, rig_id:string) {

        var srrDevice = Meteor.settings.srrDevice;

        var srrDeviceHost = srrDevice.host;
        var srrDevicePort = srrDevice.udpPort;
        var srrDeviceSerial = srrDevice.serial;

        function pad(pad, str, padLeft) {
            if (typeof str === 'undefined')
                return pad;
            if (padLeft) {
                return (pad + str).slice(-pad.length);
            } else {
                return (str + pad).substring(0, pad.length);
            }
        }

        console.log("SRR Command  :");
        console.log({action: command, slot: rig_slot, _id: rig_id});

        if (Meteor.isServer) {

            var srrSerial = "000466";
            var srrSlot = (parseInt(rig_slot) - 1).toString();
            srrSlot = pad('00', srrSlot, true);

            var action = "";
            switch (command) {
                case 'turn_on':
                    action = "51";
                    break;
                case 'turn_off':
                    action = "52";
                    break;
                case 'fast_reset':
                    action = "53";
                    break;
                case 'long_reset':
                    action = "58";
                    break;
                case 'keep_alive':
                    action = "55";
                    break;
                default:
                    throw Error("Invalid command name : " + command);
            }

            var firstByte = "FF";
            var byteCount = "0008";
            var mac = "485053" + srrDeviceSerial;

            var tmp = [
                "0x" + byteCount.substring(0, 2),
                "0x" + byteCount.substring(2, 4),
                "0x" + action.substring(0,2),
                "0x" + mac.substring(0,2),
                "0x" + mac.substring(2,4),
                "0x" + mac.substring(4,6),
                "0x" + mac.substring(6,8),
                "0x" + mac.substring(8,10),
                "0x" + mac.substring(10,12),
                "0x" + srrSlot.substring(0,2)
            ];

            var tmp = [
                byteCount.substring(0, 2),
                byteCount.substring(2, 4),
                action.substring(0,2),
                mac.substring(0,2),
                mac.substring(2,4),
                mac.substring(4,6),
                mac.substring(6,8),
                mac.substring(8,10),
                mac.substring(10,12),
                srrSlot.substring(0,2)
            ];

            var checksum = parseInt(tmp[0], 16)
                + parseInt(tmp[0], 16)
                + parseInt(tmp[1], 16)
                + parseInt(tmp[2], 16)
                + parseInt(tmp[3], 16)
                + parseInt(tmp[4], 16)
                + parseInt(tmp[5], 16)
                + parseInt(tmp[6], 16)
                + parseInt(tmp[7], 16)
                + parseInt(tmp[8], 16)
                + parseInt(tmp[9], 16);

            console.log(tmp);
            console.log(checksum);

            checksum = (checksum % 256).toString(16);
            checksum = pad('00', checksum, true);

            console.log(checksum);

            var packet = firstByte + byteCount + action + mac + srrSlot + checksum;

            console.log(packet);

            const dgram = require('dgram');
            const message = Buffer.from(packet,'hex');
            const client = dgram.createSocket('udp4');

            console.log(message);

            client.send(message, 0, message.length, srrDevicePort, srrDeviceHost, (err) => {
                client.close();
            });
        }


    }
});