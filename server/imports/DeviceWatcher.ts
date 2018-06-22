import {Slots} from "../../both/collections/slots.collection";
import {SRRs} from "../../both/collections/srrs.collection";
import {EBs} from "../../both/collections/ebs.collection";

export function DeviceWatcher(){

}

DeviceWatcher.prototype.updateSRR = function(serial, output)
{
    console.log("=== UPDATE SRR INFO ===");
    //console.log(serial);
    //console.log(output);

    // We look for the SRR device
    var srr = SRRs.findOne({serial: serial});
    
    if (output.action == "get_version")
    {
        SRRs.update({serial: serial}, {$set:{version: output.data.version}} );
    } else if (output.action == "get_config")
    {
        SRRs.update({serial: serial}, {$set:{
                host: output.data.host,
                udp_port: output.data.udp_port,
                http_port: output.data.http_port,
                keep_alive: output.data.keep_alive,
                long_reset: output.data.long_reset,
                hostname: output.data.hostname
            }});
    } else if (output.action == "get_status_all")
    {
        for (var i = 0 ; i < output.data.slots.length; i++) {
            Slots.upsert({srr_serial: srr.serial, number: output.data.slots[i].id}, {$set:{
                    state: output.data.slots[i].state,
                    keep_alive: output.data.slots[i].keep_alive,
                    always_on: output.data.slots[i].always_on,
                    watchdog_on: output.data.slots[i].watchdog_on,
                    status_name: output.data.slots[i].status_name,
                    next_action: output.data.slots[i].next_action
                }});
        }
    } else if (output.action == "get_eb_list")
    {
        for (var i = 0 ; i < output.data.eb_list.length ; i++)
        {
            ebSerial = output.data.eb_list[i];

            EBs.upsert({serial: ebSerial}, {$set:{
                serial: ebSerial,
                srr_serial: srr.serial,
                srr_id: srr._id
                }});

        }
    }
}

DeviceWatcher.prototype.updateEB = function(data, output)
{
    console.log("=== UPDATE EB INFO ===");
    //console.log(data);
    //console.log(output);

    // We look for the SRR device
    var eb_serial = data.eb_serial;
    var srr_serial = data.srr_serial;
    var eb = EBs.findOne({serial: eb_serial});

    if (output.action == "get_version") {
        EBs.update({serial: eb_serial}, {$set:{version: output.data.version}} );
    } else if (output.action == "get_status_short")
    {
        for (var i = 0 ; i < output.data.slots.length; i++) {
            Slots.upsert({srr_serial: srr_serial, eb_serial: eb_serial, number: output.data.slots[i].id}, {$set:{
                    state: output.data.slots[i].state,
                    keep_alive: output.data.slots[i].keep_alive,
                    always_on: output.data.slots[i].always_on,
                    watchdog_on: output.data.slots[i].watchdog_on,
                    status_name: output.data.slots[i].status_name,
                    next_action: output.data.slots[i].next_action
                }});
        }
    }
}