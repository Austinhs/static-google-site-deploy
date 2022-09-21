const core = require('@actions/core');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const glob = require('glob');

async function run() {
    if(process.env.GCLOUD_PROJECT === 'undefined') {
        throw new Error("Ensure that you use 'google-github-actions/auth@v0' before executing this action.");
    }

    const BUCKET_NAME = core.getInput('bucket_name');
    const BUILD_PATH  = core.getInput('build_path');

    const storage = new Storage();
    const bucket  = storage.bucket(BUCKET_NAME);

    // Delete all files in bucket
    await bucket.deleteFiles();

    // Remove .html extension from all files
    const html_files = [];
    for(const file of glob.sync(`${BUILD_PATH}/**/*.html`)) {
        const new_file = file.replace('.html', '');
        fs.renameSync(file, new_file);
        html_files.push(new_file);
    }

    console.log(html_files);

    // await bucket.upload(BUILD_PATH);
}

run();