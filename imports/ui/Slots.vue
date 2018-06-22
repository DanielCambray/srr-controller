<template>

    <div class="container">

        <h1>Slot Monitor</h1>

        <div class="row">
            <div v-if="!$subReady.slots">Loading...</div>

            <div class="col-md-1" v-for="slot in slots">
                <div v-if="slot.state>0" style="background-color:#0d0;height:50px;width:50px;-moz-border-radius:25px;-webkit-border-radius: 25px;text-align:center; line-height:50px">{{slot.number}}</div>
                <div v-if="slot.state==0" style="background-color:#d00;height:50px;width:50px;-moz-border-radius:25px;-webkit-border-radius: 25px;text-align:center; line-height:50px">{{slot.number}}</div>
            </div>
        </div>

        <div class="row">
            <div v-if="!$subReady.slots">Loading...</div>

            <div class="col-md-3" v-for="slot in slots">

                <div v-bind:class="{'panel panel-success': slot.state>0, 'panel panel-danger': slot.state==0}">
                    <div class="panel-heading">
                        <h3 class="panel-title">{{ slot.number }} - {{ slot.name }}</h3>
                    </div>
                    <div class="panel-body">
                        <p>{{slot.description}}</p>
                        <p>{{slot.state}}</p>
                        <p>{{slot.keep_alive}}</p>
                    </div>
                    <div class="panel-footer">
                        <button v-if="slot.state>0" @click="srr_command('turn_off', {slot: slot.number, srr_serial:slot.srr_serial, eb_serial: slot.eb_serial})" type="button" class="btn btn-default pull-right">Turn Off</button>
                        <button v-if="slot.state==0" @click="srr_command('turn_on', {slot: slot.number, srr_serial:slot.srr_serial, eb_serial: slot.eb_serial})" type="button" class="btn btn-default pull-right">Turn On</button>
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Reset
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a href="#" @click="srr_command('reset_fast', {slot: slot.number, srr_serial:slot.srr_serial, eb_serial: slot.eb_serial})">Fast Reset</a></li>
                            <li><a href="#" @click="srr_command('reset_long', {slot: slot.number, srr_serial:slot.srr_serial, eb_serial: slot.eb_serial})">Long Reset</a></li>
                        </ul>
                    </div>

                </div>

            </div>

        </div>

    </div>

</template>

<script lang="ts">

    import { Slots } from '/both/collections/slots.collection';
    import { Slot } from '/both/models/slot.model';

    export default {
        data() {
            return {
                slots: [],
                settings: Meteor.settings,
            }
        },

        meteor: {
            $subscribe: {
                'slots': []
            },
            slots() {
                return Slots.find({},{sort:{srr_serial:1, eb_serial:1, number:1}});
            }
        },

        methods: {
            srr_command(cmd, slot, id) {
                return Meteor.call('srr_command',cmd,slot,id);
            }
        }
    }

</script>