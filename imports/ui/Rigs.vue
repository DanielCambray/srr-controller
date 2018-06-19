<template>

    <div class="container">

        <h1>SRR Monitor</h1>

        <div class="row">
            <div v-if="!$subReady.rigs">Loading...</div>

            <div class="col-md-3" v-for="rig in rigs">

                <div v-bind:class="{'panel panel-success': rig.state>0, 'panel panel-danger': rig.state==0}">
                    <div class="panel-heading">
                        <h3 class="panel-title">{{ rig.slot }} - {{ rig.name }}</h3>
                    </div>
                    <div class="panel-body">
                        <p>{{rig.description}}</p>
                        <p>{{rig.state}}</p>
                        <p>{{rig.keep_alive}}</p>
                    </div>
                    <div class="panel-footer">
                        <button v-if="rig.state>0" @click="srr_command('turn_off', rig.slot, rig._id)" type="button" class="btn btn-default pull-right">Turn Off</button>
                        <button v-if="rig.state==0" @click="srr_command('turn_on', rig.slot, rig._id)" type="button" class="btn btn-default pull-right">Turn On</button>
                        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Reset
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a href="#" @click="srr_command('fast_reset', rig.slot, rig._id)">Fast Reset</a></li>
                            <li><a href="#" @click="srr_command('long_reset', rig.slot, rig._id)">Long Reset</a></li>
                        </ul>
                    </div>

                </div>

            </div>

        </div>

    </div>
</template>

<script lang="ts">

    import { Rigs } from '/both/collections/rigs.collection';
    import { Rig } from '/both/models/rig.model';

    export default {
        data() {
            return {
                rigs: [],
                settings: Meteor.settings,
            }
        },

        meteor: {
            $subscribe: {
                'rigs': []
            },
            rigs() {
                return Rigs.find();
            }
        },

        methods: {
            srr_command(cmd, slot, id) {
                return Meteor.call('srr_command',cmd,slot,id);
            }
        }
    }

</script>