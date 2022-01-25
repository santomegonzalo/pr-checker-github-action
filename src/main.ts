import core from "@actions/core";
import github from "@actions/github";

import { getInputArray } from "./utils";

type GithubLabel = {
  name: string;
  color: string;
};

const SUCCESS_MESSAGE =
  ":rocket: Your PR has all required labels and Jira ticket :rocket:";

class PrChecker {
  private prNumber: number;
  private labels: GithubLabel[];
  private requiredLabels: string[];
  private jiraRegExp: RegExp;
  private octokit;

  constructor(
    prNumber: number,
    labels: GithubLabel[],
    requiredLabels: string[],
    ghToken: string,
    jiraRegex: string
  ) {
    this.prNumber = prNumber;
    this.labels = labels;
    this.requiredLabels = requiredLabels;

    this.jiraRegExp = new RegExp(jiraRegex);

    this.octokit = github.getOctokit(ghToken);
  }

  public async run() {
    this.checkLabels();
    this.checkTitle();
  }

  /**
   * Check if the PR title contains JIRA issue
   */
  private async checkTitle() {
    if (!this.jiraRegExp.test(github.context!.payload!.pull_request!.title)) {
      const errorMessage = `:eyes: Looks like your PR does not have a Jira number or NOJIRA on the title :rocket:`;

      if (!(await this.isLastComment(errorMessage))) {
        this.createComment(errorMessage);
      }

      core.setFailed("Please add Jira number or NOJIRA on the PR Title");
    }
  }

  /**
   * Check if the PR has all required labels and notify the user
   */
  private async checkLabels() {
    if (
      !this.requiredLabels.some((requiredLabel) =>
        this.labels.find((l: GithubLabel) => l.name === requiredLabel)
      )
    ) {
      const errorMessage = `:eyes: Looks like your PR does not have any required label assigned to it. Please :pray: assign one of the following: ${this.requiredLabels.join(
        ", "
      )} :rocket:`;

      if (!(await this.isLastComment(errorMessage))) {
        this.createComment(errorMessage);
      }

      core.setFailed(
        `Please select one of the required labels for this PR: ${this.requiredLabels}`
      );
    } else if (!(await this.isLastComment(SUCCESS_MESSAGE))) {
      this.createComment(SUCCESS_MESSAGE);
    }
  }

  /**
   * Create Github comment
   * @param body The message to post
   */
  private createComment(body: string) {
    this.octokit.rest.issues.createComment({
      ...github.context!.repo,
      issue_number: this.prNumber,
      body,
    });
  }

  /**
   * Check if the last comment has the given message already exists
   * @param message The message to check for
   * @returns Promise<boolean>
   */
  private async isLastComment(message: string) {
    const comments = await this.octokit.rest.issues.listComments({
      ...github.context!.repo,
      issue_number: this.prNumber,
    });

    if (comments.data.length === 0) {
      return false;
    }

    return comments.data[comments.data.length - 1].body === message;
  }
}

console.log('========', github.context);

new PrChecker(
  github.context!.payload!.pull_request!.number,
  github.context!.payload!.pull_request!.labels,
  getInputArray("required_labels"),
  core.getInput("gh_token"),
  core.getInput("jira_title_regex")
).run();
