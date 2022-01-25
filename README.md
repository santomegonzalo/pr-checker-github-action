# PR Checker Github Actions

## Description

This action will verify the following rules:

- The PR includes at least one of the labels specified in the action configuration.
- The PR should include the following patter on the title `[NOJIRA] foo` or `[FG-123] foo`.

You will not be able to merge the Pull Request if the action is not passing both checks.

## Inputs

- `required_labels` **required** The labels that are required to be present on the Pull Request.
- `title_regex` **required** The regex that the title should match.
- `gh_token`: **required** The Github token to use to authenticate and create the result comment.

## Example usage

```
on:
  pull_request:
    # we recommend to use it on every pull request event
    types:
      - opened
      - synchronize
      - reopened
      - labeled
      - unlabeled
      - edited
jobs:
  check_labels:
    runs-on: ubuntu-latest
    name: Check required labels and title
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: PR Checker
        uses: santomegonzalo/pr-checker-github-actions@v1
        with:
          gh_token: ${{ secrets.GITHUB_TOKEN }}
          jira_title_regex: ^\[(([A-Z][A-Z0-9]+-[0-9]+)|NOJIRA)\]
          required_labels: "feature,bug,documentation,chore"

```
