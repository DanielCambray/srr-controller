'use strict';

var inherits = require('util').inherits;

var dgram = require('dgram');
var EventEmitter = require('events');

export function EBdevice(params)
{
    console.log("EB constructor");
    this.host = params.host;
    this.port = params.port;
    this.srr_serial = params.srr_serial;
    this.eb_serial = params.eb_serial;

    EventEmitter.call(this);

    //this.emitter = new EventEmitter();

    this.actions = {
        reboot_eb: "52",
        get_version: "56",
        turn_on: "50",
        turn_off: "46",
        reset_fast: "45",
        reset_long: "45",
        get_status: "49",
        get_status_all: "49",
        get_status_short: "49",
        get_status_short_2: "49",
        set_watchdog: "57",
        set_always_on: "59",
        get_reboot_counters: "4e",
        reset_reboot_counter: "73",
    };

    this.status_names = [
        'Nothing',
        'WaitingToOn',
        'WaitingToOff',
        'WaitingToReset',
        'WaitingTOLongReset',
        'WaitingToStayOffTimer',
        'WaitingForstShortTimer',
        'RetryingTurnOn'
    ]
}

inherits(EBdevice, EventEmitter);

EBdevice.prototype.hexToASCII = function(str1)
{
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

EBdevice.prototype.hexToASCIIToInt = function(str1)
{
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode("0x" + hex.substr(n, 2));
    }
    return parseInt("0x" + str);
}


EBdevice.prototype.pad = function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

/**
 * Slot 29 => devient 29-1 = 28
 * 28 en hex => 1C
 * 1 en ascii hex => 31
 * C en ascii hex => 43
 * @param slot
 * @returns {string}
 */
EBdevice.prototype.parseSlotNumber = function (slot)
{
    var slot = (parseInt(slot-1)).toString(16).toUpperCase();
    slot = this.pad("00", slot, true);

    var slot1 = slot.charCodeAt(0).toString(16);
    slot1 = this.pad("00", slot1, true);

    var slot2 = slot.charCodeAt(1).toString(16);
    slot2 = this.pad("00", slot2, true);

    slot = slot1 + slot2;

    return slot;
}



EBdevice.prototype.parseStatus = function (status)
{
    if (status) {
        status = "01";
    } else {
        status = "00";
    }

    return status;
}

EBdevice.prototype.send = function(action, data)
{
    var self = this;

    // We check if the action is available
    if (!this.actions.hasOwnProperty(action)) {
        console.log("Error : action " + action + " is not available => Abort");
        return;
    }

    // We create the packet to be send
    var packet = this.generatePacket(action, data);

    //console.log("=== SEND FUNCTION ===");
    //console.log(this.host + ":" + this.port);
    //console.log({action: action, data:data});
    //console.log(packet);

    var host = this.host;
    var port = this.port;

    const message = Buffer.from(packet,'hex');
    const client = dgram.createSocket('udp4');

    client.on('message',function(msg,info){
        //console.log('Data received from server : ' + msg.toString());
        //console.log(msg.toString('hex'));
        //console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
        var output = self.decodePacket(action, msg);
        self.emit('eb-message', {eb_serial: self.eb_serial, srr_serial: self.srr_serial}, output);

        // We close, since there will be no communication
        client.close();
    });

    client.on('error', (err) => {
        console.log('client error :' + err.stack);
        client.close();
    });

    client.send(message, 0, message.length, port, host, function(err, bytes) {
        if (err) throw err;
        //console.log('UDP message : ' + message + ' sent to ' + host + ':' + port);
    });
}

