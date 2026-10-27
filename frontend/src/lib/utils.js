export function readSaved(key, fallback) {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}}
export function save(key,value) {try {localStorage.setItem(key,JSON.stringify(value));return true;} catch {return false;}}
export function validateFile(file) {if(!/\.(pdf|md|txt)$/i.test(file.name)) return 'Choose a PDF, Markdown (.md), or text (.txt) file.';if(file.size>50*1024*1024)return 'This file is over 50 MB. Try a smaller file.';if(!file.size)return 'This file is empty. Choose another file.';return '';}
export const size = bytes => bytes<1024 ? `${bytes} B` : bytes<1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;
export function consumeEvents(buffer, onEvent, flush=false) {const lines=buffer.split(/\r?\n/);const rest=flush?'':lines.pop();for(const line of lines)if(line.startsWith('data:')) {try{onEvent(JSON.parse(line.slice(5).trim()));}catch(e){if(!(e instanceof SyntaxError))throw e;}}return rest;}
