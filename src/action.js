const core        = require('@actions/core');
const { Storage } = require('@google-cloud/storage');
const fs          = require('fs');
const glob        = require('glob');

async function run() {
    if(process.env.GCLOUD_PROJECT === 'undefined') {
        throw new Error("Ensure that you use 'google-github-actions/auth@v0' before executing this action.");
    }

    const BUCKET_NAME = core.getInput('bucket_name');
    const BUILD_PATH  = core.getInput('build_path');
    const HOME_PAGE   = core.getInput('home_page').replace('.html', '');
    const ERROR_PAGE  = core.getInput('error_page').replace('.html', '');

    // Remove .html extension from all files
    const html_files = [];
    for(const file of glob.sync(`${BUILD_PATH}/**/*.html`)) {
        const new_file = file.replace('.html', '');
        fs.renameSync(file, new_file);
        html_files.push(new_file);
    }

    // Sync files with bucket
    await exec(`gsutil config`);
    await exec(`gsutil rsync -R ${BUILD_PATH} gs://${BUCKET_NAME}`);
    await exec(`gsutil web set -m "${HOME_PAGE}" -e "${ERROR_PAGE}" gs://${BUCKET_NAME}`);

    // Change content type for html_files
    const storage = new Storage();
    const bucket  = storage.bucket(BUCKET_NAME);
    for(const file_path of html_files) {
        const file = bucket.file(file_path);
        await file.setMetadata({ contentType: 'text/html' });
    }
}

function exec(command) {
    return new Promise((resolve, reject) => {
        const process = require('child_process').exec(command);
        const stderr = [];

        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data.toString()} `);
        })

        process.stderr.on('data', (data) => {
            stderr.push(data.toString());
            console.log(`stderr: ${data.toString()} `);
        })

        process.on('exit', (code) => {
            if(code === 0) {
                resolve(code);
            } else if(code != null) {
                stderr.push(`Process exited with code ${code.toString()}`);
                reject(stderr.join('\n'));
            }
        });
    });
}

run();