EBdevice.prototype.generatePacket = function (action, data = null)
{
    var packet;
    var action_id;

    // We check if the action is available
    if (!this.actions.hasOwnProperty(action)) {
        console.log("Error : action " + action + " is not available => Abort");
        return;
    } else {
        action_id = this.actions[action];
    }

    if (action == 'reboot_eb')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'get_version')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'turn_on')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        } else {
            var slot = this.parseSlotNumber(data.slot);
            packet = this.generatePacketHex(action_id, slot);
        }

    } else if (action == 'turn_off')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        } else {
            var slot = this.parseSlotNumber(data.slot);
            packet = this.generatePacketHex(action_id, slot);
        }
    } else if (action == 'reset_fast')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        } else {
            var slot = this.parseSlotNumber(data.slot);
            packet = this.generatePacketHex(action_id, slot);
        }
    } else if (action == 'reset_long')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        } else {
            var slot = this.parseSlotNumber(data.slot);
            packet = this.generatePacketHex(action_id, slot);
        }
    } else if (action == 'get_status')
    {
        packet = this.generatePacketHex(action_id, "43");
    } else if (action == 'get_status_short')
    {
        packet = this.generatePacketHex(action_id, "53");
    } else if (action == 'get_status_short_2')
    {
        packet = this.generatePacketHex(action_id, "48");
    } else if (action == 'get_status_all')
    {
        packet = this.generatePacketHex(action_id, "41");
    } else if (action == 'get_reboot_counters')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'reset_reboot_counter')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        } else {
            var slot = this.parseSlotNumber(data.slot);
            packet = this.generatePacketHex(action_id, slot);
        }
    } else if (action == 'set_watchdog')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        }
        if (!data.status)
        {
            console.log("Error : Status is missing ! ");
        }
        var slot = this.parseSlotNumber(data.slot);
        var status = this.parseStatus(data.status);

        packet = this.generatePacketHex(action_id, slot + status);
    } else if (action == 'set_always_on')
    {
        if (!data.slot)
        {
            console.log("Error : Slot is missing ! ");
        }
        if (!data.status)
        {
            console.log("Error : Status is missing ! ");
        }
        var slot = this.parseSlotNumber(data.slot);
        var status = this.parseStatus(data.status);

        packet = this.generatePacketHex(action_id, slot + status);
    }

    return packet;
}

EBdevice.prototype.generatePacketHex = function(action, data = "")
{
    var firstByte = "ff";

    // 01 for EB device
    var device = "01";
    var mac = "485053" + this.srr_serial;
    var eb_serial = this.eb_serial;

    // The byteCount = 10 + data.length/2
    var byteCount;
    if (data == "") {
        byteCount = "0a";
    } else
    {
        byteCount = 10 + (data.length/2);
        byteCount = byteCount.toString(16);
        byteCount = this.pad("00", byteCount, true);
    }

    var tmp = [
        device.substring(0, 2),
        byteCount.substring(0, 2),
        action.substring(0,2),
        mac.substring(0,2),
        mac.substring(2,4),
        mac.substring(4,6),
        mac.substring(6,8),
        mac.substring(8,10),
        mac.substring(10,12),
        eb_serial.substring(0,2),
        eb_serial.substring(2,4),
        eb_serial.substring(4,6)
    ];

    if (data != "")
    {
        for(var i in data)
        {
            if (i%2 == 0) {
                tmp.push(data.substring(i, i+2));
            }
        }
    }

    var checksum = 0;
    for(var i in tmp)
    {
        checksum += parseInt(tmp[i], 16);
    }

    checksum = (checksum % 256).toString(16);
    checksum = this.pad('00', checksum, true);

    var packet = firstByte + device + byteCount + action + mac + eb_serial + data + checksum;

    return packet;
}

/**
 * We check here if the response has the good:
 * - first byte
 * - device_type
 * - serial
 * - action
 *
 * @param packet
 * @param action
 * @returns {{}}
 */
EBdevice.prototype.checkResponse = function(packet, action)
{
    var data = {};

    data.first_byte = packet[0].toString(16)
    data.device_type = packet[1].toString(16);
    data.packet_length = packet[2];
    data.action = packet[3].toString(16);

    data.mac = "";
    for (var i = 3 ; i<= 9 ; i++)
    {
        data.mac += this.pad("00", packet[i].toString(16), true);
    }

    data.srr_serial = "";
    for (var i = 7 ; i<= 9 ; i++)
    {
        data.srr_serial += this.pad("00", packet[i].toString(16), true);
    }

    data.eb_serial = "";
    for (var i = 10 ; i<= 12 ; i++)
    {
        data.eb_serial += this.pad("00", packet[i].toString(16), true);
    }

    data.data = "";
    for (var i = 13; i < data.packet_length + 2; i++) {
        data.data += this.pad("00", packet[i].toString(16), true);
    }
    
    if (data.first_byte != "ff")
    {
        console.log("Error : Wrong first byte => should be ff");
    }

    if (data.device_type != 1)
    {
        console.log("Error : Wrong device type : should be 1 and not " + data.device_type);
    }

    if (data.srr_serial != this.srr_serial)
    {
        console.log("Error : Wrong srr_serial => should be " + this.srr_serial + " and not " + data.srr_serial);
    }

    if (data.eb_serial != this.eb_serial)
    {
        console.log("Error : Wrong eb_serial => should be " + this.eb_serial + " and not " + data.eb_serial);
    }

    if (data.action != this.actions[action]) {
        console.log("Error : Wrong action : should be " + this.actions[action] + " and not " + data.action);
    }

    return data;
}

