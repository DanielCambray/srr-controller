<template>

    <div class="container">

        <h1>Slot Monitor</h1>

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
                        <button v-if="slot.state>0" @click="srr_command('turn_off', slot.slot, slot._id)" type="button" class="btn btn-default pull-right">Turn Off</button>
                        <button v-if="slot.state==0" @click="srr_command('turn_on', slot.slot, slot._id)" type="button" class="btn btn-default pull-right">Turn On</button>
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Reset
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a href="#" @click="srr_command('fast_reset', slot.slot, slot._id)">Fast Reset</a></li>
                            <li><a href="#" @click="srr_command('long_reset', slot.slot, slot._id)">Long Reset</a></li>
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
                return Slots.find();
            }
        },

        methods: {
            srr_command(cmd, slot, id) {
                return Meteor.call('srr_command',cmd,slot,id);
            }
        }
    }

</script>