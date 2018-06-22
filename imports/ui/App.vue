<template>
    <div class="app container">
        <srrs></srrs>
        <ebs></ebs>
        <slots></slots>
    </div>
</template>

<script lang="typescript">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import Rigs from './Rigs.vue';
    import Srrs from './Srrs.vue';
    import Ebs from './Ebs.vue';
    import Slots from './Slots.vue';

    export default {
        data() {
            return {
            }
        },
        meteor: {
            data: {
            }
        },
        methods: {
        },
        components: {
            Rigs,
            Srrs,
            Ebs,
            Slots
        },
        metaInfo: {
            title: 'SRR Monitor',
        }
    }
</script>

<style>
    body {
        margin: 30px;
    }

    a {
        color: #b82a39;
        text-decoration: none;
    }

    h1, h2 {
        font-weight: normal;
    }
</style>
