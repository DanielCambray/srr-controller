<template>

    <div class="container">

        <h1>SRR Settings</h1>

        <div class="row">
            <div v-if="!$subReady.srrs">Loading...</div>


                <table class="table">
                    <thead>
                    <tr>
                        <th>Hostname</th>
                        <th>Host</th>
                        <th>Udp Port</th>
                        <th>Http Port</th>
                        <th>Serial</th>
                        <th>Mac</th>
                        <th>Version</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="srr in srrs">
                            <td>{{srr.hostname}}</td>
                            <td>{{srr.host}}</td>
                            <td>{{srr.udp_port}}</td>
                            <td>{{srr.http_port}}</td>
                            <td>{{srr.serial}}</td>
                            <td>{{srr.mac}}</td>
                            <td>{{srr.version}}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

        </div>

    </div>

</template>

<script lang="ts">

    import { SRRs } from '/both/collections/srrs.collection';
    import { SRR } from '/both/models/srr.model';

    export default {
        name: 'srrs',
        data() {
            return {
                srrs: []
            }
        },

        meteor: {
            $subscribe: {
                'srrs': []
            },
            srrs() {
                return SRRs.find();
            }
        },

        methods: {

        }
    }

</script>