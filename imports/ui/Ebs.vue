<template>

    <div class="container">

        <h1>EB Settings</h1>

        <div class="row">
            <div v-if="!$subReady.ebs">Loading...</div>

                <table class="table">
                    <thead>
                    <tr>
                        <th>SRR</th>
                        <th>Serial</th>
                        <th>Version</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr v-for="eb in ebs">
                            <td>{{eb.srr_serial}}</td>
                            <td>{{eb.serial}}</td>
                            <td>{{eb.version}}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

        </div>

    </div>

</template>

<script lang="ts">

    import { EBs } from '/both/collections/ebs.collection';
    import { EB } from '/both/models/eb.model';

    export default {
        name: 'ebs',
        data() {
            return {
                ebs: []
            }
        },

        meteor: {
            $subscribe: {
                'ebs': []
            },
            ebs() {
                return EBs.find();
            }
        },

        methods: {

        }
    }

</script>