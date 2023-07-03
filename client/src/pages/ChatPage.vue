<template>
    <div class="row items-center justify-evenly">
        <q-page>
            <h2>{{ messageFromExpress }}</h2>

            <div id="q-app" style="min-height: 100vh;">
                <div class="q-pa-md row justify-center">
                    <div style="width: 100%; max-width: 400px">
                        <q-chat-message v-for="msg in messages" :text="[msg]" :key="msg"></q-chat-message>
                    </div>
                </div>
                <div class="q-pa-md">
                    <q-input v-model="messageToServer" label="Standard"></q-input>
                </div>
                <button class="q-btn q-ma-xl" @click="sendToServer">Send</button>
            </div>
        </q-page>
    </div>
</template>


<script lang="ts">

import { defineComponent, onMounted, ref, watchEffect } from 'vue'
import { io } from 'socket.io-client'

interface Message {
    connectionMessage?: string | undefined;
    message?: string | undefined;
}

type Value = {
    value: string | undefined;
}

export default defineComponent({
    name: 'ChatPage',
    setup() {
        const socket = io("http://localhost:3001", {
            auth: {
                token: 'secret'
            }
        });
        const messageFromExpress: Value = ref('');
        const messageToServer = ref('');
        const messages = ref<string[]>([]);

        onMounted((): void => {
            socket.on('connected', (arg: string) => {
                messages.value.push(arg)
            });
            socket.on('connection_error', (arg: Message) => {
                console.log(arg.message);
            });
        });

        watchEffect(async (): Promise<void> => {
            const res = await fetch('http://localhost:3000/hello')
            let data: { msg: string | undefined } = await res.json();
            messageFromExpress.value = data.msg;

            socket.on('send', (messageFromServer: { messageToClient: string }): void => {
                messages.value.push(messageFromServer.messageToClient)
            })
        })

        const sendToServer = () => {
            socket.emit('message', messageToServer.value)
            messageToServer.value = ''
        }

        return {
            messageFromExpress,
            socket,
            messageToServer,
            sendToServer,
            messages
        }

    }
})
</script>

