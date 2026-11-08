import { spawn } from 'node:child_process';
const children=[
  spawn(process.execPath,['server/index.mjs'],{stdio:'inherit',env:process.env}),
  spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit',env:process.env}),
];
let stopped=false;
const stop=()=>{if(stopped)return;stopped=true;for(const child of children)if(child.exitCode===null)child.kill();};
process.on('SIGINT',stop);process.on('SIGTERM',stop);
for(const child of children)child.on('exit',code=>{if(!stopped){stop();process.exitCode=code||1;}});
