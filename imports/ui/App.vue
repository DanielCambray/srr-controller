<template>
    <div class="app container">
        <rigs></rigs>
    </div>
</template>

<script lang="typescript">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import Rigs from './Rigs.vue';

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
