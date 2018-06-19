import { Meteor } from 'meteor/meteor';
import { Rig } from '../both/models/rig.model';
import { Rigs } from '../both/collections/rigs.collection';

import { SRR } from '../both/models/srr.model';
import { SRRs } from '../both/collections/srrs.collection';

import { Slot } from '../both/models/slot.model';
import { Slots } from '../both/collections/slots.collection';

import { checkSRR } from './imports/checkSRR';
import { SRRdevice } from './imports/SRRdevice';

import '../both/methods/rigs.methods';

//import {SyncedCron} from 'meteor/meteor';

Meteor.startup(() => {

    //const SRRDevice = require('./imports/SRRdevice');


    var updateSRRinfo = function updateSRRinfo (serial, output){
        console.log("=== UPDATE SRR INFO ===");
        console.log(serial);
        console.log(output);

        // We look for the SRR device
        var srr = SRRs.findOne({serial: serial});

        console.log(srr);


        if (output.action == "get_version") {
            SRRs.update({serial: serial}, {$set:{version: output.data.version}} );
        } else if (output.action == "get_config") {
            SRRs.update({serial: serial}, {$set:{
                host: output.data.host,
                udp_port: output.data.udp_port,
                http_port: output.data.http_port,
                keep_alive: output.data.keep_alive,
                long_reset: output.data.long_reset,
                hostname: output.data.hostname
            }});
        } else if (output.action == "get_status_all") {
            for (var i = 0 ; i < output.data.slots.length; i++) {
                Slots.upsert({srr_id: srr._id, number: output.data.slots[i].id}, {$set:{
                        state: output.data.slots[i].state,
                        keep_alive: output.data.slots[i].keep_alive,
                        always_on: output.data.slots[i].always_on,
                        watchdog_on: output.data.slots[i].watchdog_on,
                        status_name: output.data.slots[i].status_name,
                        next_action: output.data.slots[i].next_action
                    }});
            }

        }

        console.log(srr);

    }

    var srrDevices = [];
    var srrs = SRRs.find({});

    srrs.forEach((srr) => {
        srrDevice = new SRRdevice({
            host: srr.host,
            port: srr.udp_port,
            serial: srr.serial
        });


        srrDevice.addListener('srr-message', Meteor.bindEnvironment(updateSRRinfo));

        // We try to connect
        //srrDevice.send('get_version');
        //srrDevice.send('get_config');
        srrDevice.send('get_status_all');

        srrDevices.push(srrDevice);

    })

    //

    /*
    srrDevice = new SRRdevice({
        host: "10.0.0.200",
        port: "1051",
        serial: "000466"
    });*/

    SyncedCron.add({
        name: 'getStatus',
        schedule:function(parser) {
            return parser.recur().every(1).second();
        },
        job: function() {
            for (var i in srrDevices) {
                srrDevices[i].send('get_status_all');
            }
        }
    });

    SyncedCron.add({
        name: 'checkInfo',
        schedule:function(parser) {
            return parser.recur().every(10).second();
        },
        job: function() {
            for (var i in srrDevices) {
                srrDevices[i].send('get_eb_list');
                srrDevices[i].send('get_config');
            }
        }
    });

    SyncedCron.start();

    //srr.generatePacket('reboot_srr');
    //srr.generatePacket('get_status_all');

    //srr.send('turn_off',{slot:2});
    //srr.send('reset_fast',{slot:2});

    //srr.send('get_status');
    //srr.send('get_version');
    //srr.send('get_reboot_counters');
    //srr.send('get_eb_list');
    //srr.send('get_config');

    //srr.send('get_status_short');
    //srrDevice.send('get_status_all');


    // Start listen UDP
    /*
    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {

        if (rinfo.address=="10.0.0.200")
        {
            console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            console.log(msg.toString('hex'));
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    //server.setBroadcast(true);
    server.bind(1051);*/

/*
    if (SRRs.find({}).count() == 0) {

        SRRs.insert({
           host: '10.0.0.200',
           udp_port: 1051,
           serial: '000466',
           mac: '48505300466'
        });
    }

    var srrs = SRRs.find({});

    srrs.forEach((srr) =>{
        console.log(srr.host);
    })*/
});

Meteor.publish('rigs', function(){
    return Rigs.find();
})

Meteor.publish('srrs', function(){
    return SRRs.find();
})

Meteor.publish('slots', function(){
    return Slots.find();
})



