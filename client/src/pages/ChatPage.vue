<template>
    <div class="row items-center justify-evenly">
        <q-page>
            <h2>{{ hello }}</h2>

            <div id="q-app" style="min-height: 100vh;">
                <div class="q-pa-md row justify-center">
                    <div style="width: 100%; max-width: 400px">
                        <q-chat-message v-for="msg in messages" :text="[msg]" :key="msg"></q-chat-message>
                    </div>
                </div>
                <div class="q-pa-md">
                    <q-input v-model="text" label="Standard"></q-input>
                </div>
                <button class="q-btn q-ma-xl" @click="send">Send</button>
            </div>
        </q-page>
    </div>
</template>


<script lang="ts">

import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import { io } from 'socket.io-client'

interface Message {
    newMessage?: string | undefined;
    anotherMessage?: string | undefined;
    message?: string | undefined;
}

type Value = {
    value: string | undefined;
}

export default defineComponent({
    name: 'ChatPage',
    setup() {
        const socket = io("http://localhost:3001");
        const hello: Value = ref('');
        const message: Value = ref('');
        const anotherMessage: Value = ref('');
        const text = ref('');
        const messages = ref<string | undefined[]>([]);

        watchEffect(async (): Promise<void> => {
            const res = await fetch('http://localhost:3000/hello')
            let data: { msg: string | undefined } = await res.json();
            hello.value = data.msg;

            socket.on('send', (arg: Message) => {
                message.value = arg.newMessage
                messages.value.push(arg.newMessage)
            })
        })

        onMounted((): void => {
            socket.on('connected', (arg: Message) => {
                console.log(arg.message, arg.anotherMessage);
            })

        })

        const send = () => {
            socket.emit('message', text.value)
            text.value = ''
        }

        return {
            hello,
            socket,
            message,
            anotherMessage,
            text,
            send,
            messages
        }

    }
})
</script>

