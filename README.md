# `static-google-site-deploy` GitHub Action
Will automatically remove all .html extensions from files prior to uploading, then sync your selected bucket with the `build_path`. Once the files are synced it will find every file detected as an HTML file and set their metadata to `text/html` allowing routing to work without the .html extension

## Prerequisites
Have an Auth step & SDK install step before running this step, without these this action will not be able to execute.
```yml
# GCP Auth
- name: Google Auth
    id: auth
    uses: 'google-github-actions/auth@v0'
    with:
        token_format: 'access_token'
        create_credentials_file: true
        workload_identity_provider: '${{ secrets.GCP_WIF_PROVIDER }}' # e.g. - projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider
        service_account: '${{ secrets.GCP_SERVICE_ACC }}' # e.g. - my-service-account@my-project.iam.gserviceaccount.com

# GCP SDK
- name: 'Set up Cloud SDK'
    uses: 'google-github-actions/setup-gcloud@v0'
    with:
        install_components: 'gsutil'
```

## Inputs
- `bucket_name` (required) - What storage bucket do you want to use?
- `build_path` (optional) - What folder do the static files output to or exist in?
    - Defaults to: 'out'
- `home_page` (optional) - What is the path (within `build_path`) to the file you want to use for the landing page?
    - Defaults to: 'index.html'
- `error_page` (optional) - What is the path (within `build_path`) to the file you want to display an error page for?
    - Defaults to: '404.html'

## Example
```yml
name: Example

on:
    push:
        branches: ["production"]

env:
  BUCKET: 'test-ga-deploy'
  STATIC_FILES: 'example_site'

jobs:
  test:
    permissions:
      contents: 'write'
      id-token: 'write'

    runs-on: ubuntu-latest
    steps:
      # Get source
      - name: Checkout
        id: checkout
        uses: actions/checkout@v3

      # GCP Auth
      - name: Google Auth
        id: auth
        uses: 'google-github-actions/auth@v0'
        with:
          token_format: 'access_token'
          create_credentials_file: true
          workload_identity_provider: '${{ secrets.GCP_WIF_PROVIDER }}' # e.g. - projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider
          service_account: '${{ secrets.GCP_SERVICE_ACC }}' # e.g. - my-service-account@my-project.iam.gserviceaccount.com

      # GCP SDK
      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v0'
        with:
          install_components: 'gsutil'

      # Install node
      - name: Use Node.js 16.13
        uses: actions/setup-node@v3
        with:
          node-version: '16.13'

      # Build new files for env.STATIC_FILES
      - name: Build
        id: build
        run: yarn install && yarn build

      # Publish
      - name: Google Cloud Bucket Publish
        id: publish
        uses: 'Austinhs/static-google-site-deploy@v1'
        with:
          bucket_name: '${{ env.BUCKET }}'
          build_path: '${{ github.workspace }}/${{ env.STATIC_FILES }}'
```