const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')

const reactions = { a: '🇦', b: '🇧', c: '🇨', d: '🇩', e: '🇪', f: '🇫', g: '🇬', h: '🇭',
    i: '🇮', j: '🇯', k: '🇰', l: '🇱', m: '🇲', n: '🇳', o: '🇴', p: '🇵', q: '🇶',
    r: '🇷', s: '🇸', t: '🇹', u: '🇺', w: '🇼', x: '🇽', y: '🇾', z: '🇿',

    0: '0⃣', 1: '1⃣', 2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
    6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣'
}

module.exports = class TextReact extends Plugin {
    async startPlugin() {
        const { getChannelId } = await getModule(['getLastSelectedChannelId'])
        const { addReaction } = await getModule(['addReaction'])
        const { getMessages, getMessage } = await getModule(['getMessages'])

        this.registerCommand('react', [],
            'React on message with regional indicators',
            '{c} <text> [message id]',
            async args => {
                if(!args[0]) {
                    return { send: false, result: 'You must enter some text to react' }
                }
                let messageid = args[1], channel = getChannelId(), limit = false
                if(!messageid) {
                    const messages = getMessages(channel)._array
                    if(messages.length == 0) return { send: false, result: 'Could not get last message id, please enter message id manually' }
                    messageid = messages[messages.length - 1].id
                }
                if(!getMessage(channel, messageid)) return { send: false, result: 'Could not find message with this id' }

                const text = args[0].toLowerCase().split('')
                for (let i = 0; i < text.length; i++) {
                    if(!reactions[text[i]]) continue

                    const message = getMessage(channel, messageid)
                    if(!message.reactions.find(r => r.emoji.name == reactions[text[i]] && r.me)) {
                        if(message.reactions.length != 20) addReaction(channel, messageid, { name: reactions[text[i]] })
                        else { limit = true; continue }

                        await new Promise(r => setTimeout(r, 350)) // avoid ratelimit
                    }
                }

                if(limit) return { send: false, result: 'Your reaction(s) was not added because there are too many reactions on this message.' }
            }
        )
    }
}
