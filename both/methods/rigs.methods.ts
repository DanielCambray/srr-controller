import {Rigs} from '../collections/rigs.collection';

import {Meteor} from 'meteor/meteor';


import {SRRs} from '../collections/srrs.collection';
import { SRRdevice } from '../../server/imports/SRRdevice';

Meteor.methods({
    srr_command_legacy: function(command:string, srr_id:string, slot_number:string) {

        if (Meteor.isClient) {
            return;
        }

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

            // For SRR

            // action = 54 / get_rig_status
            // ?        mac          status ?
            // ff0009 54 485053000466 fd 01b0
            // fd => 11111101 (status of the 8 slots)

            // action = 81 / get_resetter_version
            //          mac          version
            // ff001d 81 485053000466 53696d706c65526967526573657474657256312e3401b7
            // 53696d706c65526967526573657474657256312e3401 => SimpleRigResetterV1.4

            // action = 56 / get_config
            // ff002a 56 485053000466 0a0000c81b0450001e0553696d706c655269675265736574746572303030343636000144
            //
            //                       host     udp  http keepalive long reset               SimpleRigResetter000466
            //                       0a0000c8 1b04 5000 1e        05                       53696d706c655269675265736574746572303030343636

            // action = 5A / get_status_all_rigs
            // ff0040 5a 485053000466 2b0100000000e0 22010a00000001 2c0100000000e0 2a0100000000e0 2a0100000000e0 2b0100000000e0 2c0100000000e0 2b0100000000e0 0172

            // for an ok rig
            // (keep alive)
            // 299              status?
            // 2b01 00 00 00 00 e0

            // for non ok rig
            // 2201 0a 00 00 00 01
            // 2201 => 200 (keep alive)
            // 0a => 10 (next action)

            // action = 5B / get_reset_counters
            //                        215  0    1    148  0    0    0    11
            // ff0018 5b 485053000466 d700 0000 0100 9400 0000 0000 0000 0b00 003f

            // action = 5F / get list of EB
            //
            // ff000d 5f 485053000466 0100 100160 0134
            // 0100   :(nb of EB ?)
            // 100160 : EB serial


            // For EB
            // action = 56 (get_resetter_version)

            // !!! TEST
            //action = "5A";

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

            //console.log(tmp);
            //console.log(checksum);

            checksum = (checksum % 256).toString(16);
            checksum = pad('00', checksum, true);

            //console.log(checksum);

            var packet = firstByte + byteCount + action + mac + srrSlot + checksum;

            console.log("SRR Packet : " + packet);


            const dgram = require('dgram');
            const message = Buffer.from(packet,'hex');
            const client = dgram.createSocket('udp4');

            console.log("SRR Message : " + message);
/*
            client.send(message, 0, message.length, srrDevicePort, srrDeviceHost, (err) => {
                client.close();
            });*/
/*
            client.on('listening', function () {
                var address = client.address();
                console.log('UDP Server listening on ' + address.address + ":" + address.port);
            });*/

            client.on('message',function(msg,info){
                console.log('Data received from server : ' + msg.toString());
                console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);

                console.log(msg.toString('hex'));
                
            });


            client.send(message, 0, message.length, srrDevicePort, srrDeviceHost, function(err, bytes) {

                if (err) throw err;
                console.log('UDP message sent to ' + srrDeviceHost +':'+ srrDevicePort);

            });

        }


    }
});