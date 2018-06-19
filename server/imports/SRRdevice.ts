'use strict';

var inherits = require('util').inherits;

var dgram = require('dgram');
var EventEmitter = require('events');

export function SRRdevice(params)
{
    console.log("SRR constructor");
    this.host = params.host;
    this.port = params.port;
    this.serial = params.serial;

    EventEmitter.call(this);

    //this.emitter = new EventEmitter();

    this.actions = {
        reboot_srr: "80",
        get_version: "81",
        turn_on: "51",
        turn_off: "52",
        reset_fast: "53",
        reset_long: "58",
        get_status: "54",
        get_status_all: "5a",
        get_status_short: "62",
        set_watchdog: "5e",
        set_always_on: "61",
        get_reboot_counters: "5b",
        reset_reboot_counters: "63",
        get_config: "56",
        set_config: "57",
        get_eb_list: "5f"
    };
}

inherits(SRRdevice, EventEmitter);

//module.exports = SRRDevice;

SRRdevice.prototype.hexToASCII = function(str1)
{
    var hex  = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}

SRRdevice.prototype.pad = function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

SRRdevice.prototype.parseSlotNumber = function (slot)
{
    var slot = (parseInt(slot) - 1).toString();
    slot = this.pad("00", slot, true);

    return slot;
}

SRRdevice.prototype.parseStatus = function (status)
{
    if (status) {
        status = "01";
    } else {
        status = "00";
    }

    return status;
}

SRRdevice.prototype.send = function(action, data)
{
    var self = this;

    // We check if the action is available
    if (!this.actions.hasOwnProperty(action)) {
        console.log("Error : action " + action + " is not available => Abort");
        return;
    }

    // We create the packet to be send
    var packet = this.generatePacket(action, data);

    console.log("=== SEND FUNCTION ===");
    console.log(this.host + ":" + this.port);
    console.log({action: action, data:data});
    console.log(packet);

    var host = this.host;
    var port = this.port;

    const message = Buffer.from(packet,'hex');
    const client = dgram.createSocket('udp4');

    client.on('message',function(msg,info){
        console.log('Data received from server : ' + msg.toString());
        console.log(msg.toString('hex'));
        console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
        var output = self.decodePacket(action, msg);
        self.emit('srr-message', self.serial, output);

        // We close, since there will be no communication
        client.close();
    });

    client.on('error', (err) => {
        console.log('client error :' + err.stack);
        client.close();
    });

    client.send(message, 0, message.length, port, host, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message : ' + message + ' sent to ' + host + ':' + port);
    });
}

SRRdevice.prototype.generatePacket = function (action, data = null)
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

    if (action == 'reboot_srr')
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
        packet = this.generatePacketHex(action_id);
    } else if (action == 'get_status_short')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'get_status_all')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'get_reboot_counters')
    {
        packet = this.generatePacketHex(action_id);
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
    } else if (action == 'get_config')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'set_config')
    {
        packet = this.generatePacketHex(action_id);
    } else if (action == 'get_eb_list')
    {
        packet = this.generatePacketHex(action_id);
    }

    return packet;
}

