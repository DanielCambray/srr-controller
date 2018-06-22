import { Meteor } from 'meteor/meteor';
import { Rig } from '../both/models/rig.model';
import { Rigs } from '../both/collections/rigs.collection';

import { SRR } from '../both/models/srr.model';
import { SRRs } from '../both/collections/srrs.collection';


import { EB } from '../both/models/eb.model';
import { EBs } from '../both/collections/ebs.collection';

import { Slot } from '../both/models/slot.model';
import { Slots } from '../both/collections/slots.collection';

import { checkSRR } from './imports/checkSRR';
import { SRRdevice } from './imports/SRRdevice';
import { EBdevice } from './imports/EBdevice';

import {DeviceWatcher} from "./imports/DeviceWatcher";

import '../both/methods/slots.methods';

//import {SyncedCron} from 'meteor/meteor';

Meteor.startup(() => {

    var deviceWatcher = new DeviceWatcher();
    
    // Global variable that holds the srrDevices
    srrDevices = [];
    var srrs = SRRs.find({});

    srrs.forEach((srr) => {
        srrDevice = new SRRdevice({
            host: srr.host,
            port: srr.udp_port,
            serial: srr.serial
        });

        srrDevice.addListener('srr-message', Meteor.bindEnvironment(deviceWatcher.updateSRR));

        srrDevices.push(srrDevice);
    })

    // Global variable that holds the ebDevices
    ebDevices = [];
    var ebs = EBs.find({});

    ebs.forEach((eb) => {

        var srr = SRRs.findOne({serial: eb.srr_serial});

        ebDevice = new EBdevice({
            host: srr.host,
            port: srr.udp_port,
            srr_serial: srr.serial,
            eb_serial: eb.serial
        });

        ebDevice.addListener('eb-message', Meteor.bindEnvironment(deviceWatcher.updateEB));

        ebDevices.push(ebDevice);
    })


    /*
    ebDevice = new EBdevice({
        host: "10.0.0.200",
        port: "1051",
        srr_serial:"000466",
        eb_serial: "100160"
    });*/

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

            for (var i in ebDevices) {
                ebDevices[i].send('get_status_short');
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

            for (var i in ebDevices) {
                ebDevices[i].send('get_version');
            }
        }
    });

    SyncedCron.start();



    //ebDevice.send('get_version');


    // 303030303343
    //ebDevice.send('get_status_all');

    //303030303030303030303030
    //ebDevice.send('get_status');

    //4530453045304530453043304330303030303030453045304530453030303030303130313030303030303030303030303030303030303030303130303030
    //ebDevice.send('get_status_short');

    //32433031303030303030303030303243303130303030303030303030324330313030303030303030303032303033303030303036303033313330333033313336333034303030303030303030303030303030303730303030303030303030303030303037303030463030303030303031
    //32433031303030303030303030303243303130303030303030303030324330313030303030303030303032303033303030303036303033313330333033313336333034303030303030303030303030303030303730303030303030303030303030303037303030463030303030303031001b
    //ebDevice.send('get_status_short_2');

    //ebDevice.send('reset_reboot_counter',{slot:2});

    //ebDevice.send('get_reboot_counters');


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

Meteor.publish('ebs', function(){
    return EBs.find();
})

Meteor.publish('slots', function(){
    return Slots.find();
})