EBdevice.prototype.decodePacket = function(action, packet)
{
    console.log("=== Decode Packet ===");
    //console.log(packet);

    var data = this.checkResponse(packet, action);
    var output = {};

    if (action == "get_status") {
        console.log("=== " + action + " ===");
        output.action = action;

        var slot_status = parseInt(data.data, 16).toString(2);

        output.data = {};
        for (var i = 0 ; i<8 ; i++)
        {
            if (slot_status[i] == 1) {
                output.data[8-i] = true;
            } else {
                output.data[8-i] = false;
            }
        }

        return output;
    } else if (action == "get_version")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {version: this.hexToASCII(data.data)};

        return output;
    } else if (action == "get_reboot_counters")
    {
        console.log("=== " + action + " ===");
        output.action = action;

        var reboot_counters = {};
        for (var i = 0 ; i<32 ; i++)
        {
            //var counter = String.fromCharCode("0x" + data.data[8*i] + data.data[8*i+1])  + String.fromCharCode("0x" + data.data[8*i+2] + data.data[8*i+3]);
            counter = parseInt("0x" + counter);

            var counter = this.hexToASCIIToInt(data.data[8*i]+data.data[8*i+1]+data.data[8*i+2]+data.data[8*i+3]);

            console.log(counter);

            reboot_counters[i+1] = counter;
        }

        output.data = reboot_counters;

        return output;
    } else if (action == "get_status_short")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {};
        output.data.slots = [];

        for (var i = 0 ; i < 32; i++)
        {
            var slot = {};
            slot.id = i+1;
            //slot.status = parseInt(data.data[2*i] + data.data[2*i+1], 16);
            slot.status1 = this.hexToASCIIToInt(data.data[4*i] + data.data[4*i+1]);
            slot.status2 = this.hexToASCIIToInt(data.data[4*i+2] + data.data[4*i+3]);

            var bin1 = this.pad("0000",slot.status1.toString(2), true);

            if (bin1[0] == 1) {
                slot.state = true;
            } else {
                slot.state = false;
            }

            if (bin1[1] == 1) {
                slot.watchdog_on = true;
            } else {
                slot.watchdog_on = false;
            }

            if (bin1[2] == 1) {
                slot.always_on = true;
            } else {
                slot.always_on = false;
            }

            // Not sure...
            if (bin1[3] == 1) {
                slot.error = true;
            } else {
                slot.error = false;
            }

            slot.status_name = this.status_names[slot.status2];

            if ((i == 6)||(i ==7)||(i == 8)||(i == 9)||(i == 30)||(i == 31)) {
                //console.log(slot);
            }

            output.data.slots.push(slot);
        }

        //console.log(output);
        return output;
    } else if (action == "get_status_all")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {};
        output.data.slots = [];

        for (var i = 0 ; i < 32; i++)
        {
            var slot = {};
            slot.id = i+1;
            slot.keep_alive = parseInt(data.data[14*i+2] + data.data[14*i+3] + data.data[14*i] + data.data[14*i+1], 16);


            slot.next_action = parseInt(data.data[14*i+4] + data.data[14*i+5], 16);

            slot.info2 = parseInt(data.data[14*i+6] + data.data[14*i+7] + data.data[14*i+8] + data.data[14*i+9] + data.data[14*i+10] + data.data[14*i+11] , 16);

            slot.info = parseInt(data.data[14*i+12] + data.data[14*i+13], 16);

            slot.infoBin = this.pad("00000000",slot.info.toString(2), true);

            if (slot.infoBin[0] == 1)
            {
                slot.always_on = true;
            } else {
                slot.always_on = false;
            }

            if (slot.infoBin[1] == 1)
            {
                slot.state = true;
            } else {
                slot.state = false;
            }

            if (slot.infoBin[2] == 1)
            {
                slot.watchdog_on = true;
            } else {
                slot.watchdog_on = false;
            }

            slot.status = this.pad("0000",slot.infoBin[5] + slot.infoBin[6] + slot.infoBin[7], true);
            //slot.status = this.hexToASCII(slot.status);

            if (slot.status == 0) {
                slot.status_name = "Nothing";
            } else if (slot.status == 1) {
                slot.status_name = "Waiting To On";
            } else if (slot.status == '111') {
                slot.status_name = "Retrying Turn On";
            } else {
                slot.status_name = "Unknown";
            }

            output.data.slots.push(slot);
        }

        //console.log(output);
        return output;
    } else if ((action == "turn_on")||(action == "turn_off")||(action == "reset_fast")||(action == "reset_long"))
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {status: "ok"};

        return output;
    }
}




    

