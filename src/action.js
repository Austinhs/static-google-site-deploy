const core = require('@actions/core');
const { Storage } = require('@google-cloud/storage');
// const github = require('@actions/github');

async function run() {
    if(process.env.GCLOUD_PROJECT === 'undefined') {
        throw new Error("Ensure that you use 'google-github-actions/auth@v0' before executing this action.");
    }

    const BUCKET_NAME  = core.getInput('bucket_name');

    const storage = new Storage();
    const bucket  = storage.bucket(BUCKET_NAME);

    const files = await bucket.getFiles();
    console.log(files);
}

run().catch(err => console.error(err));