import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './app.service';
const fetch = require( "node-fetch" );
const { execSync } = require( "child_process" );
const fs = require( "fs" );
const { log } = console;
const TelegramBot = require( "node-telegram-bot-api" );
const map = {
        "/help": help,
};
let bot;



async function handleNLP( input:any )
{
        let msg = input;
        let { text } = msg;
        if ( map[text] ) return map[text]( msg );
        let headers = 
        {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
        };
        let summary = fs.readFileSync('convo.txt','utf8');
        let GPT3Prompt = "\n" + summary;
        let body = JSON.stringify({
                prompt: `${GPT3Prompt} "${text}"\n\n`,
                max_tokens: 600,
                model: "text-davinci-003",
                temperature: 0.9
        });
        log ( body );
        let url = "https://api.openai.com/v1/completions";
        let req = {
                method: "POST",
                headers: headers,
                body: body
        }
        let resp = await fetch( url, req );
        let aiReply = await resp.json();
        if (aiReply && aiReply.choices && aiReply.choices.length > 0 && aiReply.choices[0].text) {
                text = aiReply.choices[0].text;
                } else {
                text = "Sorry. I didn't understand that. Maybe try something else?";
        };
        text = text.replace( /^\n*/, "" );
        let memory = makeMemory (msg, text);
        fs.appendFileSync('convo.txt', memory );
        log( "aiReply", aiReply );
        if ( map[text] )
        {
                map[text]( msg );
        } else {
                return bot.sendMessage( msg.chat.id, text );
        }

}
function help( msg:any ) 
{
        let message = "here are the available commands\n\n";
        for( let p in map ) message += p + "\n";
        return bot.sendMessage( msg.chat.id, message );
}

function defaultHTTPResponse()
{
        return '{ "message": "api is working" }\n'
}

function makeMemory (msg, text)
{
        let human= processHuman( msg );
        log ( human );
        let andy = processAi( text );
        log ( andy );
        let id = processData( msg );
        let memory = id + human + andy;
        return memory;
}

function processHuman( msg:any )
{
        let human = msg.chat.first_name + ":" + msg.text + " "; 
        return human;          
}

function processAi( text:any )
{
        let andy = "Andy" + ":" + text + " ";
        return andy;
}

function processData( msg:any )
{
        let id = "||id:" + msg.message_id +" ";
        return id;
}

function setupTelegram()
{
        bot = new TelegramBot(
                "5867322560:AAHe44N_tloKzZhX7rMgKYYSHvwKF1rvNi4",
                {polling:true}
        );
        bot.onText( /./, handleNLP );
}

@Controller() export class TelegramController {
        constructor() {
                setupTelegram();
        }
        @Get() defaultHTTPResponse() {
                defaultHTTPResponse();
        }
}
