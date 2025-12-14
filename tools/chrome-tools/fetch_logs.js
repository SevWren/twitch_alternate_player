
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const OUTPUT_FILE = 'captured_console_logs.json';
const LOGS = [];

function getTargets() {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function collectLogs(target) {
    return new Promise((resolve) => {
        if (!target.webSocketDebuggerUrl) {
            resolve();
            return;
        }

        console.log(`Connecting to: ${target.title} (${target.url})`);
        const ws = new WebSocket(target.webSocketDebuggerUrl);

        ws.on('open', () => {
            // Enable Runtime and Log domains
            ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
            ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
        });

        ws.on('message', (data) => {
            const msg = JSON.parse(data);
            
            if (msg.method === 'Runtime.consoleAPICalled') {
                LOGS.push({
                    timestamp: new Date().toISOString(),
                    targetTitle: target.title,
                    targetUrl: target.url,
                    type: 'consoleAPI',
                    level: msg.params.type, // log, warning, error
                    args: msg.params.args.map(a => a.value || a.description || a.type)
                });
            } else if (msg.method === 'Log.entryAdded') {
                LOGS.push({
                    timestamp: new Date().toISOString(),
                    targetTitle: target.title,
                    targetUrl: target.url,
                    type: 'logEntry',
                    level: msg.params.entry.level,
                    text: msg.params.entry.text,
                    source: msg.params.entry.source,
                    url: msg.params.entry.url
                });
            }
        });

        // Keep connection open for a short while to catch buffered logs
        setTimeout(() => {
            ws.close();
            resolve();
        }, 2000);
        
        ws.on('error', (e) => {
            console.error(`Error with ${target.title}: ${e.message}`);
            resolve(); // Don't block
        });
    });
}

async function main() {
    try {
        const targets = await getTargets();
        console.log(`Found ${targets.length} targets.`);
        
        // Filter for likely relevant targets (pages and extensions)
        const relevantTargets = targets.filter(t => 
            t.type === 'page' || t.type === 'service_worker' || t.url.includes('extension')
        );

        console.log(`Processing ${relevantTargets.length} relevant targets...`);

        // Process sequentially to avoid overwhelming
        for (const target of relevantTargets) {
            await collectLogs(target);
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(LOGS, null, 2));
        console.log(`Saved ${LOGS.length} log entries to ${OUTPUT_FILE}`);

    } catch (err) {
        console.error('Main error:', err);
    }
}

main();