SRRdevice.prototype.generatePacketHex = function(action, data = "")
{
    var firstByte = "ff";
    var device = "00";
    var mac = "485053" + this.serial;

    // The byteCount = 7 + data.length/2
    var byteCount;
    if (data == "") {
        byteCount = "07";
    } else
    {
        console.log(data);
        console.log(data.length);

        byteCount = 7 + (data.length/2);
        byteCount = byteCount.toString();
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
        mac.substring(10,12)
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

    //console.log(tmp);
    //console.log(checksum);

    checksum = (checksum % 256).toString(16);
    checksum = this.pad('00', checksum, true);

    //console.log(checksum);

    var packet = firstByte + device + byteCount + action + mac + data + checksum;

    //console.log(packet);

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
SRRdevice.prototype.checkResponse = function(packet, action)
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

    data.serial = "";
    for (var i = 7 ; i<= 9 ; i++)
    {
        data.serial += this.pad("00", packet[i].toString(16), true);
    }

    data.data = "";
    for (var i = 8; i < data.packet_length; i++) {
        data.data += this.pad("00", packet[i+2].toString(16), true);
    }

    console.log(data);

    if (data.first_byte != "ff")
    {
        console.log("Error : Wrong first byte => should be ff");
    }

    if (data.device_type != 0)
    {
        console.log("Error : Wrong device type : should be 0 and not " + data.device_type);
    }

    if (data.serial != this.serial)
    {
        console.log("Error : Wrong serial => should be " + this.serial + " and not " + data.serial);
    }

    if (data.action != this.actions[action]) {
        console.log("Error : Wrong action : should be " + this.actions[action] + " and not " + data.action);
    }

    return data;
}

SRRdevice.prototype.decodePacket = function(action, packet)
{
    console.log("=== Decode Packet ===");
    console.log(packet);

    var data = this.checkResponse(packet, action);
    var output = {};

    if (action == "get_status") {
        console.log("=== " + action + " ===");
        output.action = action;

        var slot_status = parseInt(data.data, 16).toString(2);
        console.log(slot_status);

        output.data = {};
        for (var i = 0 ; i<8 ; i++)
        {
            if (slot_status[i] == 1) {
                output.data[8-i] = true;
            } else {
                output.data[8-i] = false;
            }
        }

        console.log(output);
        return output;
    } else if (action == "get_version")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {version: this.hexToASCII(data.data)};

        console.log(output);
        return output;
    } else if (action == "get_reboot_counters")
    {
        console.log("=== " + action + " ===");
        output.action = action;

        var reboot_counters = {};
        for (var i = 0 ; i<8 ; i++)
        {
            reboot_counters[i+1] = parseInt(data.data[4*i+2] + data.data[4*i+3] + data.data[4*i] + data.data[4*i+1],16);
        }

        output.data = reboot_counters;

        console.log(output);
        return output;
    } else if (action == "get_eb_list")
    {
        console.log("=== " + action + " ===");
        output.action = action;

        output.data = {};

        output.data.nb_eb = parseInt(data.data[2] + data.data[3] + data.data[0] + data.data[1],16);
        for (var i = 0 ; i < output.data.nb_eb ; i++)
        {
            output.data.eb_list = [data.data[4+6*i+0] + data.data[4+6*i+1] + data.data[4+6*i+2] + data.data[4+6*i+3] + data.data[4+6*i+4] + data.data[4+6*i+5]];
        }

        console.log(output);
        return output;
    } else if (action == "get_config")
    {
        console.log("=== " + action + " ===");
        output.action = action;

        output.data = {};

        output.data.host = parseInt(data.data[0] + data.data[1],16) + "." +
        parseInt(data.data[2] + data.data[3],16) +  "." +
        parseInt(data.data[4] + data.data[5],16) +  "." +
        parseInt(data.data[6] + data.data[7],16);

        output.data.udp_port = parseInt(data.data[10] + data.data[11] + data.data[8] + data.data[9],16);
        output.data.http_port = parseInt(data.data[14] + data.data[15] + data.data[12] + data.data[13],16);

        output.data.keep_alive = parseInt(data.data[16] + data.data[17],16) * 10;
        output.data.long_reset = parseInt(data.data[18] + data.data[19],16);

        var hostname = '';
        for (var i = 20 ; i < data.data.length - 2 ; i++)
        {
            hostname += data.data[i];
        }
        output.data.hostname = this.hexToASCII(hostname);

        console.log(output);

        return output;
    } else if (action == "get_status_short")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {};
        output.data.slots = {};

        for (var i = 0 ; i < 8; i++)
        {
            var slot = {};
            slot.id = i+1;
            slot.status = parseInt(data.data[2*i] + data.data[2*i+1], 16);

            console.log(slot);
            output.data.slots[i+1] = slot;
        }


        console.log(output);
        return output;
    } else if (action == "get_status_all")
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {};
        output.data.slots = [];

        for (var i = 0 ; i < 8; i++)
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

            console.log(slot);
            output.data.slots.push(slot);
        }

        console.log(output);
        return output;
    } else if ((action == "turn_on")||(action == "turn_off")||(action == "reset_fast")||(action == "reset_long"))
    {
        console.log("=== " + action + " ===");

        output.action = action;
        output.data = {status: "ok"};

        //console.log(output);
        return output;
    }
}




    

