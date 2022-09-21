const fs = require('fs');
const glob = require('glob');

async function main() {
    for(const file of glob.sync(`out/**/*`)) {
        console.log(file);
    }
}

main().catch(err => console.log(err));